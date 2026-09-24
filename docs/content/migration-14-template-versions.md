---
id: migration-14-template-versions
title: Migration 14 — template_versions
description: Contrato das versões dos templates DOCX e preservação após uso.
type: migration-reference
status: in-progress
visibility: public
tags: sge/migrations, sge/documentos
related: migration-13-document-templates, geracao-de-documentos-docx-e-variaveis, migration-16-generated-documents
source_refs:
---
> [!info] Estado
> Schema, Model, factory, coleção privada do Media Library e testes PostgreSQL implementados. O upload validado e o bloqueio de alteração após uso dependem do fluxo documental e de `generated_documents`. Depende de [`document_templates`](doc:migration-13-document-templates), [`affiliations`](doc:migration-04-affiliations) e da tabela `media` já fornecida pelo Media Library.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `document_template_id` | FK obrigatória. |
| `version` | inteiro positivo e único dentro do template. |
| `file_sha256` / `file_size` | identidade e tamanho do DOCX recebido; o hash não se repete dentro do mesmo template lógico. |
| `required_variables` / `optional_variables` | JSONB com o schema declarado da versão. |
| `detected_variables` | JSONB do resultado da inspeção do DOCX. |
| `validation_report` | JSONB de erros, avisos, renderização e versão do validador. |
| `uploaded_by_affiliation_id` | vínculo autorizado que enviou o arquivo. |
| `validated_at` / `validated_by_affiliation_id` | confirmação técnica/visual antes de disponibilizar a versão para geração. |
| timestamps | auditoria. |

O DOCX original é armazenado pelo Spatie Media Library na coleção privada `template_file`, com uma mídia por versão. A tabela `template_versions` registra revisões do arquivo recebido e seu contrato de variáveis; **não** recebe uma linha por documento gerado. O catálogo de variáveis aceitas é fixo no código, enquanto cada DOCX utiliza apenas as variáveis necessárias. O hash impede criar uma segunda versão do mesmo template com o mesmo arquivo.

A geração seleciona a versão **validada mais recente** pelo maior número de versão e registra seu ID em `generated_documents.template_version_id`. Uma versão enviada, mas ainda não validada, não substitui a última versão validada. Se o Setor corrigir um DOCX que já gerou documentos, envia outro arquivo como nova versão; a anterior e seus documentos permanecem íntegros. Uma versão sem documentos gerados pode ser excluída fisicamente, incluindo sua mídia. Quando `generated_documents` for criada, a FK com exclusão restrita e as regras de atualização impedirão exclusão ou alteração destrutiva da versão utilizada. Não há ativação ou desativação manual de versões.

O validador aceita apenas `${NOME_DA_VARIAVEL}` do catálogo canônico, rejeita o dialeto `{{...}}`, relacionamentos externos, macros, variável desconhecida ou marcador obrigatório ausente. A validação antes do uso exige geração fictícia e revisão visual de todas as páginas, conforme [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis).

## Checklist

- [x] Definir mídia privada única, metadados, schema de variáveis e relatório de validação.
- [x] Criar migration com unicidade por template/versão e template/hash.
- [x] Criar Model, relação com template, casts e coleção privada única no Media Library.
- [ ] Validar DOCX e catálogo de variáveis `${variavel}` antes do uso.
- [x] Selecionar a versão validada mais recente do template lógico.
- [ ] Impedir alteração destrutiva e exclusão após uso em `generated_documents`; permitir exclusão física enquanto não houver uso.
- [x] Testar seleção da versão validada, duplicidade de arquivo e nova versão.
- [ ] Testar inspeção OOXML, variável desconhecida e proteção de versão utilizada.
- [x] Testar migrate/rollback da 14 e rollback da 13 na ordem das FKs.

## Dependências

- [generated_documents](doc:migration-16-generated-documents)
- [document_templates](doc:migration-13-document-templates)
