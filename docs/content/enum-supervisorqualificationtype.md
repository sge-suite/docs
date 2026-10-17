---
id: enum-supervisorqualificationtype
title: Enum — SupervisorQualificationType
description: Tipo da qualificação profissional mantida pelo perfil do supervisor.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/supervisor, sge/formacao
related: enum-educationlevel, migration-02-user-personal-data, migration-12a-supervisor-registration-requests, migration-19-internship-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/SupervisorQualificationType.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorQualification.php
---
| Case | Valor persistido | Rótulo |
| --- | --- | --- |
| `Academic` | `academic` | Formação acadêmica |
| `Professional` | `professional` | Experiência profissional |

O enum discrimina o formato dos dados de cada registro em `supervisor_qualifications`. Cada supervisor pode manter várias qualificações dos dois tipos. A validação exige curso e nível no ramo acadêmico, ou área e tempo no ramo profissional, e limpa os campos do ramo oposto. A proposta de supervisor ainda não cadastrado é única por solicitação; para vínculo já existente, o Setor escolhe a qualificação que será congelada no estágio.

## Navegação

- [Enum — EducationLevel](doc:enum-educationlevel)
- [Migration 02 — user_personal_data e qualificações](doc:migration-02-user-personal-data)
- [Solicitação de estágio](doc:migration-19-internship-requests)
- [Índice de enums](doc:enums)
