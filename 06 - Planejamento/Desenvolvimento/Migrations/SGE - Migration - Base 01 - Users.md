---
title: SGE — Migration base 01 — users
description: Estado atual das tabelas de autenticação, reset de senha e sessões.
type: migration-reference
status: implemented
order: 0.1
code_path: database/migrations/0001_01_01_000000_create_users_table.php
table: users, password_reset_tokens, sessions
tags:
  - sge/migrations
  - sge/autenticacao
  - sge/banco-de-dados
aliases:
  - Migration atual de usuários
---
> [!success] Estado
> Implementada no arquivo `0001_01_01_000000_create_users_table.php`. É a base das contas atuais; o modelo de destino ainda exige a separação de dados pessoais.

## Tabelas criadas

### `users`

| Campo            | Contrato atual                         |
| ---------------- | -------------------------------------- |
| `id`             | bigint, chave primária.                |
| `name`           | string, obrigatório.                   |
| `email`          | string, único.                         |
| `cpf`            | string(11), único; hoje está na conta. |
| `password`       | string.                                |
| `remember_token` | token padrão de sessão.                |
| timestamps       | `created_at`/`updated_at`.             |

### `password_reset_tokens`

`email` é a chave primária; `token` guarda o token do broker; `created_at` é nullable. A política do projeto deve evitar copiar token para logs ou `email_messages`.

### `sessions`

`id` é a chave primária; `user_id` é nullable e indexado; há `ip_address`, `user_agent`, `payload` e `last_activity` indexado. O arquivo atual não cria FK para `users`.

## Rollback atual

`down()` usa `dropIfExists()` para `users`, `password_reset_tokens` e `sessions`. Como não há FK explícita em `sessions`, a ordem atual executa.

## Checklist

- [x] Criar as três tabelas base.
- [x] Tornar e-mail e CPF únicos no estado atual.
- [x] Configurar broker de reset para `password_reset_tokens`.
- [ ] Definir a transferência de `users.cpf` para `user_personal_data.cpf`.
- [ ] Atualizar [[SGE - Cast - CpfCast|CpfCast]] e `User` após a separação.
- [ ] Confirmar se `sessions.user_id` deve receber FK no futuro.
- [ ] Adicionar teste de schema/rollback se essa migration for alterada.

## Próximas referências

- [[SGE - Migration - 02 - User personal data|user_personal_data]]
- [[SGE - Model - User|Model User]]
- [[SGE - Provider - FortifyServiceProvider|FortifyServiceProvider]]
