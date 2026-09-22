---
id: enum-emailmessagepurpose
title: Enum — EmailMessagePurpose
description: Finalidades estáveis para mensagens de e-mail do SGE.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/email
related: e-mails-notificacoes-e-entregas, migration-06-email-messages, enum-emaildeliveryattemptstatus
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/EmailMessagePurpose.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/EmailMessagePurposeTest.php
---
> [!success] Estado
> A classe, o cast em `EmailMessage`, a migration e os testes existem. O fluxo de geração e envio ainda está planejado.

## Contrato implementado

Classifica por que uma `email_message` foi criada. Não substitui `notifications.type`, que identifica o tipo específico do aviso operacional.

| Case                | Valor persistido     | Rótulo                  |
| ------------------- | -------------------- | ----------------------- |
| `PasswordReset`     | `password_reset`     | Recuperação de senha    |
| `Notification`      | `notification`       | Notificação operacional |
| `NewAffiliation`    | `new_affiliation`    | Novo vínculo            |

No aviso de novo vínculo, `NewAffiliation` identifica a mensagem destinada a `users.email`. Se o e-mail do vínculo for diferente, o aviso para `affiliations.email` usa `Notification`; endereços iguais geram uma única mensagem `NewAffiliation`.

## Decisões de segurança

- Recuperação de senha não pode persistir token, URL assinada ou corpo sensível.
- Mensagens operacionais podem guardar o conteúdo renderizado, protegido e imutável.

O fluxo de recuperação de senha não inclui confirmação adicional de endereço de e-mail nem um case específico para isso.

## Checklist de implementação

- [x] Confirmar cases e nomes no enum atual.
- [x] Criar `App\Enums\EmailMessagePurpose` como enum string.
- [x] Implementar `label()`, `options()` e `values()`.
- [x] Adicionar cast em `EmailMessage`.
- [x] Persistir os valores do enum em [email_messages](doc:migration-06-email-messages).
- [x] Criar testes para cases, conversão e opções.
- [ ] Verificar que nenhum segredo aparece no conteúdo, logs ou Activity Log.

## Relacionamentos

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [Migration de email_messages](doc:migration-06-email-messages)
- [EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
