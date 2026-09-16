---
id: enum-holidayscope
title: Enum — HolidayScope
description: Escopo territorial de um feriado registrado no calendário do SGE.
type: enum-reference
status: implemented
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

O escopo define quais colunas de localização são exigidas em [`holidays`](doc:migration-22-holidays): nacional não possui UF nem cidade; estadual exige UF; municipal exige `city_id` e deriva sua UF da cidade. O cast `HolidayScope` e a validação do model protegem a regra em importações e demais persistências; um futuro Form Request apenas a repetirá para apresentar erros de entrada.

Não existe escopo `Campus`. Uma exceção específica de um estágio fica em `internship_calendar_overrides`, vinculada diretamente ao estágio.

## Checklist

- [x] Criar enum string com `label()`, `values()` e `options()`.
- [x] Cobrir cases, valores, rótulos e opções com teste unitário.
- [x] Adicionar cast em `Holiday`.
- [x] Validar as combinações de escopo e localização no domínio.
