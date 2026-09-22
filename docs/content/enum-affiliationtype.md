---
id: enum-affiliationtype
title: Enum — AffiliationType
description: Tipos funcionais permitidos para um vínculo institucional do SGE.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/autorizacao
related: migration-04-affiliations, migrations, modelo-de-dados-acesso, perfis-e-responsabilidades-por-vinculo
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/AffiliationType.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/AffiliationTypeTest.php
---
> [!success] Estado
> Implementado em `app/Enums/AffiliationType.php` e usado como cast e validação PHP de `Affiliation`. A integração com Policies permanece futura.

## Contrato

Classifica o papel funcional de uma pessoa dentro de um vínculo. Não representa e-mail, campus, permissão isolada ou representante legal.

| Case                  | Valor persistido       | Rótulo                   |
| --------------------- | ---------------------- | ------------------------ |
| `SystemAdministrator` | `system_administrator` | Administrador do Sistema |
| `CampusAdministrator` | `campus_administrator` | Administrador do Campus  |
| `InternshipOffice`    | `internship_office`    | Setor de Estágios        |
| `Coordinator`         | `coordinator`          | Coordenador de Curso     |
| `Advisor`             | `advisor`              | Orientador               |
| `Student`             | `student`              | Estudante                |
| `Supervisor`          | `supervisor`           | Supervisor               |
| `TeachingDirection`   | `teaching_direction`   | Direção de Ensino        |

O representante legal e seu cargo são campos textuais de `Campus`, não são um vínculo nem um case de `AffiliationType`. Não criar `LegalRepresentative`.

## Checklist de implementação

- [x] Criar enum string em `App\Enums\AffiliationType`.
- [x] Implementar `label()`, `options()` e `values()`.
- [x] Adicionar cast do enum no Model `Affiliation`.
- [x] Usar o enum no cast e na validação de [`affiliations`](doc:migration-04-affiliations).
- [x] Cobrir todos os cases, rótulos e opções com testes unitários.
- [ ] Validar as regras de escopo de cada tipo nas Policies.
- [x] Confirmar que este enum, vínculo ativo, escopo e estado são a única fonte de autorização; as tabelas de permissões foram removidas.

## Relacionamentos

- [Migrations](doc:migrations)
- [Migration de affiliations](doc:migration-04-affiliations)
- [Modelo de acesso](doc:modelo-de-dados-acesso)
- [Responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
