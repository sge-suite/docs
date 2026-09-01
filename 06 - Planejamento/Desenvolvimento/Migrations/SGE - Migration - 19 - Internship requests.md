---
title: SGE — Migration 19 — internship_requests
description: Contrato da solicitação única de abertura de estágio preenchida pelo discente.
type: migration-reference
status: planned
order: 19
table: internship_requests
tags:
  - sge/migrations
  - sge/estagio
  - sge/formularios
---
> [!todo] Estado
> Planejada. Implementa o formulário nativo de abertura antes de existir um estágio formalizado.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `affiliation_id` | FK obrigatória para o vínculo discente dono da solicitação. |
| `course_id` / `internship_type_id` | FKs obrigatórias fora de `Draft`; o tipo deve estar ativo e pertencer ao curso selecionado. |
| `advisor_affiliation_id` | FK nullable enquanto o Setor ainda não atribuiu orientador; obrigatória no aceite. |
| `granting_party_id` | FK nullable para a concedente já validada. |
| `granting_party_registration_request_id` | FK nullable para a solicitação pendente de cadastro; é alternativa a `granting_party_id`, nunca texto livre solto. |
| `supervisor_affiliation_id` | FK nullable para o supervisor já cadastrado. |
| `supervisor_registration_request_id` | FK nullable para a solicitação pendente de cadastro; é alternativa a `supervisor_affiliation_id`. |
| `student_year_semester` | string nullable em `Draft`; período/semestre declarado pelo discente e congelado no snapshot no aceite. |
| `legal_capacity_declaration` | [[SGE - Enum - LegalCapacityDeclaration|`LegalCapacityDeclaration`]] nullable em `Draft`; rádio obrigatório no envio: maior, menor ou menor emancipado. |
| `legal_guardian_name` / `legal_guardian_cpf` / `legal_guardian_kinship` / `legal_guardian_email` | conjunto obrigatório quando a opção for `minor`; nulo para maior ou menor emancipado enquanto a comprovação estiver em análise. CPF normalizado. |
| `activities` | texto nullable em `Draft`; obrigatório no envio. |
| `internship_sector` | texto nullable; setor/área de realização, obrigatório se a concedente ou o tipo o exigir. |
| `weekly_hours` | JSONB nullable em `Draft`; mapa validado com domingo a sábado. |
| `planned_start_date` | data nullable em `Draft`; obrigatória no envio e usada para calcular o término. |
| `projected_end_date` | data nullable calculada no servidor; nunca editável pelo discente. |
| `is_remunerated` | boolean nullable em `Draft`; obrigatório no envio. |
| `grant_value` / `transportation_allowance` | decimal(10,2) nullable; bolsa obrigatória e positiva se remunerado; auxílio pode ser zero ou nulo. |
| `observations` | texto nullable; observações complementares. |
| `status` | [[SGE - Enum - InternshipRequestStatus|`InternshipRequestStatus`]]: rascunho, enviada, em análise, com pendência, aceita, recusada ou desistida. |
| `internship_id` | FK nullable e única para o estágio criado depois do aceite. |
| `terms_version` / `terms_content_hash` | versão e SHA-256 do texto institucional aceito no último envio. |
| `terms_accepted_at` | instante do aceite explícito; nulo em `Draft` e atualizado a cada reenvio. |
| timestamps | auditoria temporal. |

Há somente uma solicitação para o processo aberto pelo discente. Ela é atualizada no mesmo registro quando o discente salva ou responde uma pendência; o Livewire pode persistir valores nulos enquanto estiver em `Draft`. Nos demais estados, todos os campos obrigatórios do caminho condicional escolhido devem estar válidos; campos de ramos não escolhidos continuam nulos. Cada alteração relevante é registrada no [[SGE - Migration - Base 04 - Activity log|`activity_log`]], com atributos anteriores e novos quando permitido. Ao ser aceita pela primeira vez, os valores validados criam `internships`, que preserva as FKs e snapshots históricos próprios. Se a solicitação já possuir `internship_id`, uma correção aprovada atualiza apenas os campos autorizados do estágio existente, recalcula os derivados e preserva os documentos anteriores no histórico.

### Contrato de `weekly_hours`

```json
{
  "sunday": 0,
  "monday": 4,
  "tuesday": 4,
  "wednesday": 4,
  "thursday": 4,
  "friday": 4,
  "saturday": 0
}
```

As sete chaves sempre existem quando o formulário é enviado; cada valor é inteiro não negativo em horas. A soma semanal deve ser positiva e atender aos limites ordinários e às exceções declaradas em `internship_types.rules.workload_exceptions`. `projected_end_date` é recalculada a partir desta jornada, da carga exigida do tipo, do calendário e das pausas posteriormente registradas.

### Caminhos condicionais de cadastro

- Concedente: exatamente uma de `granting_party_id` ou `granting_party_registration_request_id` deve ser informada no envio. A segunda aponta para um registro próprio, com documento, endereço, representante, contatos, área, conselho e processo, aguardando análise do Setor.
- Supervisor: exatamente uma de `supervisor_affiliation_id` ou `supervisor_registration_request_id` deve ser informada no envio. A segunda preserva nome, telefone, e-mail, cargo, qualificação, formação e experiência até que o Setor crie/associe o vínculo de supervisor.
- Capacidade civil: o rádio oferece `adult`, `minor` e `emancipated_minor`. `adult` só é válido para quem tiver 18 anos completos na data do envio. `minor` exige os quatro campos de responsável legal. `emancipated_minor` exige ao menos uma [[SGE - Migration - 19A - Emancipation evidences|evidência]] enviada e dispensa responsável legal neste envio; o aceite final exige evidência aprovada pelo Setor. Se a devolução apontar comprovante inválido, o discente cria novo envio ou troca para `minor` e informa o responsável.
- Remuneração: `is_remunerated = true` exige `grant_value`; se for `false`, ambos os valores monetários ficam nulos, salvo decisão posterior que admita auxílio sem bolsa.

As duas solicitações pendentes de cadastro são estruturas de domínio próprias, conforme [[SGE - Cadastros pendentes de supervisor e concedente]] e [[SGE - Backlog e decisões#D-011 — Solicitações pendentes são registros próprios|D-011]]; não são JSON genérico nem notificações. As migrations que as criam devem preceder a FK desta tabela. Enquanto elas não existirem no código, este contrato não deve ser implementado de forma incompleta com campos de texto livres.

## Validações do formulário

- `affiliation_id` deve ser o vínculo discente ativo e autorizado;
- o curso deve ser elegível para o vínculo;
- ao escolher um curso, a interface apresenta apenas seus tipos de estágio ativos: um tipo é selecionado automaticamente quando for único; mais de um exige seleção explícita;
- a validação no servidor confirma a relação entre curso e tipo e aplica `workload_exceptions` do tipo à jornada diária e semanal;
- a parte concedente deve estar cadastrada antes de ser aceita; o número de processo de credenciamento é opcional e preenche o documento quando aplicável;
- a data prevista de término é calculada, e não digitada, a partir do tipo e da jornada.
- envio e reenvio exigem ação explícita de ciência; versão, hash do texto e instante são persistidos juntos.

## Checklist

- [x] Definir uma solicitação única pertencente ao vínculo discente.
- [x] Definir a associação única com o estágio criado após o aceite.
- [x] Definir curso, tipo e parte concedente como referências validadas.
- [x] Separar o enum de status da solicitação do status de `internships`.
- [x] Mapear todas as colunas do formulário de abertura e seus casts.
- [x] Fechar os critérios de validação da parte concedente e do supervisor pendentes.
- [x] Especificar as migrations tipadas das solicitações de cadastro pendente antes desta migration.
- [x] Definir o histórico privado de evidências e o aceite versionado das normas.
- [ ] Criar migration, Model, Policies, índices e constraints de unicidade.
- [ ] Testar filtros de curso/tipo e exceções de carga horária no servidor.

## Dependências

- [[SGE - Migration - 04 - Affiliations|affiliations]]
- [[SGE - Migration - 09 - Courses|courses]]
- [[SGE - Migration - 11 - Internship types|internship_types]]
- [[SGE - Migration - 12 - Granting parties|granting_parties]]
- [[SGE - Migration - 12A - Supervisor registration requests|supervisor_registration_requests]]
- [[SGE - Migration - 12B - Granting party registration requests|granting_party_registration_requests]]
- [[SGE - Migration - 15 - Internships|internships]]
- [[SGE - Migration - 20 - Internship request corrections|correções de solicitações]]
- [[SGE - Migration - 19A - Emancipation evidences|provas de emancipação]]
