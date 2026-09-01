---
title: SGE — Migration 18 — avaliações
description: Estrutura planejada para rascunhos, envios e análise das avaliações do supervisor.
type: migration-reference
status: planned
order: 18
table: supervisor_evaluations
tags:
  - sge/migrations
  - sge/avaliacao
  - sge/banco-de-dados
---
> [!info] Estado
> Planejada. O ciclo de rascunho, envio, devolução, aprovação e escolha da avaliação vigente está definido. Os campos, critérios e regras condicionais do formulário fixo estão mapeados; pesos e valores dos conceitos pertencem ao tipo de estágio e são lidos do snapshot do estágio.

## Escopo

`supervisor_evaluations` armazenará um único formulário por estágio e supervisor. Ele é atualizado somente em `Draft` ou após devolução em `Returned`; o `activity_log` preserva cada alteração e transição sem criar versões de formulário. A liberação da avaliação e a referência para a resposta vigente pertencem a `internships`. O cálculo da resposta usa a configuração congelada em `internship_type_snapshot`, e não o cadastro atual de `internship_types`. Relatório e apresentação são lançados separadamente pelo Orientador.

## Contrato proposto

| Campo                        | Regra                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `id`                         | bigint, chave primária.                                                       |
| `internship_id`              | FK obrigatória para o estágio.                                                |
| `supervisor_affiliation_id`  | FK obrigatória para o vínculo de supervisor responsável pelo envio.           |
| `status`                     | [[SGE - Enum - EvaluationStatus]] (`EvaluationStatus`).                       |
| `response`                   | JSONB com as respostas do supervisor, validado conforme o formulário fixo e as regras congeladas no tipo. |
| `hours_requirement_met`      | boolean nullable em `Draft`; obrigatório fora dele e precisa ser `true` para aprovação. |
| `estimated_hours_remaining`  | smallint nullable; justificativa/estimativa obrigatória quando a carga não foi cumprida. |
| `form_version`               | Identificador da versão do formulário fixo usada no envio.                               |
| `submitted_at`               | Preenchido quando o rascunho é congelado e enviado.                           |
| `reviewed_at`                | Preenchido quando o Setor de Estágio aprova ou devolve.                       |
| `reviewed_by_affiliation_id` | FK nullable para o vínculo do Setor de Estágio que realizou a análise.        |
| `review_notes`               | Justificativa nullable, obrigatória na devolução.                             |
| `cancelled_at` / `cancellation_reason` | Nulos até o cancelamento; motivo obrigatório e sem exclusão física. |
| timestamps                   | Auditoria técnica; ações relevantes também devem ir para o Activity Log.      |

Campos relacionados em `internships`:

| Campo                                   | Regra                                                               |
| --------------------------------------- | ------------------------------------------------------------------- |
| `evaluation_released_at`                | Momento a partir do qual o supervisor pode preencher a avaliação.   |
| `evaluation_released_by_affiliation_id` | Vínculo que autorizou a liberação, quando houver ação manual.       |
| `current_supervisor_evaluation_id`      | FK nullable para a avaliação aprovada vigente e efetiva no cálculo. |

## Schema de `response`

```json
{
  "supervisor": {
    "has_academic_background": true,
    "training_course": "Tecnologia em ...",
    "education_level": "superior",
    "job_role": "Supervisor de estágio",
    "experience_time": "5 anos"
  },
  "criteria": {
    "performance": "excellent",
    "comprehension": "very_good",
    "technical_knowledge": "good",
    "organization": "excellent",
    "initiative": "excellent",
    "attendance": "very_good",
    "discipline": "excellent",
    "sociability": "very_good",
    "cooperation": "excellent",
    "responsibility": "excellent"
  },
  "comments": {
    "considerations": null,
    "suggestions_to_institution": null,
    "performance_issues": null,
    "other_observations": null
  }
}
```

`response.supervisor.has_academic_background`, `job_role` e `experience_time` são obrigatórios fora de `Draft`. Quando `has_academic_background` for verdadeiro, `training_course` e `education_level` também são obrigatórios; quando for falso, permanecem nulos. Os dez critérios são obrigatórios fora de rascunho e precisam ser uma das chaves de `internship_type_snapshot.rules.concept_values`: `excellent`, `very_good`, `good`, `satisfactory` ou `unsatisfactory`. Os quatro comentários são opcionais em qualquer estado e ficam `null` quando não informados.

A confirmação de carga horária fica em coluna própria. Fora de `Draft`, `hours_requirement_met` é obrigatório; quando for falso, `estimated_hours_remaining` é obrigatório e positivo. Mesmo nessa situação, o supervisor preenche toda a resposta acima. A identificação de discente e supervisor vem das referências e snapshots do estágio, não de campos livres.

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
- A conclusão do estágio depende também das demais notas, documentos e requisitos do fluxo.

## Índices e integridade

- Índice em `internship_id`, `status` e `submitted_at` para localizar a lista e a resposta vigente.
- Índice em `supervisor_affiliation_id` para autorização e consultas do supervisor.
- Restrição única em `internship_id` e `supervisor_affiliation_id`, pois o mesmo formulário é reutilizado após devolução.
- FKs de análise devem apontar para vínculos e ser validadas pelas Policies.
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
- [x] Registrar decisão em [[SGE - Backlog e decisões#D-009 — Ciclo e validade da avaliação do supervisor|D-009]].

## Checklist de implementação após aprovação

- [ ] Confirmar o contrato de campos contra critérios e escalas aprovados.
- [ ] Criar [[SGE - Enum - EvaluationStatus|`EvaluationStatus`]].
- [ ] Criar migration, Models, casts e índices.
- [ ] Implementar liberação, notificação, salvamento de rascunho e envio imutável.
- [ ] Implementar autosave Livewire em `Draft` e edição integral em `Returned` com auditoria de alterações.
- [ ] Atualizar a avaliação vigente em transação após aprovação.
- [ ] Testar autorização, devolução, aprovação, cálculo e pendências.
- [ ] Testar migrate/rollback na ordem completa.
- [ ] Atualizar [[SGE - Fase 09 - Avaliação e conclusão|fase de avaliação]].
