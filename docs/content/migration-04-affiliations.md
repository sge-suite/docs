---
id: migration-04-affiliations
title: Migration 04 — affiliations
description: Fundação dos vínculos institucionais e do contexto de acesso.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/autorizacao
related: migration-03-campuses, migration-10-course-id-em-affiliations, enum-affiliationtype, migration-09-courses, modelo-de-dados-acesso, fase-04-conta-e-contexto
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_105745_create_affiliations_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Affiliation.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/AffiliationValidationRules.php, https://github.com/sge-suite/sge/blob/master/database/factories/AffiliationFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AffiliationTest.php
---
> [!success] Estado
> Migration, model, validação, factory, relações e Activity Log estão implementados. A migration depende de `users` e [`campuses`](doc:migration-03-campuses). O contrato foi verificado no PostgreSQL por Sail. A seleção na sessão e a integração com login permanecem na [Fase 04](doc:fase-04-conta-e-contexto).

## Schema PostgreSQL

| Campo | Tipo e regra |
| --- | --- |
| `id` | `bigint`, chave primária. |
| `user_id` | `bigint` obrigatório, FK para `users.id` com `ON DELETE RESTRICT`. |
| `campus_id` | `bigint` nullable, FK para `campuses.id` com `ON DELETE RESTRICT`. Nulo somente em vínculo de `SystemAdministrator`. |
| `type` | `varchar(255)`, convertido pelo cast PHP [`AffiliationType`](doc:enum-affiliationtype) e validado antes de persistir. |
| `registration_number` | `varchar(255)` nullable; obrigatório nos tipos diferentes de `Supervisor`. |
| `email` | `varchar(255)` obrigatório; e-mail de contato do contexto. |
| `deactivated_at` | `timestamp(0)` nullable; nulo significa vínculo ativo. |
| `last_used_at` | `timestamp(0)` nullable; último vínculo explicitamente selecionado. |
| `created_at`, `updated_at` | timestamps convencionais do Laravel. |

Não há `course_id` nem `deleted_at`. A ausência de curso nesta migration é intencional: `courses` ainda não existe e a Migration 10 adicionará a FK obrigatória para vínculos de discente. Até essa alteração estar implementada, os fluxos de criação de vínculos discentes por interface não entram em produção. `Affiliation` não usa `SoftDeletes`: o ciclo de vida do vínculo usa `deactivated_at`.

### FKs e índices

- A exclusão física de um usuário ou campus referenciado é restringida. A exclusão lógica de `Campus` não remove nem altera a FK.
- A migration cria somente a chave primária e as FKs; índices secundários ficam para quando as consultas reais indicarem necessidade.
- As regras de tipo, campus obrigatório, matrícula e unicidade de matrícula discente são validadas pelo model em PHP. O cast de `AffiliationType` converte os valores para o enum e rejeita valores desconhecidos ao acessar o atributo.
- Matrículas de servidores podem se repetir entre funções. Não há unicidade global de e-mail, matrícula de servidor ou combinação usuário/tipo/campus.

## Model, relações e validação

`Affiliation` usa o cast `AffiliationType` e casts datetime para `deactivated_at` e `last_used_at`. As relações são `Affiliation → User`, `Affiliation → Campus`, `User → affiliations` e `Campus → affiliations`.

`AffiliationValidationRules` é executado ao salvar e centraliza:

- enum válido, usuário existente, e-mail obrigatório válido e datas opcionais válidas;
- campus obrigatório por tipo, campus existente e campus ativo/não excluído ao criar, trocar campus ou reativar;
- preservação de vínculos existentes quando o campus é posteriormente desativado;
- matrícula obrigatória para tipos diferentes de supervisor, proibida para supervisor e única somente para discente.

Uma pessoa pode ter vários vínculos, inclusive do mesmo tipo e campus. O campus é um atributo do vínculo e não muda por seleção de contexto.

O scope `active()` filtra `deactivated_at IS NULL`. `orderByLastUsedAt()` ordena por `last_used_at DESC NULLS LAST` e desempata por `id ASC`, evitando a ordenação padrão de nulos do PostgreSQL.

## Último contexto usado

`last_used_at` é memória operacional do último vínculo selecionado ou usado numa troca explícita de contexto. `markAsUsed()` atualiza o timestamp somente quando chamado para um vínculo persistido e ativo. Leituras e requisições comuns não o atualizam.

O campo não é auditado pelo Activity Log e não representa login, logout ou trilha de autenticação. A futura integração da Fase 04 poderá restaurar um vínculo ativo mais recentemente usado; vínculo desativado nunca é elegível. Se houver um único vínculo ativo, o fluxo poderá selecioná-lo diretamente. Com múltiplos vínculos ativos e nenhum uso anterior, a Fase 04 deverá pedir escolha em vez de selecionar pelo desempate técnico.

## Factory e auditoria

`AffiliationFactory` fornece os estados `global()`, `onCampus()`, `server()`, `student()`, `supervisor()`, `deactivated()` e `recentlyUsed()`.

O Spatie Activity Log registra criação e alterações relevantes nos dados fillable, incluindo tipo, campus, matrícula, e-mail e desativação/reativação. `last_used_at` não é fillable nem auditado; uma alteração isolada não cria atividade.

## Testes verificados

`tests/Feature/AffiliationTest.php` contém 22 testes e 158 assertions para schema, rollback/reaplicação, FKs, relações, validação PHP e cast enum, factory, ativação, ordenação e Activity Log. Passou no PostgreSQL por Sail em 22/09/2026.

A suíte completa por Sail passou com 230 testes, 228 aprovados, 2 ignorados e 1.069 assertions. A implementação não inclui telas, sessão, middleware, Policies, Gates ou fluxo de login.

## Dependências

- [`AffiliationType`](doc:enum-affiliationtype)
- [`campuses`](doc:migration-03-campuses)
- [`courses`](doc:migration-09-courses)
- [`course_id` em affiliations](doc:migration-10-course-id-em-affiliations)
- [Modelo de acesso](doc:modelo-de-dados-acesso)
