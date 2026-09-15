---
id: enum-internshipcancellationrequeststatus
title: Enum — InternshipCancellationRequestStatus
description: Ciclo do pedido de cancelamento de estágio formalizado.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/cancelamento
related: migration-21-internship-cancellation-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/InternshipCancellationRequestStatus.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/InternshipCancellationRequestStatusTest.php
---
> [!success] Estado
> A classe e os testes unitários já existem em `app/Enums/InternshipCancellationRequestStatus.php`. A integração com `internship_cancellation_requests`, as guardas de transição e os efeitos da decisão continuam planejados.

| Case | Valor | Rótulo |
| --- | --- | --- |
| `Submitted` | `submitted` | Enviada |
| `UnderReview` | `under_review` | Em análise |
| `Approved` | `approved` | Aprovada |
| `Rejected` | `rejected` | Recusada |
| `Withdrawn` | `withdrawn` | Retirada pelo discente |

O pedido nasce enviado porque motivo e estágio são obrigatórios. O Setor de Estágio inicia a análise e aprova ou recusa. O discente pode retirar somente antes da decisão. Estados finais não são editáveis nem apagados.

## Checklist

- [x] Criar enum, rótulos, `values()` e `options()`.
- [x] Cobrir cases, valores, rótulos e opções com teste unitário.
- [ ] Adicionar cast e guardas de transição.
- [ ] Testar concorrência entre retirada e decisão.
