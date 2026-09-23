---
id: migration-09-courses
title: Migration 09 — courses
description: Contrato dos cursos por campus e de seus coordenadores.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/cursos, sge/banco-de-dados
related: migration-03-campuses, migration-04-affiliations, migration-10-course-id-em-affiliations, migration-11-internship-types
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_163548_create_courses_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Course.php, https://github.com/sge-suite/sge/blob/master/database/factories/CourseFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CourseTest.php
---
> [!success] Estado
> Migration, Model, factory, relações, validação e testes PostgreSQL implementados. O cadastro e a edição pela interface permanecem na Fase 05.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | `bigint` autoincremental, chave primária. |
| `campus_id` | `bigint` obrigatório, FK para `campuses.id` com `ON DELETE RESTRICT`. |
| `name` | Nome obrigatório, `varchar(255)`. |
| `primary_coordinator_affiliation_id` | `bigint` nullable, FK para `affiliations.id` com `ON DELETE RESTRICT`. |
| `secondary_coordinator_affiliation_id` | `bigint` nullable, FK para `affiliations.id` com `ON DELETE RESTRICT`. |
| `deactivated_at` | Timestamp nullable; nulo significa curso ativo. |
| `created_at`, `updated_at` | Timestamps convencionais do Laravel. |

O curso pode ser criado sem coordenadores, conforme a decisão para cadastro inicial. Quando atribuídos, os dois vínculos devem ser distintos, ativos, do tipo `Coordinator` e do mesmo campus do curso. `Course` valida isso no momento da atribuição, preservando referências históricas se um coordenador for desativado depois. O campus deve estar ativo ao criar, trocar de campus ou reativar o curso. Não há `CHECK` de domínio nem tabela intermediária de coordenação.

O ciclo do catálogo usa `deactivated_at`, sem `SoftDeletes`; FKs impedem exclusão física de campus ou coordenador referenciado. Esta migration não cria índices secundários explícitos; a escolha ficará para uma etapa posterior, com base nas consultas reais. Nomes iguais no mesmo campus não recebem restrição de unicidade nesta migration porque o contrato não distingue modalidades ou ofertas homônimas; eventual regra de catálogo precisará de decisão própria.

## Checklist

- [x] Fixar os nomes `primary_coordinator_affiliation_id` e `secondary_coordinator_affiliation_id`.
- [x] Criar migration com FKs para `campuses` e `affiliations`.
- [x] Permitir coordenadores nulos durante o cadastro inicial.
- [x] Criar Model `Course`, relações e factory.
- [x] Validar campus, tipo e escopo dos vínculos coordenadores no Model.
- [x] Testar curso de campus ativo, coordenador de outro campus e vínculo desativado.
- [x] Testar migrate/rollback na ordem completa.

## Dependências

- [adicionar course_id a affiliations](doc:migration-10-course-id-em-affiliations)
- [internship_types](doc:migration-11-internship-types)
