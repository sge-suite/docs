---
id: model-user
title: Model — User
description: Estado atual do Model de autenticação e seus casts, atributos e relações futuras.
type: technical-reference
status: in-progress
visibility: public
tags: sge/models, sge/autenticacao, sge/dados-pessoais
related: cast-cpfcast, migration-02-user-personal-data, concern-profilevalidationrules
source_refs: https://github.com/sge-suite/sge/blob/master/app/Models/User.php
---
## Responsabilidade atual

Model autenticável do Laravel. Usa `HasFactory` e `Notifiable`, representa a conta de login e fornece as iniciais para a interface.

| Elemento           | Estado atual                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| atributos fillable | `name`, `cpf`, `email`, `password`, via `#[Fillable]`.                         |
| atributos ocultos  | `password`, `remember_token`, via `#[Hidden]`.                                 |
| casts              | `cpf` → [Cast — CpfCast](doc:cast-cpfcast) (`CpfCast`); `password` → `hashed`.           |
| `initials()`       | Usa `Str::initials()` e retorna primeira/última inicial quando há mais de uma. |
| relações           | `personalData()` é um perfil opcional um-para-um para dados complementares do discente. |

## Delimitação de responsabilidade

`users` mantém autenticação e CPF. [`user_personal_data`](doc:migration-02-user-personal-data) armazena somente RG, nascimento, telefone e endereço atuais quando o futuro fluxo de vínculo discente precisar deles. Cadastro, login e a configuração atual da conta não criam esse perfil.

## Checklist

- [x] Configurar autenticação Eloquent para `User`.
- [x] Ocultar senha e remember token.
- [x] Aplicar cast de senha com hash automático.
- [x] Aplicar `CpfCast` no estado atual.
- [x] Criar relação com `UserPersonalData`.
- [ ] Criar relações com `Affiliation`, `Notification` e `EmailMessage` quando as tabelas existirem.
- [x] Manter CPF em `$fillable`, docblock e casts de `User`.
- [x] Testar conta sem dados pessoais completos.
- [ ] Testar conta com múltiplos vínculos quando `affiliations` existir.

## Relacionamentos

- [user_personal_data](doc:migration-02-user-personal-data)
- [CpfCast](doc:cast-cpfcast)
- [ProfileValidationRules](doc:concern-profilevalidationrules)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
