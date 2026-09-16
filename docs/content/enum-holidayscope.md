---
id: enum-holidayscope
title: Enum — HolidayScope
description: Escopo territorial de um feriado registrado no calendário do SGE.
type: enum-reference
status: planned
visibility: public
tags: sge/enums, sge/calendario
related: migration-22-holidays
source_refs:
---
| Case | Valor | Rótulo |
| --- | --- | --- |
| `National` | `national` | Nacional |
| `State` | `state` | Estadual |
| `Municipal` | `municipal` | Municipal |

O escopo define quais colunas de localização são exigidas em [`holidays`](doc:migration-22-holidays): nacional não possui UF nem cidade; estadual possui UF; municipal possui `city_id`. A origem continua sendo texto auditado, porque pode ser BrasilAPI, cadastro manual ou fonte oficial.

Não existe escopo `Campus`. Uma exceção específica de um estágio fica em `internship_calendar_overrides`, vinculada diretamente ao estágio.

## Checklist

- [ ] Criar enum string com `label()`, `values()` e `options()`.
- [ ] Cobrir cases, valores, rótulos e opções com teste unitário.
- [ ] Adicionar cast em `Holiday`.
- [ ] Validar as combinações de escopo e localização na migration e no domínio.
