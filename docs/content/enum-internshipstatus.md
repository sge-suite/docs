---
id: enum-internshipstatus
title: Enum — InternshipStatus
description: Ciclo de formalização e execução de um estágio já criado no SGE.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/estagio
related: enum-internshiprequeststatus, enum-generateddocumentstatus, migration-15-internships, schedules, fluxos-principais, ciclos-de-status
source_refs: ../../sge/app/Enums/InternshipStatus.php, ../../sge/tests/Unit/Enums/InternshipStatusTest.php
diagram: enum-internship-status
---
> [!success] Estado
> A classe e os testes unitários já existem e os cases correspondem ao ciclo do estágio. Ainda falta integrar o enum ao Model, à migration e às transições de domínio. Os estados de formulário e análise pertencem a `InternshipRequestStatus`, não a `internships.status`.

## Contrato

| Case                 | Valor persistido      | Rótulo                    |
| -------------------- | --------------------- | ------------------------- |
| `PendingFormalization` | `pending_formalization` | Em formalização         |
| `AwaitingSignatures` | `awaiting_signatures` | Aguardando assinaturas    |
| `PendingCorrection`  | `pending_correction`  | Com pendência documental  |
| `Released`           | `released`            | Liberado                  |
| `InProgress`         | `in_progress`         | Em andamento              |
| `Paused`             | `paused`              | Pausado                   |
| `Completed`          | `completed`           | Concluído                 |
| `Cancelled`          | `cancelled`           | Cancelado                 |

Um estágio nasce quando a solicitação é aceita, inicialmente em `PendingFormalization`. Nesse estado, o Setor escolhe o template, gera o documento e o encaminha para assinatura. Só então o estágio passa a `AwaitingSignatures`. Rascunho, envio, análise, pendência e recusa pertencem exclusivamente a [`InternshipRequestStatus`](doc:enum-internshiprequeststatus). O status de cada assinatura pertence a [`GeneratedDocumentStatus`](doc:enum-generateddocumentstatus), não a este enum.

## Transições iniciais

{{diagram:enum-internship-status}}

## Checklist de implementação

- [x] Implementar o enum string e rótulos no código.
- [x] Implementar `options()` e `values()`.
- [ ] Adicionar cast em `Internship`.
- [ ] Usar o enum na [migration de internships](doc:migration-15-internships).
- [ ] Implementar guardas para transições permitidas.
- [ ] Usar a mesma guarda na Action manual e em [Schedules](doc:schedules), sem `update` direto de status.
- [x] Testar cases, valores, rótulos e opções.
- [ ] Testar formalização, reemissão após pendência, liberação, pausa, retomada, conclusão e cancelamento no fluxo de domínio.
- [ ] Atualizar [Fluxos principais](doc:fluxos-principais) se as transições forem alteradas.

## Referência funcional

- [Ciclos de status](doc:ciclos-de-status) — regra pública de transição e conclusão.
