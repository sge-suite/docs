---
title: SGE — Migration base 02 — cache
description: Estado atual das tabelas de cache e locks do Laravel.
type: migration-reference
status: implemented
order: 0.2
code_path: database/migrations/0001_01_01_000001_create_cache_table.php
table: cache, cache_locks
tags:
  - sge/migrations
  - sge/infraestrutura
  - sge/banco-de-dados
aliases:
  - Migration atual de cache
---
> [!success] Estado
> Implementada no arquivo `0001_01_01_000001_create_cache_table.php`. É infraestrutura do Laravel, não entidade de negócio.

## Tabelas criadas

| Tabela        | Campos                                                             |
| ------------- | ------------------------------------------------------------------ |
| `cache`       | `key` string PK, `value` mediumText, `expiration` bigint indexado. |
| `cache_locks` | `key` string PK, `owner` string, `expiration` bigint indexado.     |

## Rollback atual

`down()` remove `cache` e `cache_locks` com `dropIfExists()`.

## Uso no SGE

Pode sustentar cache de permissões, rate limiting, sessões auxiliares e locks de Jobs. Não armazenar CPF, tokens, códigos ou conteúdo sensível sem política de expiração/proteção.

## Checklist

- [x] Criar as tabelas padrão.
- [x] Criar índices de chave e expiração.
- [ ] Confirmar driver de cache usado em desenvolvimento, testes e produção.
- [ ] Documentar quais locks evitam duplicidade de Jobs.
- [ ] Testar limpeza/expiração em ambiente controlado.
- [ ] Evitar usar esta tabela como histórico; o histórico pertence às tabelas de domínio/auditoria.
