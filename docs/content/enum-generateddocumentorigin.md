---
id: enum-generateddocumentorigin
title: Enum — GeneratedDocumentOrigin
description: Origem do documento registrado no processo de estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/documentos
related: migration-16-generated-documents
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/GeneratedDocumentOrigin.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/GeneratedDocumentOriginTest.php
---
> [!success] Estado
> Implementado em `app/Enums/GeneratedDocumentOrigin.php`. As regras de armazenamento e associação ainda precisam ser aplicadas na migration e no fluxo.

## Contrato

| Case            | Valor persistido | Rótulo           | Regra                                                              |
| --------------- | ---------------- | ---------------- | ------------------------------------------------------------------ |
| `SGE`           | `sge`            | SGE              | Documento gerado pelo sistema, com template e snapshot da geração. |
| `GrantingParty` | `granting_party` | Parte concedente | Documento gerado pela concedente; registra apenas sua existência.  |

Para documentos de origem `granting_party`, `template_version_id` é nulo e não há upload ou armazenamento de PDF, DOCX ou documento assinado. Templates DOCX do SGE são armazenados separadamente.

## Checklist de implementação

- [x] Criar enum string e rótulos no código.
- [x] Implementar `options()` e `values()`.
- [x] Cobrir cases, valores, rótulos e opções com teste unitário.
- [ ] Adicionar cast em `GeneratedDocument`.
- [ ] Usar o enum na [migration de generated_documents](doc:migration-16-generated-documents).
- [ ] Validar `template_version_id` nulo para `granting_party`.
- [ ] Impedir upload/armazenamento de PDF ou DOCX fornecido pela concedente.
- [ ] Testar as combinações de origem, tipo e status na integração documental.
