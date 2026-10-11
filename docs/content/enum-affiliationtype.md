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
> Implementado em `app/Enums/AffiliationType.php` e usado na validação PHP e pelo `AffiliationTypeCast` de `Affiliation`. Policies já cobrem campi e administração de contas/vínculos administrativos; as regras dos demais perfis e jornadas continuam sendo implementadas por fase.

## Contrato

Classifica o papel funcional de uma pessoa dentro de um vínculo. Não representa e-mail, campus, permissão isolada ou representante legal.

| Case                  | Valor persistido       | Rótulo                   |
| --------------------- | ---------------------- | ------------------------ |
| `SystemAdministrator` | `system_administrator` | Administrador do Sistema |
| `InternshipOffice`    | `internship_office`    | Setor de Estágios        |
| `Coordinator`         | `coordinator`          | Coordenador de Curso     |
| `Advisor`             | `advisor`              | Orientador               |
| `Student`             | `student`              | Discente                  |
| `Supervisor`          | `supervisor`           | Supervisor               |
| `TeachingDirection`   | `teaching_direction`   | Direção de Ensino        |

O representante legal e seu cargo são campos textuais de `Campus`, não são um vínculo nem um case de `AffiliationType`. Não criar `LegalRepresentative`.

O Setor de Estágio pode cadastrar e editar vínculos de todos os cases exceto `SystemAdministrator`, sempre no campus ativo selecionado. Só `Student` recebe curso no vínculo; `Supervisor` não solicita nem persiste matrícula e aceita dados profissionais opcionais no perfil compartilhado da conta. A edição preserva tipo, campus e curso; o escopo completo está na [Fase 05](doc:fase-05-administracao).

## Compatibilidade sem alteração de migrations

Conforme a [D-024](doc:backlog-e-decisoes#d-024-administracao-local-concentrada-no-setor-de-estagio), o perfil Administrador do Campus foi removido do enum e dos formulários. Novos vínculos locais administrativos usam `InternshipOffice`. O cast lê o valor legado `campus_administrator` como Setor de Estágio, preservando IDs, referências, estado e valor persistido. A seleção de contexto não converte dados nem gera atividade. Consultas administrativas e proteção contra vínculos ativos duplicados reconhecem ambos os valores; snapshots históricos de auditoria e e-mails são preservados.

## Checklist de implementação

- [x] Criar enum string em `App\Enums\AffiliationType`.
- [x] Implementar `label()`, `options()` e `values()`.
- [x] Adicionar cast do enum no Model `Affiliation`.
- [x] Usar o enum no cast e na validação de [`affiliations`](doc:migration-04-affiliations).
- [x] Cobrir todos os cases, rótulos e opções com testes unitários.
- [x] Aplicar as Policies ao Administrador do Sistema para gestão global e gestão de contas/vínculos administrativos.
- [ ] Completar e testar as regras de escopo dos demais tipos nas Policies.
- [x] Confirmar que este enum, vínculo ativo, escopo e estado são a única fonte de autorização; as tabelas de permissões foram removidas.

## Relacionamentos

- [Migrations](doc:migrations)
- [Migration de affiliations](doc:migration-04-affiliations)
- [Modelo de acesso](doc:modelo-de-dados-acesso)
- [Responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
