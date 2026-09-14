---
id: concern-passwordvalidationrules
title: Concern — PasswordValidationRules
description: Regras compartilhadas para criação/alteração e confirmação de senha.
type: technical-reference
status: implemented
visibility: public
tags: sge/concerns, sge/autenticacao, sge/seguranca
related: fase-04-conta-e-contexto, actions, action-resetuserpassword
source_refs: ../../sge/app/Concerns/PasswordValidationRules.php
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
- [ ] Atualizar [fase de conta](doc:fase-04-conta-e-contexto) e [Actions](doc:actions) ao mudar o contrato.

## Relacionamentos

- [ResetUserPassword](doc:action-resetuserpassword)
- [Conta e contexto](doc:fase-04-conta-e-contexto)
