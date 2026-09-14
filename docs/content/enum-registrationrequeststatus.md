---
id: enum-registrationrequeststatus
title: Enum — RegistrationRequestStatus
description: Ciclo das solicitações de cadastro de supervisor e parte concedente.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/cadastro
related: migration-12a-supervisor-registration-requests, migration-12b-granting-party-registration-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/RegistrationRequestStatus.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/RegistrationRequestStatusTest.php
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
