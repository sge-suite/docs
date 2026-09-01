---
title: SGE — Enum — RegistrationRequestStatus
description: Ciclo das solicitações de cadastro de supervisor e parte concedente.
type: enum-reference
status: implemented
domain: registration-requests
code_path: app/Enums/RegistrationRequestStatus.php
tags:
  - sge/enums
  - sge/cadastro
---
| Case | Valor | Rótulo |
| --- | --- | --- |
| `Draft` | `draft` | Rascunho |
| `Submitted` | `submitted` | Enviada |
| `UnderReview` | `under_review` | Em análise |
| `Approved` | `approved` | Aprovada |
| `Rejected` | `rejected` | Recusada |
| `Cancelled` | `cancelled` | Cancelada |

`Draft` aceita campos nulos. Fora dele, todos os campos obrigatórios do cadastro devem estar válidos. `Approved` exige associação ao vínculo de supervisor ou à concedente resultante. `Rejected` e `Cancelled` exigem motivo. Não há exclusão física.

## Checklist

- [x] Enum, rótulos, `values()` e `options()` implementados.
- [x] Testes unitários do contrato implementados.
- [ ] Adicionar casts nos dois Models de solicitação.
- [ ] Implementar transições e testes de aprovação/recusa/cancelamento.
