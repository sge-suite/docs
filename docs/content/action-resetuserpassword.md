---
id: action-resetuserpassword
title: Action — ResetUserPassword
description: Implementação do contrato Fortify para validar e salvar a nova senha.
type: technical-reference
status: implemented
visibility: public
tags: sge/actions, sge/autenticacao, sge/seguranca
related: concern-passwordvalidationrules, e-mails-notificacoes-e-entregas, providers, model-user
source_refs: ../../sge/app/Actions/Fortify/ResetUserPassword.php
---
## Fluxo

Implementa `Laravel\Fortify\Contracts\ResetsUserPasswords`:

1. Recebe `User $user` e o array de entrada.
2. Valida `password` usando [`PasswordValidationRules`](doc:concern-passwordvalidationrules).
3. Usa `forceFill()` para atribuir a senha.
4. Usa `save()`; o cast `hashed` do Model transforma o valor antes da persistência.

Não cria token, não envia e-mail e não registra conteúdo sensível; o fluxo de solicitação do token fica no Fortify/broker.

## Checklist

- [x] Registrar Action no `FortifyServiceProvider`.
- [x] Reutilizar regras de senha.
- [x] Persistir senha via cast `hashed` do `User`.
- [ ] Testar senha fraca, confirmação divergente, senha comprometida e sucesso.
- [ ] Integrar o registro seguro de `email_messages` conforme [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).
- [ ] Confirmar que tokens/URLs nunca aparecem em logs ou mensagens persistidas.

## Relacionamentos

- [Providers](doc:providers)
- [Model User](doc:model-user)
- [PasswordValidationRules](doc:concern-passwordvalidationrules)
