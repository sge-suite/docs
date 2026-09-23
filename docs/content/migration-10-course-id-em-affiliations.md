---
id: migration-10-course-id-em-affiliations
title: Migration 10 — course_id em affiliations
description: Adiciona o curso obrigatório ao vínculo de discente sem criar ciclo de FK.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/autorizacao, sge/cursos
related: migration-09-courses, enum-affiliationtype, migration-04-affiliations
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_163558_add_course_id_to_affiliations_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Affiliation.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/AffiliationValidationRules.php, https://github.com/sge-suite/sge/blob/master/database/factories/AffiliationFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CourseTest.php
---
> [!success] Estado
> Migration, validação no Model, factory, relações e testes PostgreSQL implementados após [`courses`](doc:migration-09-courses).

## Contrato

`course_id` é `bigint` nullable, FK para `courses.id` com `ON DELETE RESTRICT`. `AffiliationValidationRules` exige o campo para `AffiliationType::Student` e o proíbe para os demais tipos. O curso escolhido deve pertencer ao mesmo campus do vínculo e estar ativo na atribuição ou reativação. Uma desativação posterior do curso não apaga o vínculo histórico nem bloqueia alterações que não mudem sua associação. Cada curso adicional da mesma conta exige outro vínculo de discente. A Migration 04 não contém essa FK porque `courses` precisa ser criada antes; não há `CHECK` de domínio nem índice secundário explícito nesta etapa.

## Checklist

- [x] Adicionar coluna `course_id` e adiar índice secundário para análise das consultas reais.
- [x] Restringir a exclusão física do curso referenciado.
- [x] Aplicar obrigatoriedade condicional e coerência de campus no Model, sem `CHECK` de domínio.
- [x] Atualizar Model `Affiliation` e relação com `Course`.
- [x] Atualizar factory com vínculo discente por curso.
- [x] Testar discente sem curso, servidor com curso indevido e dois cursos para a mesma pessoa.
- [x] Testar escopo: curso e vínculo devem pertencer ao mesmo campus.
- [x] Testar migrate/rollback na ordem completa.

## Dependências

- [AffiliationType](doc:enum-affiliationtype)
- [affiliations](doc:migration-04-affiliations)
- [courses](doc:migration-09-courses)
