---
title: SGE — Provider — FortifyServiceProvider
description: Configuração atual de Actions, telas e rate limiting de autenticação do Fortify.
type: technical-reference
status: implemented
code_path: app/Providers/FortifyServiceProvider.php
tags:
  - sge/providers
  - sge/autenticacao
  - sge/seguranca
aliases:
  - Provider do Fortify
---
## Boot atual

| Configuração | Contrato                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------ |
| Action       | `ResetUserPassword` é usada para redefinição.                                                    |
| Views        | login, confirmação de senha, redefinição e solicitação de link usam views `pages::auth.*`.       |
| Rate limit   | `login` permite 5 tentativas por minuto por combinação de e-mail transliterado/normalizado e IP. |
| Fortify      | username/e-mail são configurados em `config/fortify.php`; reset usa broker `users`.              |

## Checklist

- [x] Registrar `ResetUserPassword`.
- [x] Registrar views do fluxo de autenticação.
- [x] Configurar limiter de login por e-mail e IP.
- [ ] Testar limite, janela de tempo e diferença entre e-mails/IPs.
- [ ] Integrar log seguro de mensagens de recuperação.
- [ ] Definir o primeiro acesso sem verificação de e-mail conforme [[SGE - Fase 04 - Conta e contexto|fase de conta]].
- [ ] Revisar se o rate limit atende criação de conta e reenvio.

## Relacionamentos

- [[SGE - Action - ResetUserPassword|ResetUserPassword]]
- [[SGE - E-mails, notificações e entregas]]
- [[SGE - Concern - PasswordValidationRules|PasswordValidationRules]]
