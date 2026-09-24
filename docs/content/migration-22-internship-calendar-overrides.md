---
id: migration-22-internship-calendar-overrides
title: Migration 22A — internship_calendar_overrides
description: Exceções de uma data de calendário para um estágio específico.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/calendario, sge/estagio
related: migration-15-internships, migration-22-holidays, migration-base-04-activity-log
source_refs:
---
> [!success] Estado
> Migration, Model, factory, relação e unicidade por estágio/data implementados. Autorização e recálculo da previsão permanecem no fluxo funcional.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da exceção. |
| `internship_id` | `bigint` | não | `FK`, `UQ` com `date` | Estágio afetado; `RESTRICT`. |
| `date` | `date` | não | `UQ` com `internship_id` | Uma data por registro; feriadão usa registros separados. |
| `is_working_day` | `boolean` | não | — | `true` libera expediente; `false` bloqueia expediente. |
| `reason` | `text` | não | — | Justificativa obrigatória. |

| `created_at` | `timestamp(0)` | não | — | Auditoria. |
| `updated_at` | `timestamp(0)` | não | — | Auditoria técnica. |

Uma exceção não modifica `holidays` e não é um escopo territorial. O cálculo consulta primeiro os feriados aplicáveis e depois substitui o resultado somente para a data e o estágio indicados. Recessos, folgas, pontes e fechamentos específicos devem ser registrados como pausas do estágio. Toda criação, alteração ou invalidação gera Activity Log; o Model proíbe a exclusão física, preservando inclusive exceções que poderão participar de uma previsão. A autoria fica no Activity Log.

## Checklist

- [x] Criar migration com `UNIQUE (internship_id, date)` e `RESTRICT`.
- [x] Criar Model, factory, relação, validações e Activity Log.
- [ ] Criar Policy e autorização exclusiva do Setor de Estágio.
- [ ] Recalcular a previsão após alteração autorizada.
- [ ] Testar liberação de feriado, bloqueio de dia comum e datas duplicadas.
