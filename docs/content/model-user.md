---
id: model-user
title: Model — User
description: Conta autenticável, relações, notificações de senha, autoria no Activity Log e identificação administrável.
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

`UserPersonalData` registra seus atributos fillable (`user_id`, dados pessoais/profissionais e `address_id`) e também `emancipation_verified_at`, que não é fillable porque representa estado controlado pela aplicação. Esse campo é incluído explicitamente no Activity Log com valores anteriores e novos. `id`, `created_at` e `updated_at` ficam fora do registro. A cobertura é verificada por `DatabaseAuditTest`.

## Delimitação de responsabilidade

`users` mantém autenticação, CPF e e-mail de login. O Administrador do Sistema pode editar nome, CPF e e-mail pela interface administrativa; a alteração do endereço de login envia avisos ao endereço anterior e ao novo. [`user_personal_data`](doc:migration-02-user-personal-data) guarda dados pessoais atuais e campos profissionais opcionais do supervisor em um perfil compartilhado pela conta. Cadastro e login não exigem esse perfil; o supervisor preencherá ou confirmará seus dados profissionais no futuro formulário, com edição autorizada pelo tipo de vínculo.

## Checklist

- [x] Configurar autenticação Eloquent para `User`.
- [x] Ocultar senha e remember token.
- [x] Aplicar cast de senha com hash automático.
- [x] Aplicar `CpfCast` no estado atual.
- [x] Criar relações com `Affiliation` e `UserPersonalData` e habilitar notificações nativas do Laravel. A conta não possui relação direta com `EmailMessage`; seu histórico é separado.
- [x] Manter CPF em `$fillable`, docblock e casts de `User`.
- [x] Testar conta sem dados pessoais completos.
- [x] Testar conta com múltiplos vínculos em PostgreSQL.
- [x] Permitir a administração de nome, CPF e e-mail de login por `UserController`, preservando as notificações de troca de e-mail e a auditoria sem senha.
- [x] Testar recuperação enfileirada sem persistir token ou corpo nas tabelas próprias de e-mail.
- [x] Registrar no Activity Log os campos pessoais e profissionais alterados de `UserPersonalData`, com valores anteriores/novos e autoria do vínculo ativo.

## Relacionamentos

- [user_personal_data](doc:migration-02-user-personal-data)
- [CpfCast](doc:cast-cpfcast)
- [ProfileValidationRules](doc:concern-profilevalidationrules)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
