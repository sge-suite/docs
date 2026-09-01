---
title: SGE — Enum — GeneratedDocumentType
description: Tipos de documentos registrados no processo de estágio.
type: enum-reference
status: implemented
domain: documents
code_path: app/Enums/GeneratedDocumentType.php
tags:
  - sge/enums
  - sge/documentos
aliases:
  - Enum de tipo de documento gerado
---
> [!info] Decisão
> O catálogo está definido com três casos e o enum já foi implementado em `app/Enums/GeneratedDocumentType.php`. A integração com `generated_documents` ainda está pendente.

## Contrato

| Case                     | Valor persistido          | Uso                                                        |
| ------------------------ | ------------------------- | ---------------------------------------------------------- |
| `Main`                   | `main`                    | TCE, rescisão e demais documentos principais/relacionados. |
| `Addendum`               | `addendum`                | Aditivos.                                                  |
| `OrientationCertificate` | `orientation_certificate` | Atestado de orientação.                                    |

O tipo descreve a categoria do documento, não cada template. Templates continuam sendo registros separados, com versões próprias; portanto, novos templates não exigem novos cases neste enum.

O atestado de orientação terá um template ativo administrado pelo setor de estágio. Esse template poderá ser versionado e será utilizado pelos coordenadores. A emissão do atestado apenas registra a geração, sem fluxo de assinatura.

[[SGE - Enum - GeneratedDocumentOrigin|`GeneratedDocumentOrigin`]] descreve quem forneceu/gerou o documento e [[SGE - Enum - GeneratedDocumentStatus|`GeneratedDocumentStatus`]] descreve o ciclo do registro.

## Checklist de implementação

- [x] Definir catálogo e nomes conforme a decisão aprovada.
- [x] Definir que aditivo não terá entidade própria inicialmente.
- [x] Criar enum string e rótulos.
- [x] Implementar `options()` e `values()`.
- [ ] Adicionar cast em `GeneratedDocument`.
- [ ] Usar o enum na [[SGE - Migration - 16 - Generated documents|migration de generated_documents]].
- [ ] Validar combinação de tipo, origem e status.
- [x] Testar todos os cases, valores, opções, rótulos e conversão de valores.
- [ ] Testar a geração do documento principal quando o fluxo documental for implementado.
