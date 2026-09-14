---
id: migration-09-courses
title: Migration 09 — courses
description: Contrato dos cursos por campus e de seus coordenadores.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/cursos, sge/banco-de-dados
related: migration-03-campuses, migration-04-affiliations, migration-10-course-id-em-affiliations, migration-11-internship-types
source_refs:
---
> [!todo] Estado
> Planejada. Depende de [`campuses`](doc:migration-03-campuses) e [`affiliations`](doc:migration-04-affiliations).

## Contrato

| Campo                 | Regra                                                         |
| --------------------- | ------------------------------------------------------------- |
| `id`                  | bigint, chave primária.                                       |
| `campus_id`           | FK obrigatória para o campus.                                 |
| `name`                | nome do curso, obrigatório.                                   |
| coordenadores         | dois campos FK para `affiliations`, conforme nomes aprovados. |
| timestamps / exclusão | definir conforme ciclo de catálogo.                           |

Os coordenadores são vínculos, não texto livre nem usuários genéricos. O curso não deve criar tabela intermediária de coordenação neste primeiro desenho. As referências usam `affiliations` para preservar campus, função e desativação do vínculo.

## Checklist

- [ ] Confirmar nomes e obrigatoriedade das duas FKs de coordenador.
- [ ] Criar migration com FKs para `campuses` e `affiliations`.
- [ ] Definir se coordenadores podem ser nulos durante o cadastro.
- [ ] Criar Model `Course`, relações e factory.
- [ ] Aplicar escopo de campus e validação do tipo do vínculo coordenador.
- [ ] Testar curso de campus ativo, coordenador de outro campus e vínculo desativado.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [adicionar course_id a affiliations](doc:migration-10-course-id-em-affiliations)
- [internship_types](doc:migration-11-internship-types)
