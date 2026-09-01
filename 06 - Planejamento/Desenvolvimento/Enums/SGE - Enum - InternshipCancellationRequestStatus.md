---
title: SGE — Enum — InternshipCancellationRequestStatus
description: Ciclo do pedido de cancelamento de estágio formalizado.
type: enum-reference
status: planned
domain: internship-cancellation
tags:
  - sge/enums
  - sge/cancelamento
---
| Case | Valor | Rótulo |
| --- | --- | --- |
| `Submitted` | `submitted` | Enviada |
| `UnderReview` | `under_review` | Em análise |
| `Approved` | `approved` | Aprovada |
| `Rejected` | `rejected` | Recusada |
| `Withdrawn` | `withdrawn` | Retirada pelo discente |

O pedido nasce enviado porque motivo e estágio são obrigatórios. O Setor de Estágio inicia a análise e aprova ou recusa. O discente pode retirar somente antes da decisão. Estados finais não são editáveis nem apagados.

## Checklist

- [ ] Criar enum, rótulos, `values()` e `options()`.
- [ ] Adicionar cast e guardas de transição.
- [ ] Testar concorrência entre retirada e decisão.
