---
id: enum-registrationrequeststatus
title: Enum — RegistrationRequestStatus
description: Ciclo das solicitações de cadastro de supervisor e parte concedente.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/cadastro
related: migration-12a-supervisor-registration-requests, migration-12b-granting-party-registration-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/RegistrationRequestStatus.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/app/Models/GrantingPartyRegistrationRequest.php
---
| Case | Valor | Rótulo |
| --- | --- | --- |
| `Draft` | `draft` | Rascunho |
| `Submitted` | `submitted` | Enviada |
| `UnderReview` | `under_review` | Em análise |
| `Approved` | `approved` | Aprovada |
| `Rejected` | `rejected` | Recusada |
| `Cancelled` | `cancelled` | Cancelada |

`Draft` aceita campos incompletos. O pedido de supervisor enviado exige nome, CPF, telefone, e-mail, cargo/função e uma qualificação completa (formação acadêmica ou experiência profissional). O pedido de concedente exige nome, documento CPF/CNPJ, telefone, e-mail e cidade; CPF também exige endereço completo, enquanto CNPJ exige representante e cargo. `Approved` exige associação ao vínculo de supervisor ou à concedente resultante. `Rejected` e `Cancelled` exigem motivo. Não há exclusão física.

## Checklist

- [x] Enum, rótulos, `values()` e `options()` implementados.
- [ ] Na preparação para produção, validar o contrato e as transições conforme [Testes automatizados](doc:testes-existentes).
- [x] Adicionar o cast no Model da Migration 12A.
- [x] Adicionar o cast no Model da Migration 12B.
- [ ] Implementar transições e testes de aprovação/recusa/cancelamento.
