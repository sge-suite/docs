---
id: enum-affiliationtype
title: Enum — AffiliationType
description: Tipos funcionais permitidos para um vínculo institucional do SGE.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/autorizacao
related: migration-04-affiliations, migrations, modelo-de-dados-acesso, perfis-e-responsabilidades-por-vinculo
source_refs: ../../sge/app/Enums/AffiliationType.php, ../../sge/tests/Unit/Enums/AffiliationTypeTest.php
---
> [!success] Estado
> Implementado em `app/Enums/AffiliationType.php`. Ainda precisa ser usado de forma consistente nas Policies e na migration de `affiliations`.

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

Representante legal é uma atribuição de um vínculo no cadastro de campus; não criar `LegalRepresentative` como case.

## Checklist de implementação

- [x] Criar enum string em `App\Enums\AffiliationType`.
- [x] Implementar `label()`, `options()` e `values()`.
- [ ] Adicionar cast do enum no Model `Affiliation`.
- [ ] Usar os valores no contrato de `[affiliations](doc:migration-04-affiliations)`.
- [x] Cobrir todos os cases, rótulos e opções com testes unitários.
- [ ] Validar as regras de escopo de cada tipo nas Policies.
- [x] Confirmar que este enum, vínculo ativo, escopo e estado são a única fonte de autorização; as tabelas de permissões foram removidas.

## Relacionamentos

- [Migrations](doc:migrations)
- [Migration de affiliations](doc:migration-04-affiliations)
- [Modelo de acesso](doc:modelo-de-dados-acesso)
- [Responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
