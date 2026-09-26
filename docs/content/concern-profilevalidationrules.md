---
id: concern-profilevalidationrules
title: Concern — ProfileValidationRules
description: Trait disponível para validar nome e e-mail de perfil; não usada pela tela de Segurança atual.
type: technical-reference
status: in-progress
visibility: public
tags: sge/concerns, sge/validacao, sge/autorizacao
related: model-user, fase-02-conta-e-contexto
source_refs: https://github.com/sge-suite/sge/blob/master/app/Concerns/ProfileValidationRules.php
---
## Contrato

Trait que compõe regras para nome e e-mail do `User`. A tela de Perfil atual somente exibe o e-mail; a troca é implementada na página Livewire de Segurança, com confirmação do endereço, senha atual, vínculo ativo e avisos para os dois endereços. Este trait ainda não é reutilizado por esse formulário.

| Método                       | Regras                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `profileRules(?int $userId)` | Combina `nameRules()` e `emailRules($userId)`.                                             |
| `nameRules()`                | obrigatório, string, máximo 255.                                                           |
| `emailRules($userId)`        | obrigatório, string, e-mail, máximo 255 e único em `users`; ignora o próprio ID na edição. |

## Checklist

- [x] Centralizar regras de nome e e-mail.
- [ ] Integrar o trait aos formulários que realmente editarem nome/e-mail; a troca atual em Segurança mantém regras próprias.
- [ ] Criar testes diretos do trait para formato, duplicidade e normalização.
- [ ] Separar regras de dados pessoais quando `user_personal_data` for editado pela aplicação.

## Relacionamentos

- [Model User](doc:model-user)
- [Conta e contexto](doc:fase-02-conta-e-contexto)
