---
title: SGE — Migration base 03 — jobs
description: Estado atual das filas, lotes e falhas de Jobs do Laravel.
type: migration-reference
status: implemented
order: 0.3
code_path: database/migrations/0001_01_01_000002_create_jobs_table.php
table: jobs, job_batches, failed_jobs
tags:
  - sge/migrations
  - sge/filas
  - sge/banco-de-dados
aliases:
  - Migration atual de jobs
---
> [!success] Estado
> Implementada no arquivo `0001_01_01_000002_create_jobs_table.php`. É a base para envio de e-mails, importações e lotes documentais demorados. A geração DOCX unitária é síncrona e temporária para permitir download sem armazenamento definitivo.

## Tabelas criadas

| Tabela        | Campos principais                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `jobs`        | `id`, `queue` indexada, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`.        |
| `job_batches` | `id`, nome, totais, pendências, falhas, opções e timestamps Unix do lote.                          |
| `failed_jobs` | `id`, `uuid` único, conexão, fila, payload, exception e `failed_at`; índice por conexão/fila/data. |

## Uso no SGE

Jobs de e-mail devem combinar esta infraestrutura com [[SGE - Migration - 07 - Email delivery attempts|`email_delivery_attempts`]], que é o histórico de negócio. `failed_jobs` sozinho não substitui o registro da tentativa nem deve receber segredos no payload/exceção.

## Rollback atual

`down()` remove `jobs`, `job_batches` e `failed_jobs` com `dropIfExists()`.

## Checklist

- [x] Criar filas, lotes e falhas.
- [x] Indexar fila e falhas para consulta operacional.
- [ ] Definir conexão/queue para e-mail, lotes documentais e importação.
- [ ] Configurar retry, backoff, timeout e limite de tentativas por tipo de Job.
- [ ] Sanitizar payload/exceções para não persistir tokens ou credenciais.
- [ ] Testar idempotência e reprocessamento dos Jobs de domínio.
