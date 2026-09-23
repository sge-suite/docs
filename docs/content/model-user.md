---
id: model-user
title: Model — User
description: Estado atual do Model de autenticação e seus casts, atributos e relações futuras.
type: technical-reference
status: in-progress
visibility: public
tags: sge/models, sge/autenticacao, sge/dados-pessoais
related: cast-cpfcast, migration-02-user-personal-data, migration-04-affiliations, concern-profilevalidationrules
source_refs: https://github.com/sge-suite/sge/blob/master/app/Models/User.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AffiliationTest.php
---
## Responsabilidade atual

Model autenticável do Laravel. Usa `HasFactory` e `Notifiable`, representa a conta de login e fornece as iniciais para a interface.

| Elemento           | Estado atual                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| atributos fillable | `name`, `cpf`, `email`, `password`, via `#[Fillable]`.                         |
| atributos ocultos  | `password`, `remember_token`, via `#[Hidden]`.                                 |
| casts              | `cpf` → [Cast — CpfCast](doc:cast-cpfcast) (`CpfCast`); `password` → `hashed`.           |
| `initials()`       | Usa `Str::initials()` e retorna primeira/última inicial quando há mais de uma. |
| relações           | `personalData()` é um perfil opcional um-para-um; `affiliations()` retorna os vários vínculos institucionais da conta. |

## Delimitação de responsabilidade

`users` mantém autenticação e CPF. [`user_personal_data`](doc:migration-02-user-personal-data) guarda dados pessoais atuais e campos profissionais opcionais do supervisor em um perfil compartilhado pela conta. Cadastro e login não exigem esse perfil; o supervisor preencherá ou confirmará seus dados profissionais no futuro formulário, com edição autorizada pelo tipo de vínculo.

## Checklist

- [x] Configurar autenticação Eloquent para `User`.
- [x] Ocultar senha e remember token.
- [x] Aplicar cast de senha com hash automático.
- [x] Aplicar `CpfCast` no estado atual.
- [x] Criar relação com `UserPersonalData`.
- [x] Criar a relação `Affiliation`; `Notification` e `EmailMessage` permanecem futuras.
- [x] Manter CPF em `$fillable`, docblock e casts de `User`.
- [x] Testar conta sem dados pessoais completos.
- [x] Testar conta com múltiplos vínculos em PostgreSQL.

## Relacionamentos

- [user_personal_data](doc:migration-02-user-personal-data)
- [CpfCast](doc:cast-cpfcast)
- [ProfileValidationRules](doc:concern-profilevalidationrules)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
