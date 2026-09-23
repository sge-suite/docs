---
id: enum-partydocumenttype
title: Enum — PartyDocumentType
description: Tipo de documento de identificação da parte concedente.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/concedente
related: migration-12-granting-parties, migration-12b-granting-party-registration-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/PartyDocumentType.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/PartyDocumentTypeTest.php
---
> [!success] Estado
> Implementado em `app/Enums/PartyDocumentType.php` e usado por `GrantingParty` na [Migration 12](doc:migration-12-granting-parties) e por `GrantingPartyRegistrationRequest` na [Migration 12B](doc:migration-12b-granting-party-registration-requests).

## Contrato

| Case   | Valor persistido | Rótulo |
| ------ | ---------------- | ------ |
| `CPF`  | `cpf`            | CPF    |
| `CNPJ` | `cnpj`           | CNPJ   |

O número é armazenado em `granting_parties.document_number` e `granting_party_registration_requests.document_number`, sempre normalizado e sem pontuação. Não criar colunas separadas para CPF e CNPJ.

## Checklist de implementação

- [x] Criar enum string e rótulos no código.
- [x] Implementar `options()` e `values()`.
- [x] Cobrir cases, valores, rótulos e opções com teste unitário.
- [x] Adicionar cast em `GrantingParty`.
- [x] Usar o enum no model vinculado à [migration de granting_parties](doc:migration-12-granting-parties).
- [x] Validar dígitos e normalização de CPF/CNPJ no model.
- [x] Testar os dois tipos e documentos inválidos na base backend.
- [x] Permitir unidades distintas com o mesmo CNPJ, sem unicidade global.
