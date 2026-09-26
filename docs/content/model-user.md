---
id: model-user
title: Model — User
description: Conta autenticável, relações, notificações de senha e autoria no Activity Log.
type: technical-reference
status: in-progress
visibility: public
tags: sge/models, sge/autenticacao, sge/dados-pessoais
related: cast-cpfcast, migration-02-user-personal-data, migration-04-affiliations, concern-profilevalidationrules
source_refs: https://github.com/sge-suite/sge/blob/master/app/Models/User.php, https://github.com/sge-suite/sge/blob/master/app/Notifications/QueuedPasswordReset.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Auth/PasswordResetTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/DatabaseAuditTest.php
---
## Responsabilidade atual

Model autenticável do Laravel. Usa `HasFactory`, `LogsActivity` e `Notifiable`, representa a conta de login e fornece as iniciais para a interface.

| Elemento           | Estado atual                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| atributos fillable | `name`, `cpf`, `email`, `password`, via `#[Fillable]`.                         |
| atributos ocultos  | `password`, `remember_token`, via `#[Hidden]`.                                 |
| casts              | `cpf` → [Cast — CpfCast](doc:cast-cpfcast) (`CpfCast`); `password` → `hashed`.           |
| `initials()`       | Usa `Str::initials()` e retorna primeira/última inicial quando há mais de uma. |
| relações           | `personalData()` é um perfil opcional um-para-um; `affiliations()` retorna os vínculos institucionais; notificações nativas são fornecidas por `Notifiable`. |

## Auditoria e e-mail

`LogsActivity` registra alterações dos campos fillable, exceto `password`. A mudança de senha gera `password_changed` sem valor anterior, senha nova ou hash. `sendPasswordResetNotification()` usa `QueuedPasswordReset`, enfileirada após o commit e criptografada; recuperação não cria linhas em `email_messages` ou `email_delivery_attempts`.

Há uma lacuna em `UserPersonalData`: o Model relacionado registra somente `emancipation_verified_at`, e não os demais campos cadastrais, apesar da decisão do projeto de incluir campos de negócio na auditoria.

## Delimitação de responsabilidade

`users` mantém autenticação e CPF. [`user_personal_data`](doc:migration-02-user-personal-data) guarda dados pessoais atuais e campos profissionais opcionais do supervisor em um perfil compartilhado pela conta. Cadastro e login não exigem esse perfil; o supervisor preencherá ou confirmará seus dados profissionais no futuro formulário, com edição autorizada pelo tipo de vínculo.

## Checklist

- [x] Configurar autenticação Eloquent para `User`.
- [x] Ocultar senha e remember token.
- [x] Aplicar cast de senha com hash automático.
- [x] Aplicar `CpfCast` no estado atual.
- [x] Criar relações com `Affiliation` e `UserPersonalData` e habilitar notificações nativas do Laravel. A conta não possui relação direta com `EmailMessage`; seu histórico é separado.
- [x] Manter CPF em `$fillable`, docblock e casts de `User`.
- [x] Testar conta sem dados pessoais completos.
- [x] Testar conta com múltiplos vínculos em PostgreSQL.
- [x] Testar recuperação enfileirada sem persistir token ou corpo nas tabelas próprias de e-mail.
- [ ] Registrar no Activity Log os campos cadastrais alterados de `UserPersonalData`, conforme decisão do projeto.

## Relacionamentos

- [user_personal_data](doc:migration-02-user-personal-data)
- [CpfCast](doc:cast-cpfcast)
- [ProfileValidationRules](doc:concern-profilevalidationrules)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
