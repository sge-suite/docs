---
title: SGE — Migration 22 — non_working_dates
description: Calendário auditável de feriados e demais datas sem expediente usadas na previsão de término.
type: migration-reference
status: planned
order: 22
table: non_working_dates
tags:
  - sge/migrations
  - sge/calendario
  - sge/calculos
---
| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `date` / `name` | data e descrição obrigatórias. |
| `scope` | `NonWorkingDateScope`. |
| `campus_id` | obrigatório somente no escopo `campus`. |
| `uf` | obrigatório em `state` e `municipal`; nulo em `national`. |
| `city` | obrigatório somente em `municipal`. |
| `source` / `source_reference` | origem textual e referência oficial/opcional. |
| `created_by_affiliation_id` | vínculo responsável pelo cadastro/importação. |
| `invalidated_at` / `invalidated_by_affiliation_id` | retirada sem apagar uso histórico. |
| timestamps | auditoria. |

O cálculo de um campus combina datas nacionais, de sua UF, de seu município e do próprio campus. API externa pode sugerir/importar datas, mas o cálculo nunca depende de rede em tempo real. As datas efetivamente consideradas entram em `projected_end_date_calculation`.

Índices: data; `(scope, date)`; `(campus_id, date)`; `(uf, city, date)`. Constraints validam a combinação escopo/localização. Duplicatas lógicas são rejeitadas entre registros não invalidados.
