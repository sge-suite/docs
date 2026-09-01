---
title: SGE — Enum — NonWorkingDateScope
description: Escopo territorial ou institucional de uma data sem expediente.
type: enum-reference
status: planned
domain: calendar
tags:
  - sge/enums
  - sge/calendario
---
| Case | Valor | Rótulo |
| --- | --- | --- |
| `National` | `national` | Nacional |
| `State` | `state` | Estadual |
| `Municipal` | `municipal` | Municipal |
| `Campus` | `campus` | Campus |

O escopo define quais campos de localização são exigidos na [[SGE - Migration - 22 - Non-working dates]]. A origem da informação não é enum: fica em string/metadados para permitir fonte oficial, importação ou cadastro manual sem mudança de código.
