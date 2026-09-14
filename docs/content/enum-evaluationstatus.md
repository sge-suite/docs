---
id: enum-evaluationstatus
title: Enum — EvaluationStatus
description: Ciclo persistido das respostas de avaliação enviadas pelo supervisor.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/avaliacao
related: migration-18-avaliacoes, fase-09-avaliacao-e-conclusao, backlog-e-decisoes, fluxos-principais
source_refs: ../../sge/app/Enums/EvaluationStatus.php, ../../sge/tests/Unit/Enums/EvaluationStatusTest.php
diagram: enum-evaluation-status
---
> [!success] Estado
> A classe e os testes unitários já existem. O enum controla o ciclo da resposta; sua integração com a migration, o Model, a liberação da avaliação e as Policies ainda está planejada. A validade para nota depende da carga horária.

## Contrato implementado

| Case        | Valor persistido | Uso                                                                |
| ----------- | ---------------- | ------------------------------------------------------------------ |
| `Draft`     | `draft`          | Resposta editável, salva pelo supervisor e ainda não enviada.      |
| `Submitted` | `submitted`      | Resposta enviada, congelada e aguardando análise.                  |
| `Returned`  | `returned`       | Envio devolvido com motivo; o mesmo formulário volta a ser editável. |
| `Approved`  | `approved`       | Envio aceito pelo Setor de Estágio; exige carga horária cumprida.  |
| `Cancelled` | `cancelled`      | Registro preservado, encerrado sem aprovação e sem exclusão física. |

## Transições

{{diagram:enum-evaluation-status}}

- Somente o supervisor vinculado ao estágio pode preencher e salvar o `Draft` ou o `Returned`.
- `Draft` aceita preenchimento parcial. Nos demais estados, todos os campos obrigatórios para o ramo condicional escolhido devem estar válidos; ramos não selecionados e pareceres opcionais permanecem nulos.
- Depois da transição para `Submitted`, a resposta fica bloqueada. `Returned` reabre a mesma linha, permitindo ao supervisor editar todos os campos e reenviá-la.
- A análise pertence ao vínculo `AffiliationType::InternshipOffice`. O vínculo `Coordinator` continua representando o coordenador de curso e não concede essa ação automaticamente.
- O Setor de Estágio aprova ou devolve, mas não altera as respostas fornecidas pelo supervisor. O supervisor pode cancelar um envio `Submitted` ou `Returned`; o cancelamento exige motivo.
- Não há exclusão física. Ações, valores anteriores/novos e transições são preservados no `activity_log`, que não é exibido ao supervisor.

## Avaliação vigente

O envio mais recente não substitui imediatamente uma avaliação já vigente. A avaliação considerada para a nota é a resposta `Approved` mais recente, ordenada por `submitted_at` e `id`. O Setor só pode aprovar quando a confirmação de carga horária estiver atendida.

- Um novo `Submitted` permanece apenas como candidato enquanto aguarda análise.
- Um `Returned` nunca é usado no cálculo.
- A avaliação vigente deverá ser referenciada por `internships.current_supervisor_evaluation_id` ou mecanismo equivalente com garantia de unicidade.
- A aprovação da avaliação, isoladamente, não conclui o estágio; a conclusão ocorre quando a carga horária integral é confirmada. Documentos e notas permanecem como registros próprios do processo.

## Liberação e notificação

A liberação para preenchimento pertence ao estágio, não ao enum da resposta. O sistema deverá registrar `evaluation_released_at`, notificar o supervisor vinculado e só então permitir a criação ou edição do rascunho.

## Checklist de decisão e implementação

- [x] Confirmar que a avaliação terá rascunho, envio e devolução no mesmo registro.
- [x] Confirmar que o supervisor responde e o Setor de Estágio aprova ou devolve.
- [x] Confirmar que a avaliação vigente será a aprovada mais recente, com aprovação condicionada à carga horária cumprida.
- [x] Definir pesos e valores dos conceitos no snapshot do tipo de estágio.
- [x] Mapear critérios, escala e regras condicionais do formulário fixo de avaliação.
- [x] Criar o enum e seus testes unitários.
- [ ] Criar migration e campos de liberação/avaliação vigente.
- [ ] Adicionar cast, transições e testes de histórico.
- [x] Atualizar [migration de avaliação](doc:migration-18-avaliacoes) e [fase de avaliação](doc:fase-09-avaliacao-e-conclusao).

## Relacionamentos

- [Decisão D-009](doc:backlog-e-decisoes#d-009-ciclo-e-validade-da-avaliacao-do-supervisor)
- [Fluxo de avaliação](doc:fluxos-principais#6-acompanhamento-academico-e-conclusao)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
