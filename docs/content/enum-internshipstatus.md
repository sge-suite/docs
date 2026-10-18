---
id: enum-internshipstatus
title: Enum — InternshipStatus
description: Ciclo de formalização e execução de um estágio já criado no SGE.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/estagio
related: enum-internshiprequeststatus, enum-generateddocumentstatus, migration-15-internships, schedules, fluxos-principais, ciclos-de-status
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/InternshipStatus.php
diagram: enum-internship-status
---
> [!success] Estado
> O enum está integrado ao Model, à migration e às telas de gestão do estágio. O schedule sincroniza início, pausa e retomada e avisa o discente quando uma dessas transições ocorre. Formalização documental, assinaturas, liberação, conclusão e cancelamento continuam fora das transições automáticas. Os estados da solicitação pertencem a `InternshipRequestStatus`, não a `internships.status`.

## Contrato

| Case                 | Valor persistido      | Rótulo                    |
| -------------------- | --------------------- | ------------------------- |
| `PendingFormalization` | `pending_formalization` | Em formalização         |
| `AwaitingSignatures` | `awaiting_signatures` | Aguardando assinaturas    |
| `PendingCorrection`  | `pending_correction`  | Com pendência de correção |
| `Released`           | `released`            | Liberado                  |
| `InProgress`         | `in_progress`         | Em andamento              |
| `Paused`             | `paused`              | Pausado                   |
| `Completed`          | `completed`           | Concluído                 |
| `Cancelled`          | `cancelled`           | Cancelado                 |

Um estágio nasce quando a solicitação é aceita, inicialmente em `PendingFormalization`. A geração e o encaminhamento do documento ainda não estão implementados; por isso, a passagem para `AwaitingSignatures` continua pendente. Se uma correção de uma solicitação já aceita for devolvida ao discente, o estágio relacionado passa a `PendingCorrection` e volta a `PendingFormalization` após a aprovação da correção. Rascunho, envio, análise, pendência e recusa pertencem exclusivamente a [`InternshipRequestStatus`](doc:enum-internshiprequeststatus). O status de cada assinatura pertence a [`GeneratedDocumentStatus`](doc:enum-generateddocumentstatus), não a este enum.

## Transições iniciais

{{diagram:enum-internship-status}}

## Checklist de implementação

- [x] Implementar o enum string e rótulos no código.
- [x] Implementar `options()` e `values()`.
- [x] Adicionar cast em `Internship`.
- [x] Usar o valor inicial do enum na [migration de internships](doc:migration-15-internships).
- [x] Sincronizar início, pausa e retomada pela mesma Action chamada pelo [schedule](doc:schedules) e pelas alterações operacionais de pausa.
- [ ] Implementar as transições documentais de formalização, assinatura e liberação.
- [ ] Implementar as decisões de conclusão e cancelamento.
- [ ] Testar cases, valores, rótulos e opções.
- [ ] Testar formalização, reemissão após pendência, liberação, pausa, retomada, conclusão e cancelamento no fluxo de domínio.
- [ ] Atualizar [Fluxos principais](doc:fluxos-principais) se as transições forem alteradas.

## Referência funcional

- [Ciclos de status](doc:ciclos-de-status) — regra pública de transição e conclusão.
