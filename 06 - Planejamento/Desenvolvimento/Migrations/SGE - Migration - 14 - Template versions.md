---
title: SGE — Migration 14 — template_versions
description: Contrato das versões imutáveis dos templates DOCX.
type: migration-reference
status: planned
order: 14
table: template_versions
tags:
  - sge/migrations
  - sge/documentos
---
> [!todo] Estado
> Planejada. Depende de [[SGE - Migration - 13 - Document templates|`document_templates`]].

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `document_template_id` | FK obrigatória. |
| `version` | inteiro positivo e único dentro do template. |
| `file_sha256` / `file_size` | identidade e tamanho do DOCX recebido. |
| `required_variables` / `optional_variables` | JSONB com o schema declarado da versão. |
| `detected_variables` | JSONB do resultado da inspeção do DOCX. |
| `validation_report` | JSONB de erros, avisos, renderização e versão do validador. |
| `uploaded_by_affiliation_id` | vínculo autorizado que enviou o arquivo. |
| `validated_at` / `validated_by_affiliation_id` | confirmação técnica/visual antes da ativação. |
| `activated_at` / `deactivated_at` | ciclo de disponibilidade. |
| timestamps | auditoria. |

O DOCX é a única mídia da coleção privada `template_file` da versão. Uma versão já utilizada não pode ser alterada ou apagada de forma destrutiva. Novas correções criam nova versão. Para cada template, somente uma versão pode permanecer ativa para novas gerações; ativar uma nova versão desativa a anterior. A atualização do texto não altera documentos que já preservaram a versão usada.

O validador aceita apenas `${NOME_DA_VARIAVEL}` do catálogo canônico, rejeita o dialeto `{{...}}`, relacionamentos externos, macros, variável desconhecida ou marcador obrigatório ausente. A ativação exige geração fictícia e revisão visual de todas as páginas, conforme [[SGE - Geração de documentos DOCX e variáveis]].

## Checklist

- [x] Definir mídia privada única, metadados, schema de variáveis e relatório de validação.
- [ ] Criar migration com unicidade por template e versão.
- [ ] Criar Model, relação com template e cast de datas.
- [ ] Validar DOCX e catálogo de variáveis `${variavel}` antes da ativação.
- [ ] Garantir uma única versão ativa por template lógico.
- [ ] Impedir alteração destrutiva após uso em `generated_documents`.
- [ ] Testar versão ativa/inativa, variável desconhecida e nova versão.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [[SGE - Migration - 16 - Generated documents|generated_documents]]
- [[SGE - Migration - 13 - Document templates|document_templates]]
