---
id: migration-13-document-templates
title: Migration 13 — document_templates
description: Catálogo implementado de templates DOCX lógicos, geridos no próprio campus.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/documentos
related: geracao-de-documentos-docx-e-variaveis, migration-14-template-versions, enum-generateddocumenttype, fluxos-principais
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_212413_create_document_templates_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/DocumentTemplate.php
---
> [!success] Estado
> Schema existente reutilizado. Gestão e consulta do catálogo restritas ao próprio campus, com Policy por vínculo ativo. Upload/versionamento pertencem à Migration 14; geração permanece futura. Sem dependência nova; classificação de remuneração consolidada nesta migration, com migration temporária executada no banco existente em 19/10/2026 e depois removida, sem fresh.

## Contrato

`document_templates` representa o template lógico, separado de suas versões. O arquivo DOCX pertence a `template_versions` e é armazenado pelo Media Library; esta tabela não guarda arquivo nem dados de geração.

| Coluna | Tipo PostgreSQL | Nulo | Regra |
| --- | --- | --- | --- |
| `id` | `bigint` | não | Chave primária Laravel. |
| `campus_id` | `bigint` | sim | FK para `campuses.id` com exclusão `RESTRICT`; nulo preserva a representação anterior de modelo global, sem acesso neste fluxo local. |
| `name` | `varchar(255)` | não | Nome legível obrigatório. |
| `description` | `text` | sim | Finalidade opcional. |
| `document_type` | `varchar(255)` | não | Cast de `GeneratedDocumentType`. |
| `remuneration` | `varchar(255)` | não | `any`, `paid` ou `unpaid`, default `any`, índice e cast de `TemplateRemuneration`. Atestado usa somente `any`. |
| `deactivated_at` | `timestamp(0)` | sim | Marca indisponibilidade para novas versões ou gerações futuras. |
| `current_version_id` | `bigint` | sim | Versão vigente escolhida, com FK criada na Migration 14 e `nullOnDelete`. |
| `created_at` / `updated_at` | `timestamp(0)` | sim | Timestamps nativos. |

O `id` identifica o template lógico e é referenciado por `template_versions.document_template_id` na Migration 14. Não há `key` nem unicidade de `name`: nomes iguais podem identificar templates diferentes, inclusive no mesmo campus. A aplicação não depende de chaves de template fixas no código. `campus_id` possui índice simples; o Model exige campus ativo ao atribuir um template local. `active()` filtra a desativação; `availableToCampus()` filtra exclusivamente o campus informado. Esses scopes não substituem a `DocumentTemplatePolicy`: Setor consulta e mantém somente templates do próprio campus. O cadastro deriva o campus do vínculo; formulário e listagem não oferecem escolha de escopo. Registros sem campus permanecem no banco e não são acessíveis por este fluxo.

O Activity Log registra alterações do catálogo. A desativação preserva o registro; uploads respeitam `deactivated_at`; geração futura também deverá respeitar. A relação com `template_versions` está implementada na Migration 14; a proteção de versões utilizadas consulta `generated_documents`, já implementada na Migration 16.

As cláusulas de remuneração são fixas em DOCXs distintos. `remuneration` permite filtrar os modelos compatíveis com a modalidade do estágio; não há variável de parágrafo completo nem formatter jurídico. O atestado único é independente (`any`). Ver [contrato de geração](doc:geracao-de-documentos-docx-e-variaveis).

## Checklist

- [x] Definir identificação, categoria e operação restrita ao próprio campus, preservando o schema existente.
- [x] Criar migration, Model e factory de `DocumentTemplate`.
- [x] Validar escopo, campos obrigatórios e desativação.
- [ ] Testar schema sem `key`, FK, nomes repetidos, casts, scopes, Activity Log e rollback em PostgreSQL.
- [x] Relacionar versões e proteger versões já utilizadas na Migration 14.
- [x] Autorizar upload somente ao vínculo permitido do Setor de Estágio.
- [x] Usar `Media` para armazenar o DOCX da versão.
- [ ] Testar acesso por vínculo/permissão e geração com a versão vigente selecionada.

## Dependências

- [template_versions](doc:migration-14-template-versions)
- [Fluxo de documentos DOCX](doc:fluxos-principais#3-analise-e-formalizacao)

## Unicidade do atestado de orientação

`orientation_certificate` admite somente um registro lógico em todo o sistema, considerando todos os campi, o escopo global e registros desativados. Um segundo cadastro ou a conversão de outro tipo é recusado. O registro existente pode ter seus metadados editados e ser reativado dentro da autorização atual; seu tipo não pode ser trocado para liberar outro cadastro. Os demais tipos continuam admitindo vários templates.

A Action serializa as gravações do catálogo com lock transacional PostgreSQL antes de verificar/gravar; o Model valida a unicidade na persistência. A classificação de remuneração é independente da unicidade institucional. A interface deixa de oferecer atestado no cadastro ou na conversão quando já existir outro, e indica a edição do existente quando autorizada.

O template único continua relacionado a `template_versions`: editar nome/descrição não cria versão; mudar o DOCX cria nova versão sem substituir o arquivo anterior. Unicidade não amplia as permissões entre campi ou a manutenção global. Consulte [GeneratedDocumentType](doc:enum-generateddocumenttype).

## Gestão e ciclo de vida

Cadastro deriva o campus do vínculo e recebe tipo, classificação de remuneração, nome, descrição e DOCX inicial obrigatório pelo componente personalizado `x-file-upload`; não há campo ou seletor de escopo. A gravação do catálogo, da primeira versão e da mídia privada ocorre em uma única transação. Arquivo recusado ou falha no armazenamento desfazem o cadastro e a auditoria da tentativa e limpam a mídia eventualmente criada, sem deixar catálogo vazio nem ocupar o cadastro único de atestado. A primeira versão é validada automaticamente durante o upload e, se aprovada, já é vigente. Não há confirmação posterior. Na edição, o formulário altera somente metadados; novo arquivo é enviado pela gestão de versões. Escopo, tipo e classificação de remuneração ficam congelados após o primeiro upload, inclusive se suas versões forem excluídas. Nome/descrição continuam editáveis. Desativação exige senha atual e confirmação e impede novos uploads sem excluir histórico; reativação exige campus ativo. A exclusão física fica disponível quando nenhuma versão tiver sido usada por documentos, com autorização e senha atual. As versões e os arquivos sem uso são removidos junto com o catálogo, sem exclusão manual prévia. A Action verifica o uso sob lock, preserva a auditoria de cada arquivo e limpa a mídia após o commit; o Model impede exclusão direta com versões remanescentes. O [contrato documental](doc:geracao-de-documentos-docx-e-variaveis) define estados e matriz completa.

O Setor pode escolher outra versão aprovada como vigente, com confirmação e auditoria, sem remover a atual. `current_version_id` é estado operacional do catálogo; não altera o arquivo ou relatório imutável da versão. O Model exige que a versão pertença ao mesmo template e tenha relatório aprovado. A coluna fica na Migration 13 e sua FK na 14 para respeitar a ordem de criação; o banco existente foi atualizado via migration temporária no Sail, sem fresh, preservando a vigente anterior.
