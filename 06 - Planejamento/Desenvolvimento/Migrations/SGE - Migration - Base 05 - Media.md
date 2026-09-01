---
title: SGE — Migration base 05 — media
description: Estado atual do armazenamento de mídia polimórfica do Spatie Media Library.
type: migration-reference
status: implemented
order: 0.5
code_path: database/migrations/2026_08_06_201414_create_media_table.php
table: media
tags:
  - sge/migrations
  - sge/arquivos
  - sge/banco-de-dados
aliases:
  - Migration atual de media
---
> [!success] Estado
> Implementada no arquivo `2026_08_06_201414_create_media_table.php` para o Spatie Media Library.

## Contrato atual

| Campo                                   | Regra                                                                               |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`                                    | bigint, chave primária.                                                             |
| `model_type` / `model_id`               | morph obrigatório e indexado.                                                       |
| `uuid`                                  | nullable e único.                                                                   |
| `collection_name`, `name`, `file_name`  | identificação do arquivo.                                                           |
| `mime_type`, `disk`, `conversions_disk` | armazenamento/conversões.                                                           |
| `size`                                  | unsigned integer grande.                                                            |
| JSONs                                   | `manipulations`, `custom_properties`, `generated_conversions`, `responsive_images`. |
| `order_column`                          | nullable e indexado.                                                                |
| timestamps                              | nullable.                                                                           |

## Uso no SGE

Templates DOCX podem usar `Media`. Documentos finais gerados e arquivos fornecidos pela concedente continuam fora do escopo, conforme [[SGE - Migration - 16 - Generated documents|`generated_documents`]].

## Rollback atual

O arquivo não define `down()`. Não remover a tabela em produção manualmente sem confirmar o impacto nos arquivos físicos e no banco.

## Checklist

- [x] Criar morphs e metadados de mídia.
- [x] Criar campos JSON e discos de conversão.
- [ ] Definir collections permitidas para templates.
- [ ] Validar MIME, tamanho e extensão DOCX no upload.
- [ ] Definir política de exclusão de mídia órfã.
- [ ] Testar associação de template/version a `Media`.
- [ ] Documentar discos locais e de produção.
