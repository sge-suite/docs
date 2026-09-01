---
title: SGE — Migration 13 — document_templates
description: Contrato do catálogo de templates DOCX do SGE.
type: migration-reference
status: planned
order: 13
table: document_templates
tags:
  - sge/migrations
  - sge/documentos
---
> [!todo] Estado
> Planejada. Não depende de `internships`, pois o catálogo pode ser preparado antes dos processos.

## Contrato

Representa o documento lógico/template, separado de suas versões. O arquivo DOCX pertence à versão e será armazenado por `Media`; a tabela não deve guardar o binário diretamente.

O template padrão mantém o marcador `${PARAGRAFO_REMUNERACAO}`. Na geração, `RemunerationParagraphFormatter` preenche esse marcador com o §1º completo de remuneração ou de não remuneração, conforme `is_remunerated`, bolsa e auxílio-transporte. O texto aprovado desse parágrafo é regra de domínio centralizada no serviço; não há tabela genérica de regras ou cláusulas. O número de processo de credenciamento é apenas outro dado de substituição quando houver.

No uso pelo Setor de Estágio, enviar uma nova versão apenas substitui o texto ativo de um template existente. Modelos inteiramente próprios de uma concedente, como os de instituições parceiras específicas, são templates independentes. Quando o credenciamento alterar materialmente o documento, o Setor escolhe manualmente o template e a versão ativos na geração; não há associação ou regra automática que selecione um modelo por concedente, remuneração ou credenciamento.

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `campus_id` | FK nullable; nulo para modelo global, preenchido para modelo próprio do campus. |
| `key` | chave estável e única no escopo, em `snake_case`. |
| `name` / `description` | identificação humana e finalidade. |
| `document_type` | cast de `GeneratedDocumentType`; categoria do registro gerado. |
| `deactivated_at` | bloqueia novas versões/gerações sem apagar histórico. |
| timestamps | auditoria; autoria detalhada fica nas versões e no Activity Log. |

## Checklist

- [x] Definir identificação, categoria e escopo global/por campus.
- [ ] Criar migration e Model `DocumentTemplate`.
- [ ] Relacionar versões sem permitir exclusão destrutiva de versão utilizada.
- [ ] Autorizar upload somente ao vínculo permitido do Setor de Estágio.
- [ ] Usar `Media` para armazenar o DOCX.
- [ ] Testar template ativo, inativo e acesso por campus/permissão.
- [ ] Testar migrate/rollback na ordem completa.

O catálogo, a sintaxe e o fluxo estão em [[SGE - Geração de documentos DOCX e variáveis]].

## Dependências

- [[SGE - Migration - 14 - Template versions|template_versions]]
- [[SGE - Fluxos principais#3 Análise e formalização|Fluxo de documentos DOCX]]
