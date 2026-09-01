---
title: SGE — Enum — GeneratedDocumentOrigin
description: Origem do documento registrado no processo de estágio.
type: enum-reference
status: implemented
domain: documents
code_path: app/Enums/GeneratedDocumentOrigin.php
tags:
  - sge/enums
  - sge/documentos
aliases:
  - Enum de origem do documento
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
- [ ] Adicionar cast em `GeneratedDocument`.
- [ ] Usar o enum na [[SGE - Migration - 16 - Generated documents|migration de generated_documents]].
- [ ] Validar `template_version_id` nulo para `granting_party`.
- [ ] Impedir upload/armazenamento de PDF ou DOCX fornecido pela concedente.
- [ ] Testar as combinações de origem, tipo e status.
