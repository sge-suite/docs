---
id: migration-04-affiliations
title: Migration 04 — affiliations
description: Contrato base dos vínculos institucionais e seu contexto de acesso.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/autorizacao
related: migration-03-campuses, migration-10-course-id-em-affiliations, enum-affiliationtype, migration-09-courses, modelo-de-dados-acesso
source_refs:
---
> [!todo] Estado
> Planejada. Depende de `users` e [`campuses`](doc:migration-03-campuses). Esta primeira versão não deve incluir `course_id`; ele entra na [migration 10](doc:migration-10-course-id-em-affiliations).

## Contrato base

| Campo                 | Regra                                                                      |
| --------------------- | -------------------------------------------------------------------------- |
| `id`                  | bigint, chave primária.                                                    |
| `user_id`             | FK obrigatória para `users`.                                               |
| `campus_id`           | FK nullable; nulo somente para funções globais.                            |
| `type`                | enum/string conforme [Enum — AffiliationType](doc:enum-affiliationtype) (`AffiliationType`). |
| `registration_number` | obrigatório para discentes/servidores; nulo para supervisores.             |
| `email`               | e-mail do contexto, obrigatório.                                           |
| `deactivated_at`      | nullable; desativa sem apagar a conta.                                     |
| `last_used_at`        | nullable; último uso do contexto.                                          |

Uma pessoa pode ter muitos vínculos. O campus não é trocado dentro do mesmo registro. A matrícula de discente é única; para servidores pode se repetir entre funções; supervisor não possui matrícula institucional.

## Checklist

- [ ] Criar migration sem `course_id` para quebrar o ciclo com `courses`.
- [ ] Definir FKs e `restrict`/`nullOnDelete` conforme o ciclo de vida institucional.
- [ ] Criar índices para `user_id`, `campus_id`, `type` e vínculos ativos.
- [ ] Criar Model `Affiliation` com cast de `AffiliationType`.
- [ ] Implementar validação condicional de campus, curso futuro e matrícula.
- [ ] Criar factory para vínculo global, campus, servidor, discente e supervisor.
- [ ] Testar múltiplos vínculos, desativação, escopo e matrícula.
- [ ] Adicionar `legal_representative_affiliation_id` em `campuses` após esta tabela.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [AffiliationType](doc:enum-affiliationtype)
- [courses](doc:migration-09-courses)
- [course_id em affiliations](doc:migration-10-course-id-em-affiliations)
- [Modelo de acesso](doc:modelo-de-dados-acesso)
