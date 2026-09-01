---
title: SGE — Model — User
description: Estado atual do Model de autenticação e seus casts, atributos e relações futuras.
type: technical-reference
status: in-progress
code_path: app/Models/User.php
tags:
  - sge/models
  - sge/autenticacao
  - sge/dados-pessoais
aliases:
  - Model de usuário do SGE
---
## Responsabilidade atual

Model autenticável do Laravel. Usa `HasFactory` e `Notifiable`, representa a conta de login e fornece as iniciais para a interface.

| Elemento           | Estado atual                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| atributos fillable | `name`, `cpf`, `email`, `password`, via `#[Fillable]`.                         |
| atributos ocultos  | `password`, `remember_token`, via `#[Hidden]`.                                 |
| casts              | `cpf` → [[SGE - Cast - CpfCast]] (`CpfCast`); `password` → `hashed`.           |
| `initials()`       | Usa `Str::initials()` e retorna primeira/última inicial quando há mais de uma. |
| relações           | Ainda não possui relações de domínio implementadas.                            |

## Divergência a resolver

O modelo de destino separa `users` (autenticação) de `user_personal_data` (CPF, RG, nascimento e endereço). Hoje CPF ainda está em `users`. Antes da implementação da [[SGE - Migration - 02 - User personal data|migration de dados pessoais]], decidir a migração dos valores, o preenchimento do novo Model e a retirada de `cpf` do login/cadastro da conta.

## Checklist

- [x] Configurar autenticação Eloquent para `User`.
- [x] Ocultar senha e remember token.
- [x] Aplicar cast de senha com hash automático.
- [x] Aplicar `CpfCast` no estado atual.
- [ ] Criar relação com `UserPersonalData`.
- [ ] Criar relações com `Affiliation`, `Notification` e `EmailMessage` quando as tabelas existirem.
- [ ] Remover CPF de `$fillable`/docblock/casts de `User` quando o domínio for migrado.
- [ ] Testar conta sem dados pessoais completos e conta com múltiplos vínculos.

## Relacionamentos

- [[SGE - Migration - 02 - User personal data|user_personal_data]]
- [[SGE - Cast - CpfCast|CpfCast]]
- [[SGE - Concern - ProfileValidationRules|ProfileValidationRules]]
- [[SGE - Guia de desenvolvimento]]
