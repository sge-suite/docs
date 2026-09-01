---
title: SGE — Action — ResetUserPassword
description: Implementação do contrato Fortify para validar e salvar a nova senha.
type: technical-reference
status: implemented
code_path: app/Actions/Fortify/ResetUserPassword.php
tags:
  - sge/actions
  - sge/autenticacao
  - sge/seguranca
aliases:
  - Action de redefinição de senha
---
## Fluxo

Implementa `Laravel\Fortify\Contracts\ResetsUserPasswords`:

1. Recebe `User $user` e o array de entrada.
2. Valida `password` usando [[SGE - Concern - PasswordValidationRules|`PasswordValidationRules`]].
3. Usa `forceFill()` para atribuir a senha.
4. Usa `save()`; o cast `hashed` do Model transforma o valor antes da persistência.

Não cria token, não envia e-mail e não registra conteúdo sensível; o fluxo de solicitação do token fica no Fortify/broker.

## Checklist

- [x] Registrar Action no `FortifyServiceProvider`.
- [x] Reutilizar regras de senha.
- [x] Persistir senha via cast `hashed` do `User`.
- [ ] Testar senha fraca, confirmação divergente, senha comprometida e sucesso.
- [ ] Integrar o registro seguro de `email_messages` conforme [[SGE - E-mails, notificações e entregas]].
- [ ] Confirmar que tokens/URLs nunca aparecem em logs ou mensagens persistidas.

## Relacionamentos

- [[SGE - Providers|Providers]]
- [[SGE - Model - User|Model User]]
- [[SGE - Concern - PasswordValidationRules|PasswordValidationRules]]
