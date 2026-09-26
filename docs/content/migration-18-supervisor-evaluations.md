---
id: migration-18-supervisor-evaluations
title: Migration 18 — supervisor_evaluations
description: Schema e validações das avaliações do supervisor, com fluxos funcionais ainda planejados.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/avaliacao, sge/banco-de-dados
related: enum-evaluationstatus, backlog-e-decisoes, fase-09-avaliacao-e-conclusao
source_refs:
---
> [!info] Estado
> Schema, Model, factory e testes PostgreSQL implementados. O ciclo de rascunho, envio, devolução e aprovação é validado no Model; os fluxos de liberação, autorização e escolha transacional da avaliação vigente permanecem planejados. Os campos, critérios e regras condicionais do formulário fixo estão mapeados; pesos e valores dos conceitos pertencem ao tipo de estágio e são lidos do snapshot do estágio.

## Escopo

`supervisor_evaluations` armazena um único formulário fixo por estágio e supervisor, com cada resposta em sua própria coluna. Ele é atualizado somente em `Draft` ou após devolução em `Returned`; o `activity_log` preserva cada alteração e transição sem criar versões de formulário. A liberação da avaliação e a referência para a resposta vigente pertencem a `internships`. O cálculo da nota usa a configuração congelada em `internship_type_snapshot`, e não o cadastro atual de `internship_types`. Relatório e apresentação são lançados separadamente pelo Orientador.

## Contrato implementado

| Campo                        | Regra                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `id`                         | bigint, chave primária.                                                       |
| `internship_id`              | FK obrigatória para o estágio.                                                |
| `supervisor_affiliation_id`  | FK obrigatória para o vínculo de supervisor responsável pelo envio.           |
| `status`                     | [Enum — EvaluationStatus](doc:enum-evaluationstatus) (`EvaluationStatus`).                       |
| `has_academic_background`    | boolean nullable em `Draft`; seleciona o ramo de formação ou experiência. |
| `training_course` / `education_level` | Formação acadêmica; obrigatórios somente quando há formação na área. |
| `job_role` / `experience_time` | Cargo obrigatório fora de `Draft`; tempo de experiência obrigatório somente no ramo sem formação. |
| Dez colunas de critérios | Conceitos de `EvaluationConcept`, obrigatórios fora de `Draft`. |
| Quatro colunas de comentários | Pareceres opcionais, cada um em `text` nullable. |
| `hours_requirement_met`      | boolean nullable em `Draft`; obrigatório fora dele e precisa ser `true` para aprovação. |
| `estimated_hours_remaining`  | smallint nullable; estimativa positiva obrigatória quando a carga não foi cumprida. |
| `submitted_at`               | Preenchido quando o rascunho é congelado e enviado.                           |
| `reviewed_at`                | Preenchido quando o Setor de Estágio aprova ou devolve.                       |
| `review_notes`               | Justificativa nullable, obrigatória na devolução.                             |
| `cancelled_at` / `cancellation_reason` | Nulos até o cancelamento; motivo obrigatório e sem exclusão física. |
| timestamps                   | Auditoria técnica; ações relevantes também devem ir para o Activity Log.      |

Campos relacionados em `internships`:

| Campo                                   | Regra                                                               |
| --------------------------------------- | ------------------------------------------------------------------- |
| `evaluation_released_at`                | Momento a partir do qual o supervisor pode preencher a avaliação.   |
| `evaluation_released_by_affiliation_id` | Vínculo que autorizou a liberação, quando houver ação manual.       |
| `current_supervisor_evaluation_id`      | FK nullable para a avaliação aprovada vigente e efetiva no cálculo. |

Essas três colunas não entram na Migration 15. Depois de criar `supervisor_evaluations`, a própria Migration 18 altera `internships` para acrescentar `evaluation_released_at`, `evaluation_released_by_affiliation_id` e `current_supervisor_evaluation_id`, com suas FKs. Essa ordem evita dependência circular entre as tabelas.

## Respostas em colunas

O formulário é fixo. Não há tabela de definições do formulário, versão por envio ou JSONB de respostas. Cada campo do formulário possui coluna própria em `supervisor_evaluations`; isso permite validação e consulta direta. O Activity Log registra alterações de atributos e transições. A associação ao supervisor que respondeu permanece em `supervisor_affiliation_id`, mesmo que o vínculo de supervisor em `internships` mude depois.

| Grupo | Colunas |
| --- | --- |
| Formação e atuação | `has_academic_background`, `training_course`, `education_level`, `job_role`, `experience_time` |
| Critérios | `performance`, `comprehension`, `technical_knowledge`, `organization`, `initiative`, `attendance`, `discipline`, `sociability`, `cooperation`, `responsibility` |
| Comentários | `considerations`, `suggestions_to_institution`, `performance_issues`, `other_observations` |
| Carga horária | `hours_requirement_met`, `estimated_hours_remaining` |

`has_academic_background` e `job_role` são obrigatórios fora de `Draft`. Quando `has_academic_background` for verdadeiro, `training_course` e `education_level` são obrigatórios e `experience_time` fica nulo; quando for falso, os dados de formação ficam nulos e `experience_time` é obrigatório. Essa regra segue os ramos do formulário atual do supervisor. Os dez critérios são obrigatórios fora de rascunho e precisam ser um dos valores de `EvaluationConcept`, cujos rótulos em português são usados na interface. O snapshot do tipo de estágio conserva os valores dos conceitos, com a chave `excellent` exibida como “Ótimo” e `unsatisfactory` usando o valor configurado no tipo. Os quatro comentários são opcionais em qualquer estado.

Fora de `Draft`, `hours_requirement_met` é obrigatório. Quando for falso, `estimated_hours_remaining` é obrigatório e positivo; o supervisor ainda preenche os demais campos. A identificação do discente vem do estágio, não de texto livre na avaliação.

`reviewed_at` registra quando o Setor de Estágio devolveu ou aprovou a avaliação. Não há `reviewed_by_affiliation_id`: as alterações Eloquent já registram no Activity Log o vínculo ativo como *causer* e a conta nos metadados. O fluxo de revisão e sua autorização ainda não estão disponíveis; quando forem implementados, a autoria virá do contexto validado da requisição.

## Regras de ciclo e validade

- O supervisor pode salvar o mesmo `Draft` quantas vezes precisar antes do envio.
- `Draft` aceita nulos. Fora dele, todos os campos exigidos pelo ramo condicional selecionado devem estar válidos; pareceres opcionais e o ramo não escolhido ficam nulos.
- `Submitted` e `Approved` bloqueiam edição. `Returned` reabre o mesmo registro para edição completa e novo envio.
- O Setor de Estágio pode aprovar ou devolver, mas não editar a resposta do supervisor. Se `hours_requirement_met` for falso, deve devolver com motivo; não pode aprovar.
- O supervisor pode cancelar um `Submitted` ou `Returned`; `Cancelled` preserva os dados e exige motivo.
- A avaliação vigente é o `Approved` mais recente por `submitted_at` e `id`.
- Um envio pendente, devolvido ou cancelado não substitui a avaliação vigente anterior.
- A troca de `current_supervisor_evaluation_id` deve ocorrer em transação e gerar Activity Log.
- A nota da avaliação do supervisor é `round(sum(valor dos 10 conceitos) / 10, 1)`. Os valores vêm de `internship_type_snapshot.rules.concept_values`, já limitados ao peso dessa componente; a resposta não pode alterar pesos ou valores e o resultado não é multiplicado novamente.
- A aprovação da avaliação não conclui o estágio por si só. A conclusão depende da confirmação do cumprimento integral da carga horária; documentos, notas e demais requisitos permanecem registros próprios do fluxo e não bloqueiam a conclusão por si mesmos.

## Índices e integridade

- Índice em `internship_id`, `status` e `submitted_at` para localizar a lista e a resposta vigente.
- Índice em `supervisor_affiliation_id` para autorização e consultas do supervisor.
- Restrição única em `internship_id` e `supervisor_affiliation_id`, pois o mesmo formulário é reutilizado após devolução.
- A futura Policy de análise deverá exigir o vínculo do Setor de Estágio. O `SetAuditActor` já configura o vínculo ativo como *causer* do Activity Log em ações humanas.
- A referência vigente deve aceitar no máximo uma avaliação por estágio.

## Checklist de decisão

- [x] Definir que o supervisor responde e o Setor de Estágio revisa, devolve ou aprova.
- [ ] Definir momento de liberação e destinatário da avaliação.
- [x] Mapear critérios, escala e regras condicionais do formulário fixo de avaliação.
- [x] Definir pesos e valores dos conceitos no tipo de estágio, com snapshot no estágio.
- [x] Definir que o mesmo formulário é reaberto após devolução e que o `activity_log` preserva alterações.
- [x] Definir que o Orientador lança as notas de relatório e apresentação.
- [x] Definir a fórmula de média dos conceitos e soma das três contribuições.
- [x] Definir cálculo consolidado a partir do snapshot do tipo de estágio.
- [x] Registrar decisão em [D-009](doc:backlog-e-decisoes#d-009-ciclo-e-validade-da-avaliacao-do-supervisor).

## Checklist de implementação

- [x] Confirmar o contrato de campos contra critérios e escalas aprovados.
- [x] Criar [`EvaluationStatus`](doc:enum-evaluationstatus).
- [x] Criar `supervisor_evaluations` com respostas em colunas, sem versão do formulário nem FK de revisor; acrescentar as referências de avaliação vigente em `internships`, Models, casts e índices.
- [ ] Implementar liberação, notificação e ações de salvamento/envio; o Model já valida rascunho parcial e imutabilidade após envio.
- [ ] Implementar autosave Livewire em `Draft` e edição integral em `Returned` com auditoria de alterações.
- [ ] Atualizar a avaliação vigente em transação após aprovação.
- [ ] Testar autorização, devolução, aprovação, cálculo e pendências.
- [x] Testar migrate/rollback da Migration 18 junto à Migration 15; a ordem completa depende das migrations ainda planejadas.
- [ ] Atualizar [fase de avaliação](doc:fase-09-avaliacao-e-conclusao).
