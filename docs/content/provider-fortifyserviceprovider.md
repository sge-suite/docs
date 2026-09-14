---
id: provider-fortifyserviceprovider
title: Provider — FortifyServiceProvider
description: Configuração atual de Actions, telas e rate limiting de autenticação do Fortify.
type: technical-reference
status: implemented
visibility: public
tags: sge/providers, sge/autenticacao, sge/seguranca
related: fase-04-conta-e-contexto, action-resetuserpassword, e-mails-notificacoes-e-entregas, concern-passwordvalidationrules
source_refs: https://github.com/sge-suite/sge/blob/master/app/Providers/FortifyServiceProvider.php
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
- [ ] Definir o fluxo seguro de primeiro acesso conforme [fase de conta](doc:fase-04-conta-e-contexto).
- [ ] Revisar se o rate limit atende criação de conta e reenvio.

## Relacionamentos

- [ResetUserPassword](doc:action-resetuserpassword)
- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [PasswordValidationRules](doc:concern-passwordvalidationrules)
