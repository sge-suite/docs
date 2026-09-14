---
id: enum-partydocumenttype
title: Enum — PartyDocumentType
description: Tipo de documento de identificação da parte concedente.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/concedente
related: migration-12-granting-parties
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/PartyDocumentType.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/PartyDocumentTypeTest.php
---
> [!success] Estado
> Implementado em `app/Enums/PartyDocumentType.php`. A tabela de partes concedentes ainda precisa ser criada.

## Contrato

| Case   | Valor persistido | Rótulo |
| ------ | ---------------- | ------ |
| `CPF`  | `cpf`            | CPF    |
| `CNPJ` | `cnpj`           | CNPJ   |

O número é armazenado em `granting_parties.document_number`, sempre normalizado e sem pontuação. Não criar colunas separadas para CPF e CNPJ.

## Checklist de implementação

- [x] Criar enum string e rótulos no código.
- [x] Implementar `options()` e `values()`.
- [x] Cobrir cases, valores, rótulos e opções com teste unitário.
- [ ] Adicionar cast em `GrantingParty`.
- [ ] Usar o enum na [migration de granting_parties](doc:migration-12-granting-parties).
- [ ] Validar dígitos e normalização de CPF/CNPJ na entrada.
- [ ] Testar validação dos dois tipos e documentos inválidos na integração cadastral.
- [ ] Confirmar regra de unicidade quando houver unidades distintas com o mesmo CNPJ.
