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
> A classe e os testes unitários já existem em `app/Enums/EmailMessagePurpose.php`. A integração com `EmailMessage`, migration e fluxo de envio ainda está planejada.

## Contrato implementado

Classifica por que uma `email_message` foi criada. Não substitui `notifications.type`, que identifica o tipo específico do aviso operacional.

| Case                | Valor persistido     | Rótulo                  |
| ------------------- | -------------------- | ----------------------- |
| `PasswordReset`     | `password_reset`     | Recuperação de senha    |
| `Notification`      | `notification`       | Notificação operacional |
| `NewAffiliation`    | `new_affiliation`    | Novo vínculo            |

## Decisões de segurança

- Recuperação de senha não pode persistir token, URL assinada ou corpo sensível.
- Mensagens operacionais podem guardar o conteúdo renderizado, protegido e imutável.

O fluxo de recuperação de senha não inclui confirmação adicional de endereço de e-mail nem um case específico para isso.

## Checklist de implementação

- [x] Confirmar cases e nomes no enum atual.
- [x] Criar `App\Enums\EmailMessagePurpose` como enum string.
- [x] Implementar `label()`, `options()` e `values()`.
- [ ] Adicionar cast em `EmailMessage`.
- [ ] Usar o enum na [migration de email_messages](doc:migration-06-email-messages).
- [x] Criar testes para cases, conversão e opções.
- [ ] Verificar que nenhum segredo aparece no conteúdo, logs ou Activity Log.

## Relacionamentos

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [Migration de email_messages](doc:migration-06-email-messages)
- [EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
