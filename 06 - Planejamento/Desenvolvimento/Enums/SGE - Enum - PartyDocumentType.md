---
title: SGE — Enum — PartyDocumentType
description: Tipo de documento de identificação da parte concedente.
type: enum-reference
status: implemented
domain: granting-party
code_path: app/Enums/PartyDocumentType.php
tags:
  - sge/enums
  - sge/concedente
aliases:
  - Enum de documento da parte concedente
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
- [ ] Adicionar cast em `GrantingParty`.
- [ ] Usar o enum na [[SGE - Migration - 12 - Granting parties|migration de granting_parties]].
- [ ] Validar dígitos e normalização de CPF/CNPJ na entrada.
- [ ] Testar os dois tipos e documentos inválidos.
- [ ] Confirmar regra de unicidade quando houver unidades distintas com o mesmo CNPJ.
