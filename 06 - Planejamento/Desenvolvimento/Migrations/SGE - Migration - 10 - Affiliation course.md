---
title: SGE — Migration 10 — course_id em affiliations
description: Adiciona o curso obrigatório ao vínculo de discente sem criar ciclo de FK.
type: migration-reference
status: planned
order: 10
table: affiliations
tags:
  - sge/migrations
  - sge/autorizacao
  - sge/cursos
---
> [!todo] Estado
> Planejada. Só pode ser executada depois de [[SGE - Migration - 09 - Courses|`courses`]].

## Contrato

Adicionar `course_id` nullable com FK para `courses`. O campo é obrigatório para `AffiliationType::Student`, nulo para funções que não pertencem a um curso específico, e não permite compartilhar o mesmo vínculo de discente entre cursos.

## Checklist

- [ ] Adicionar coluna e índice de `course_id`.
- [ ] Definir comportamento de exclusão do curso (`restrict` preferencialmente para preservar histórico).
- [ ] Definir se a obrigatoriedade condicional será `CHECK` no PostgreSQL, validação de domínio ou ambos.
- [ ] Atualizar Model `Affiliation` e relação com `Course`.
- [ ] Atualizar factory com vínculo discente por curso.
- [ ] Testar discente sem curso, servidor com curso indevido e dois cursos para a mesma pessoa.
- [ ] Testar escopo: curso e vínculo devem pertencer ao mesmo campus.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [[SGE - Enum - AffiliationType|AffiliationType]]
- [[SGE - Migration - 04 - Affiliations|affiliations]]
- [[SGE - Migration - 09 - Courses|courses]]
