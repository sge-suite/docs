---
title: SGE — Concern — ProfileValidationRules
description: Regras compartilhadas para nome e e-mail de perfil.
type: technical-reference
status: implemented
code_path: app/Concerns/ProfileValidationRules.php
tags:
  - sge/concerns
  - sge/validacao
  - sge/autorizacao
aliases:
  - Regras de perfil do SGE
---
## Contrato

Trait que compõe regras para perfil do `User`.

| Método                       | Regras                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `profileRules(?int $userId)` | Combina `nameRules()` e `emailRules($userId)`.                                             |
| `nameRules()`                | obrigatório, string, máximo 255.                                                           |
| `emailRules($userId)`        | obrigatório, string, e-mail, máximo 255 e único em `users`; ignora o próprio ID na edição. |

## Checklist

- [x] Centralizar regras de nome e e-mail.
- [x] Permitir edição do próprio e-mail sem conflito consigo mesmo.
- [ ] Testar criação, edição, e-mail duplicado e e-mail inválido.
- [ ] Confirmar normalização/lowercase no Fortify e na tela de perfil.
- [ ] Separar regras de dados pessoais quando `user_personal_data` for implementado.

## Relacionamentos

- [[SGE - Model - User|Model User]]
- [[SGE - Fase 04 - Conta e contexto|Conta e contexto]]
