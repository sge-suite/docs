---
title: SGE — Concern — PasswordValidationRules
description: Regras compartilhadas para criação/alteração e confirmação de senha.
type: technical-reference
status: implemented
code_path: app/Concerns/PasswordValidationRules.php
tags:
  - sge/concerns
  - sge/autenticacao
  - sge/seguranca
aliases:
  - Regras de senha do SGE
---
## Contrato

Trait usado por Actions/fluxos que precisam validar senha. Não salva senha e não implementa recuperação; apenas retorna regras do Validator.

| Método                   | Regras                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `passwordRules()`        | `required`, `string`, `confirmed`, `Password::min(8)->max(64)->numbers()->letters()->mixedCase()->symbols()->uncompromised()`. |
| `currentPasswordRules()` | `required`, `string`, `current_password`.                                                                                      |

## Checklist

- [x] Centralizar os requisitos de senha.
- [x] Exigir confirmação e senha não comprometida.
- [x] Usar `current_password` para senha atual.
- [ ] Cobrir diretamente todos os requisitos em testes de autenticação.
- [ ] Confirmar política institucional antes de alterar tamanho/requisitos.
- [ ] Atualizar [[SGE - Fase 04 - Conta e contexto|fase de conta]] e [[SGE - Actions|Actions]] ao mudar o contrato.

## Relacionamentos

- [[SGE - Action - ResetUserPassword|ResetUserPassword]]
- [[SGE - Fase 04 - Conta e contexto|Conta e contexto]]
