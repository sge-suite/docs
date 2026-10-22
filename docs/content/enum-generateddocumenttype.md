---
id: enum-generateddocumenttype
title: Enum — GeneratedDocumentType
description: Tipos de documentos registrados no processo de estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/documentos
related: enum-generateddocumentorigin, enum-generateddocumentstatus, migration-13-document-templates, migration-16-generated-documents
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/GeneratedDocumentType.php
---
> [!info] Decisão
> O catálogo tem três casos e é usado pelos Models `DocumentTemplate` e `GeneratedDocument`. A emissão, reprodução, conferência de assinaturas e histórico de documentos estão implementados; o registro operacional de documentos externos continua pendente.

## Contrato

| Case                     | Valor persistido          | Uso                                                        |
| ------------------------ | ------------------------- | ---------------------------------------------------------- |
| `Main`                   | `main`                    | TCE, rescisão e demais documentos principais/relacionados. |
| `Addendum`               | `addendum`                | Aditivos.                                                  |
| `OrientationCertificate` | `orientation_certificate` | Atestado de orientação.                                    |

O tipo descreve a categoria do documento, não cada template. Templates continuam sendo registros separados, com versões próprias; portanto, novos templates não exigem novos cases neste enum.

O atestado de orientação possui **um único template lógico em todo o sistema**, administrado pelo Setor de Estágio dentro do escopo autorizado. A existência de qualquer registro `orientation_certificate`, inclusive desativado, impede outro cadastro desse tipo em qualquer campus ou no escopo global. Também não é permitido converter outro template para esse tipo quando já existir um. O tipo do atestado existente é preservado: a manutenção ocorre no mesmo cadastro, por edição de metadados e, quando necessário, reativação.

A unicidade do cadastro não elimina o versionamento do DOCX. O único template pode receber novas versões: cada arquivo diferente cria uma revisão independente, a nova pendente preserva a vigente e arquivos utilizados não são sobrescritos ou removidos. O coordenador titular ou substituto autorizado emite atestados de seus cursos, registrando a versão exata utilizada e sem fluxo de assinatura. Não há limite de um documento emitido por este contrato: a unicidade se refere ao template lógico.

Esta regra não amplia acesso entre campi nem concede manutenção global a novos perfis. Sem permissão sobre o cadastro existente, o vínculo não pode editá-lo nem criar um substituto.

[`GeneratedDocumentOrigin`](doc:enum-generateddocumentorigin) descreve quem forneceu/gerou o documento e [`GeneratedDocumentStatus`](doc:enum-generateddocumentstatus) descreve o ciclo do registro.

## Checklist de implementação

- [x] Definir catálogo e nomes conforme a decisão aprovada.
- [x] Definir que aditivo não terá entidade própria inicialmente.
- [x] Criar enum string e rótulos.
- [x] Implementar `options()` e `values()`.
- [x] Adicionar cast em `DocumentTemplate`.
- [x] Impedir segundo template lógico de atestado no sistema, inclusive por conversão de tipo, preservando o cadastro desativado e o versionamento do arquivo.
- [x] Adicionar cast em `GeneratedDocument`.
- [x] Usar o enum na [migration de generated_documents](doc:migration-16-generated-documents).
- [x] Validar no Model as combinações de tipo, origem e status.
- [ ] Testar todos os cases, valores, opções, rótulos e conversão de valores.
- [ ] Validar a emissão do documento principal na preparação para produção.
