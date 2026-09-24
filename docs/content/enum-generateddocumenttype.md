---
id: enum-generateddocumenttype
title: Enum — GeneratedDocumentType
description: Tipos de documentos registrados no processo de estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/documentos
related: enum-generateddocumentorigin, enum-generateddocumentstatus, migration-13-document-templates, migration-16-generated-documents
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/GeneratedDocumentType.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/GeneratedDocumentTypeTest.php
---
> [!info] Decisão
> O catálogo tem três casos e é usado pelo cast de `DocumentTemplate`. A integração com `generated_documents` ainda está pendente.

## Contrato

| Case                     | Valor persistido          | Uso                                                        |
| ------------------------ | ------------------------- | ---------------------------------------------------------- |
| `Main`                   | `main`                    | TCE, rescisão e demais documentos principais/relacionados. |
| `Addendum`               | `addendum`                | Aditivos.                                                  |
| `OrientationCertificate` | `orientation_certificate` | Atestado de orientação.                                    |

O tipo descreve a categoria do documento, não cada template. Templates continuam sendo registros separados, com versões próprias; portanto, novos templates não exigem novos cases neste enum.

O atestado de orientação terá um template ativo administrado pelo setor de estágio. Esse template poderá ser versionado e será utilizado pelos coordenadores. A emissão do atestado apenas registra a geração, sem fluxo de assinatura.

[`GeneratedDocumentOrigin`](doc:enum-generateddocumentorigin) descreve quem forneceu/gerou o documento e [`GeneratedDocumentStatus`](doc:enum-generateddocumentstatus) descreve o ciclo do registro.

## Checklist de implementação

- [x] Definir catálogo e nomes conforme a decisão aprovada.
- [x] Definir que aditivo não terá entidade própria inicialmente.
- [x] Criar enum string e rótulos.
- [x] Implementar `options()` e `values()`.
- [x] Adicionar cast em `DocumentTemplate`.
- [ ] Adicionar cast em `GeneratedDocument`.
- [ ] Usar o enum na [migration de generated_documents](doc:migration-16-generated-documents).
- [ ] Validar combinação de tipo, origem e status.
- [x] Testar todos os cases, valores, opções, rótulos e conversão de valores.
- [ ] Testar a geração do documento principal quando o fluxo documental for implementado.
