---
id: migration-19-internship-requests
title: Migration 19 — internship_requests
description: Contrato da solicitação única de abertura de estágio preenchida pelo discente.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/estagio, sge/formularios
related: enum-legalcapacitydeclaration, enum-internshiprequeststatus, migration-base-04-activity-log, migration-19a-emancipation-evidences, cadastros-pendentes-de-supervisor-e-concedente, backlog-e-decisoes, migration-04-affiliations, migration-09-courses, migration-11-internship-types, migration-12-granting-parties, migration-12a-supervisor-registration-requests, migration-12b-granting-party-registration-requests, migration-15-internships, migration-20-internship-request-corrections
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_24_152252_create_internship_requests_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/InternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ManageStudentInternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Support/InternshipRequestSnapshots.php
---
> [!success] Estado
> Migration, Model, factory e relações implementados. A tabela vem depois de `internships` por causa da FK única `internship_id`; o fluxo de envio, análise, aceite e criação transacional está implementado, conforme a atualização funcional ao final desta página. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `affiliation_id` | FK obrigatória para o vínculo discente dono da solicitação. |
| `course_id` | FK obrigatória fora de `Draft`; o curso deve estar disponível no contexto do vínculo. |
| `internship_type_id` | FK obrigatória fora de `Draft`; o tipo deve estar ativo e pertencer ao curso selecionado. |
| `advisor_affiliation_id` | FK nullable no Draft; o Discente escolhe orientador ativo do campus antes do envio. O Setor pode confirmar ou trocar o vínculo no aceite. |
| `co_advisor_name` | Nome opcional do co-orientador, texto de até 255 caracteres, sem relação com conta ou vínculo. Integra a seção de estágio, a revisão e o comprovante da solicitação. |
| `granting_party_id` | FK nullable para concedente validada do campus do vínculo discente. |
| `granting_party_registration_request_id` | FK nullable para solicitação pendente do mesmo campus; é alternativa a `granting_party_id`, nunca texto livre solto. |
| `supervisor_affiliation_id` | FK nullable para o supervisor já cadastrado. |
| `supervisor_registration_request_id` | FK nullable para a solicitação pendente de cadastro; é alternativa a `supervisor_affiliation_id`. |
| `student_year_semester` | string nullable em `Draft`; no envio deve corresponder a uma opção de `internship_types.allowed_academic_periods` e é congelado no snapshot. |
| `legal_capacity_declaration` | [`LegalCapacityDeclaration`](doc:enum-legalcapacitydeclaration) nullable em Draft; a maioridade é inferida da data de nascimento e menores escolhem entre `minor` e `emancipated_minor`. |
| `legal_guardian_name` | texto nullable; obrigatório quando a opção for `minor`. |
| `legal_guardian_cpf` | `varchar(255)` nullable; obrigatório quando a opção for `minor`, normalizado e validado pelo `CpfCast`. |
| `legal_guardian_kinship` | `varchar(80)` nullable; obrigatório quando a opção for `minor`. |
| `legal_guardian_email` | `varchar(255)` nullable; obrigatório quando a opção for `minor`. |
| `activities` | texto nullable em `Draft`; obrigatório no envio. |
| `internship_sector` | texto nullable em Draft; setor/área de realização obrigatório no envio. |
| `weekly_hours` | JSONB nullable em `Draft`; mapa validado com domingo a sábado. |
| `planned_start_date` | data nullable em `Draft`; obrigatória no envio e usada para calcular o término. |
| `projected_end_date` | data nullable calculada no servidor; nunca editável pelo discente. |
| `is_remunerated` | boolean nullable em `Draft`; obrigatório no envio. |
| `grant_value` | decimal(10,2) nullable; bolsa obrigatória e positiva se remunerado. |
| `transportation_allowance` | decimal(10,2) nullable; auxílio pode ser zero ou nulo. |
| `observations` | texto nullable; observações complementares. |
| `status` | [`InternshipRequestStatus`](doc:enum-internshiprequeststatus): rascunho, enviada, em análise, com pendência, aceita, recusada ou desistida. |
| `student_address_id`, `workplace_address_id` | FKs nullable para cópias históricas de endereço usadas na solicitação e no local de trabalho. |
| `student_snapshot`, `internship_type_snapshot`, `granting_party_snapshot`, `supervisor_snapshot` | JSONB nullable em Draft; congelam dados da pessoa, tipo, concedente e supervisor no envio. |
| `decision_reason` | texto nullable, usado pelo Setor ao recusar. |
| `internship_id` | FK nullable e única para o estágio criado depois do aceite. |
| `terms_accepted_at` | data e hora do aceite explícito; nulo antes do primeiro envio e atualizado em cada reenvio. Não há coluna de versão, hash ou booleano. |
| timestamps | auditoria temporal. |

Há somente uma solicitação para o processo aberto pelo Discente. Ela é atualizada no mesmo registro; o rascunho aceita campos incompletos e pode ser salvo sem envio. O envio exige os campos do caminho condicional escolhido, ciência explícita e validação completa; os ramos não escolhidos permanecem vazios. Salvar os dados pessoais também atualiza o perfil atual em `user_personal_data`, enquanto `student_snapshot.personal_data_draft` preserva o preenchimento parcial no rascunho. O envio cria o snapshot definitivo. O Model registra alterações no [`activity_log`](doc:migration-base-04-activity-log), com o vínculo ativo como autor; Actions e Policies limitam acesso e análise. Os Models validam campus e vínculos das referências. Não há FK de revisor nesta tabela. No aceite, a transação cria `internships` com `student_affiliation_id = affiliation_id`, a jornada inicial e snapshots históricos. Se a solicitação já possuir `internship_id`, um novo aceite aplica somente os campos autorizados da correção ao estágio ainda não liberado.

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

As sete chaves sempre existem quando o formulário é enviado; cada valor é inteiro não negativo em horas. A soma semanal deve ser positiva. Para o tipo selecionado, cada dia deve respeitar `internship_types.max_daily_hours` e a soma da semana deve respeitar `internship_types.max_weekly_hours`. Na configuração do tipo, esses limites começam em 6 horas diárias e 30 semanais e podem ser aumentados, nunca reduzidos. `projected_end_date` é calculada no envio e no aceite a partir da jornada, da carga e margem do tipo e dos feriados aplicáveis ao endereço do local de trabalho. A abertura admite pausas planejadas. O cálculo inicial está implementado; recálculos após pausas/aditivos formalizados e a base histórica reproduzível continuam pendentes.

### Caminhos condicionais de cadastro

- Concedente: exatamente uma de `granting_party_id` ou `granting_party_registration_request_id` deve ser informada no envio. A referência deve pertencer ao campus do vínculo. Uma proposta de cadastro é completa e tipada: CPF exige nome, documento, endereço completo, telefone e e-mail; CNPJ exige razão social, documento, representante, cargo, telefone, e-mail e cidade. Ambas exigem UF/cidade do catálogo; propostas de cadastro só precisam ser aprovadas e associadas antes do aceite. CPF/CNPJ iguais em outro cadastro não autorizam reutilizá-lo entre campi.
- Supervisor: exatamente uma de `supervisor_affiliation_id` ou `supervisor_registration_request_id` deve ser informada no envio. A proposta pendente exige nome, CPF, telefone, e-mail, cargo/função e uma qualificação completa (formação ou experiência). Para supervisor existente, o Discente informa cargo/função; o Setor escolhe a qualificação do perfil no aceite, com seleção automática quando há uma única opção.
- Capacidade civil: ao salvar os dados de nascimento, o sistema identifica automaticamente quem tem 18 anos completos. Menores escolhem `minor` ou `emancipated_minor`. `minor` exige os quatro campos de responsável legal. `emancipated_minor` exige evidência privada enviada, e o aceite final exige aprovação do último envio pelo Setor. Devolução por comprovante inválido reabre a seção para novo envio ou para a escolha `minor`.
- Remuneração: `is_remunerated = true` exige `grant_value`; quando for `false`, bolsa e auxílio-transporte são limpos.

As duas solicitações pendentes de cadastro são estruturas de domínio próprias, conforme [Cadastros pendentes de supervisor e concedente](doc:cadastros-pendentes-de-supervisor-e-concedente) e [D-011](doc:backlog-e-decisoes#d-011-solicitacoes-pendentes-sao-registros-proprios); não são JSON genérico nem notificações. As migrations que as criam devem preceder a FK desta tabela. As duas migrations de cadastro pendente já existem no código; esta tabela usa somente FKs para esses caminhos.

## Validações do formulário

- `affiliation_id` deve ser o vínculo discente ativo e autorizado;
- o curso deve ser elegível para o vínculo;
- ao escolher um curso, a interface apresenta apenas seus tipos de estágio ativos: um tipo é selecionado automaticamente quando for único; mais de um exige seleção explícita;
- a validação no servidor confirma a relação entre curso e tipo, a escolha do ano/semestre em `allowed_academic_periods` e os limites diário e semanal de jornada;
- a concedente pode ser um cadastro atual ou uma proposta pendente completa; o Setor precisa associar um cadastro aprovado antes do aceite;
- a data prevista de término é calculada, não digitada, a partir do tipo, da jornada e do calendário aplicável;
- o envio e o reenvio exigem ciência explícita; somente a data e hora do aceite são persistidas em `terms_accepted_at`.

## Checklist

- [x] Definir uma solicitação única pertencente ao vínculo discente.
- [x] Definir a associação única com o estágio criado após o aceite.
- [x] Definir curso, tipo e parte concedente como referências validadas.
- [x] Separar o enum de status da solicitação do status de `internships`.
- [x] Mapear todas as colunas do formulário de abertura e seus casts.
- [x] Fechar os critérios de validação da parte concedente e do supervisor pendentes.
- [x] Especificar as migrations tipadas das solicitações de cadastro pendente antes desta migration.
- [x] Definir o histórico privado de evidências e o aceite das normas por data e hora.
- [x] Criar migration, Model, factory, relações, índice por vínculo/status e FK única para o estágio.
- [x] Criar Policies e fluxos de envio, análise, aceite e reenvio.
- [ ] Testar no Model a compatibilidade de curso/tipo, os limites de carga horária e os ramos condicionais.
- [x] Implementar seleção, previsão inicial e análise privada da evidência com autorização por vínculo.

## Dependências

- [affiliations](doc:migration-04-affiliations)
- [courses](doc:migration-09-courses)
- [internship_types](doc:migration-11-internship-types)
- [granting_parties](doc:migration-12-granting-parties)
- [supervisor_registration_requests](doc:migration-12a-supervisor-registration-requests)
- [granting_party_registration_requests](doc:migration-12b-granting-party-registration-requests)
- [internships](doc:migration-15-internships)
- [correções de solicitações](doc:migration-20-internship-request-corrections)
- [provas de emancipação](doc:migration-19a-emancipation-evidences)

## Fluxo funcional e campos históricos — 16/10/2026

`InternshipRequestPolicy`, `SaveInternshipRequestRequest` e `ManageStudentInternshipRequest` implementam posse pelo vínculo selecionado, curso/campus, edição em Draft ou seções explicitamente devolvidas, salvamento transacional, ciência em cada envio e bloqueio posterior. Campos ausentes são preservados; nulo explícito limpa opcionais. IDs de dono, curso, campus, orientador, situação, snapshots e término não são entradas do Discente. Um início repetido retoma o rascunho existente; correção atualiza o mesmo ID.

A migration original de criação de `internship_requests` inclui também:

| Campo | Contrato |
| --- | --- |
| `student_snapshot` | JSONB nullable no Draft; no envio congela identidade, e-mail e matrícula do vínculo, período, RG/emissor/emissão, nascimento, telefone e capacidade/responsável. Antes do envio, `personal_data_draft` conserva os campos editados parcialmente, que também são salvos em `user_personal_data`; a chave é removida do snapshot ao formar o estado definitivo. |
| `internship_type_snapshot` | JSONB com nome e `rules` contendo as regras escalares autorizadas do tipo no envio. |
| `granting_party_snapshot` | JSONB com os dados confirmados ou propostos; pedido tipado conserva `source_registration_request_id` histórico após associação. |
| `supervisor_snapshot` | JSONB com identidade, contatos e cargo/função. Pedido pendente preserva a única qualificação proposta e a origem do cadastro. Para vínculo existente, a qualificação escolhida pelo Setor só é copiada ao estágio no aceite. |
| `student_address_id`, `workplace_address_id` | FKs nullable para cópias exclusivas de `addresses` no envio. O endereço proposto pendente também recebe cópia com cidade do catálogo. O estágio recebe novas cópias na formalização, usando o local aprovado. |
| `decision_reason` | Texto nullable, informado pelo Setor na recusa; não se cria uma correção artificial para armazenar uma recusa. |

Os snapshots são independentes dos cadastros atuais e protegidos após envio. Correções atualizam somente os grupos autorizados; mudanças posteriores do perfil não os sincronizam. Campos pessoais sensíveis e arquivos privados não entram no Activity Log. Mudanças dos atributos operacionais e decisões usam os eventos normais dos Models com o vínculo ativo como autor.

Dados pessoais completos, orientador, período permitido, setor/área, contatos e campos obrigatórios dos caminhos escolhidos são exigidos ao enviar; o rascunho aceita incompletude. Pedidos tipados completos podem seguir à análise junto com a abertura; o aceite fica bloqueado até o Setor aprovar e associar as referências. Para supervisor existente, o Setor seleciona uma qualificação cadastrada. Bolsa positiva é exigida se remunerado; auxílio é opcional; sem remuneração, ambos permanecem nulos. O início exige sete dias corridos após cada envio.

`ReviewInternshipRequest` aceita, recusa ou devolve com mensagens por seção. No aceite cria o estágio em transação, confere `student_affiliation_id = affiliation_id`, confirma ou altera o orientador escolhido pelo Discente e copia os históricos e a qualificação selecionada. Se já houver estágio ainda não liberado, somente os campos corrigidos e aprovados e os derivados são aplicados. A geração/reemissão documental continua pendente.
