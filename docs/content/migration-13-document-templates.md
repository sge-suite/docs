---
id: migration-13-document-templates
title: Migration 13 — document_templates
description: Catálogo implementado de templates DOCX lógicos, globais ou por campus.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/documentos
related: geracao-de-documentos-docx-e-variaveis, migration-14-template-versions, enum-generateddocumenttype, fluxos-principais
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_212413_create_document_templates_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/DocumentTemplate.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/DocumentTemplateTest.php
---
> [!success] Estado
> Migration, Model, factory, relação com campus, cast do tipo documental, validação, Activity Log e testes PostgreSQL implementados. Versões, arquivos DOCX, upload, autorização e geração ainda não fazem parte desta etapa.

## Contrato

`document_templates` representa o template lógico, separado de suas versões. O arquivo DOCX pertence a `template_versions` e é armazenado pelo Media Library; esta tabela não guarda arquivo nem dados de geração.

| Coluna | Tipo PostgreSQL | Nulo | Regra |
| --- | --- | --- | --- |
| `id` | `bigint` | não | Chave primária Laravel. |
| `campus_id` | `bigint` | sim | FK para `campuses.id` com exclusão `RESTRICT`; nulo indica modelo global. |
| `name` | `varchar(255)` | não | Nome legível obrigatório. |
| `description` | `text` | sim | Finalidade opcional. |
| `document_type` | `varchar(255)` | não | Cast de `GeneratedDocumentType`. |
| `deactivated_at` | `timestamp(0)` | sim | Marca indisponibilidade para novas versões ou gerações futuras. |
| `created_at` / `updated_at` | `timestamp(0)` | sim | Timestamps nativos. |

O `id` identifica o template lógico e é referenciado por `template_versions.document_template_id` na Migration 14. Não há `key` nem unicidade de `name`: nomes iguais podem identificar templates diferentes, inclusive no mesmo campus. A aplicação não depende de chaves de template fixas no código. `campus_id` possui índice simples; o Model exige campus ativo ao atribuir um template local. `active()` filtra a desativação; `availableToCampus()` reúne os templates globais e os daquele campus. Esses scopes ainda não substituem autorização por vínculo.

O Activity Log registra alterações do catálogo. A desativação preserva o registro; os fluxos futuros de versão e geração deverão respeitar `deactivated_at`. A relação com `template_versions` está implementada na Migration 14; a proteção de versões utilizadas será concluída com `generated_documents`.

O template padrão manterá o marcador `${PARAGRAFO_REMUNERACAO}`. Na geração, `RemunerationParagraphFormatter` preencherá o parágrafo completo conforme a remuneração. Essa regra e a escolha manual do template para modelos especiais ou credenciamentos permanecem no [contrato de geração](doc:geracao-de-documentos-docx-e-variaveis); não há seleção automática por concedente.

## Checklist

- [x] Definir identificação, categoria e escopo global/por campus.
- [x] Criar migration, Model e factory de `DocumentTemplate`.
- [x] Validar escopo, campos obrigatórios e desativação.
- [x] Testar schema sem `key`, FK, nomes repetidos, casts, scopes, Activity Log e rollback em PostgreSQL.
- [ ] Relacionar versões e proteger versões já utilizadas na Migration 14.
- [ ] Autorizar upload somente ao vínculo permitido do Setor de Estágio.
- [ ] Usar `Media` para armazenar o DOCX da versão.
- [ ] Testar acesso por vínculo/permissão e geração com a versão validada mais recente.

## Dependências

- [template_versions](doc:migration-14-template-versions)
- [Fluxo de documentos DOCX](doc:fluxos-principais#3-analise-e-formalizacao)
