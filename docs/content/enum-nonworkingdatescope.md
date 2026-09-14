---
id: enum-nonworkingdatescope
title: Enum — NonWorkingDateScope
description: Escopo territorial ou institucional de uma data sem expediente.
type: enum-reference
status: planned
visibility: public
tags: sge/enums, sge/calendario
related: migration-22-non-working-dates
source_refs:
---
| Case | Valor | Rótulo |
| --- | --- | --- |
| `National` | `national` | Nacional |
| `State` | `state` | Estadual |
| `Municipal` | `municipal` | Municipal |
| `Campus` | `campus` | Campus |

O escopo define quais campos de localização são exigidos na [Migration 22 — non_working_dates](doc:migration-22-non-working-dates). A origem da informação não é enum: fica em string/metadados para permitir fonte oficial, importação ou cadastro manual sem mudança de código.
