---
id: enum-educationlevel
title: Enum — EducationLevel
description: Níveis acadêmicos usados nas qualificações e avaliações de supervisor.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/supervisor, sge/formacao
related: enum-supervisorqualificationtype, migration-02-user-personal-data, migration-12a-supervisor-registration-requests, migration-18-supervisor-evaluations
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/EducationLevel.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorQualification.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorEvaluation.php
---
| Case | Valor persistido | Rótulo |
| --- | --- | --- |
| `SecondaryTechnical` | `secondary_technical` | Médio/Técnico |
| `Undergraduate` | `undergraduate` | Graduação |
| `Specialization` | `specialization` | Especialização |
| `Masters` | `masters` | Mestrado |
| `Doctorate` | `doctorate` | Doutorado |

O enum é string-backed e fornece `label()`, `options()` e `values()`. O nível é usado em uma qualificação acadêmica do perfil do supervisor, em proposta de cadastro e nas respostas da avaliação. “Graduação/Tecnólogo” deixou de ser uma opção combinada; o rótulo atual é “Graduação”.

## Navegação

- [Enum — SupervisorQualificationType](doc:enum-supervisorqualificationtype)
- [Migration 02 — user_personal_data e qualificações](doc:migration-02-user-personal-data)
- [Índice de enums](doc:enums)
