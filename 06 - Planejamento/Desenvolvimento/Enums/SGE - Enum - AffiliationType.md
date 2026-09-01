---
title: SGE — Enum — AffiliationType
description: Tipos funcionais permitidos para um vínculo institucional do SGE.
type: enum-reference
status: implemented
domain: access
code_path: app/Enums/AffiliationType.php
tags:
  - sge/enums
  - sge/autorizacao
aliases:
  - Enum de tipo de vínculo
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
- [ ] Usar os valores no contrato de `[[SGE - Migration - 04 - Affiliations|affiliations]]`.
- [ ] Cobrir todos os cases, rótulos e opções com testes.
- [ ] Validar as regras de escopo de cada tipo nas Policies.
- [x] Confirmar que este enum, vínculo ativo, escopo e estado são a única fonte de autorização; as tabelas de permissões foram removidas.

## Relacionamentos

- [[SGE - Migrations|Migrations]]
- [[SGE - Migration - 04 - Affiliations|Migration de affiliations]]
- [[SGE - Modelo de dados - Acesso|Modelo de acesso]]
- [[SGE - Perfis e responsabilidades por vínculo|Responsabilidades por vínculo]]
- [[SGE - Guia de desenvolvimento]]
