---
id: migration-22-holidays
title: Migration 22 — holidays
description: Calendário único auditável de feriados nacionais, estaduais e municipais.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/calendario, sge/calculos
related: calendario-de-feriados, enum-holidayscope, enum-brazilianstate, migration-01a-cities, migration-15-internships, migration-22-internship-calendar-overrides
source_refs: https://github.com/sge-suite/sge/blob/master/app/Models/Holiday.php, https://github.com/sge-suite/sge/blob/master/app/Models/HolidayRecurrence.php, https://github.com/sge-suite/sge/blob/master/app/Models/HolidayImportRun.php, https://github.com/sge-suite/sge/blob/master/app/Models/HolidaySource.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/HolidayValidationRules.php, https://github.com/sge-suite/sge/blob/master/app/Console/Commands/ImportHolidays.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ImportHolidayTerritory.php
---
## Estado

Persistência, importação por ano/UF, recorrência municipal fixa, gestão autorizada e consulta local implementadas. Todos os eventos aceitos, inclusive pontos facultativos, bloqueiam o calendário do SGE. A classificação operacional não comprova natureza jurídica. O cálculo inicial de término usa este calendário no envio da solicitação e no aceite; recálculos posteriores e reprodução histórica completa permanecem pendentes.

## Ocorrências — holidays

Mantém `id`, `date`, `name`, `scope`, `state_code`, `city_id`, `deleted_at` e timestamps. Escopos nacionais não possuem localização; estaduais exigem UF e não possuem cidade; municipais exigem cidade e derivam/conferem sua UF. A FK municipal continua `RESTRICT`. O código IBGE único já pertence a `cities`.

| Coluna adicional | Contrato |
| --- | --- |
| `origin` | `manual` por padrão; também `brasil_api` e `recurrence`. Não há origem de transição para bancos antigos. |
| `is_manually_adjusted` | Booleano, falso por padrão; alterações/exclusões/restaurações administrativas protegem a ocorrência da automação. |
| `holiday_recurrence_id` | FK opcional para a recorrência municipal, `RESTRICT`. |
| `occurrence_year` | Ano de geração; permanece estável mesmo se uma ocorrência for corrigida. |

A unicidade territorial inclui `deleted_at` e usa `NULLS NOT DISTINCT`. Não há coluna de campus em ocorrências ou recorrências. Acrescenta-se unicidade por recorrência/ano, inclusive para ocorrências excluídas. Datas coincidentes podem representar eventos distintos. Exclusão lógica não rompe correspondências de origem; exclusão física via Model é proibida.

## Estruturas auxiliares

- `holiday_recurrences`: nome, FK de cidade, mês/dia, anos inicial/final opcionais, observação, `deleted_at` e timestamps. Somente municipais fixos; valida datas usando ano bissexto e compara vigências. Encerramento usa ano final; exclusão lógica e restauração são oferecidas, sem exclusão física. Unicidade por nome/cidade/mês/dia usa `NULLS NOT DISTINCT`.
- `holiday_import_runs`: linha única por ano/território (`national` ou UF), situação, tentativas, consulta/conclusão, erro, URL, payload JSONB e resumo. Uma falha preserva ocorrências e a última resposta válida. Conclusão indica processamento da resposta, não completude jurídica do calendário.
- `holiday_sources`: chave de origem única, FK da consulta, FK opcional da ocorrência, payload, candidatos, situação (`pending`, `linked`, `ignored`), motivo/justificativa, ausência na fonte e última observação. A chave associa o item original mesmo após correções locais ou exclusão lógica. Múltiplas referências podem apontar à mesma ocorrência.

Alterações efetivas em feriados e recorrências registram Activity Log. `holiday_import_runs` e `holiday_sources` guardam o estado técnico da sincronização e revisão, sem `LogsActivity` e sem eventos próprios na auditoria. Ao resolver um item importado, somente as alterações resultantes nos feriados ou recorrências são auditadas. O evento de ocorrência registra também o território atual/anterior para consulta histórica autorizada.

## Migration e bancos existentes

A migration original de holidays cria diretamente ocorrências, recorrências, consultas de importação e correspondências da fonte, sem migration incremental ou classe auxiliar de sincronização. Não há FK de calendário para campi, e a migration de campi voltou a ser independente do calendário. PostgreSQL é obrigatório.

Bancos com versões anteriores serão recriados pelo responsável do ambiente com `migrate:fresh`, conforme decisão do projeto. Não há comando para adaptar schemas antigos. O seed do novo banco prepara o ano atual e os dois seguintes.

## Referências

O comportamento administrativo, a importação, recorrência e aplicação ficam em [Calendário de feriados](doc:calendario-de-feriados), não no contrato de migration. A consulta usada pela abertura e pelo aceite combina ocorrências do calendário único por cidade/UF sem chamar API. Auditoria não substitui snapshots de cálculo; recálculos posteriores e reprodução histórica completa permanecem fora desta entrega.
