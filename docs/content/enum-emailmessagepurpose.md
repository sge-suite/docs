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
> A classe, o cast em `EmailMessage`, a migration, os testes e o backend de envio em fila existem.

## Contrato implementado

Classifica a finalidade da mensagem de notificação ou da tentativa de envio. Não substitui `notifications.type`, que identifica o tipo específico do aviso operacional.

| Case                    | Valor persistido       | Rótulo                         |
| ----------------------- | ---------------------- | ------------------------------ |
| `Notification`          | `notification`         | Notificação operacional        |
| `AccountCreated`        | `account_created`      | Conta criada                   |
| `NewAffiliation`        | `new_affiliation`      | Novo vínculo                   |
| `AccountEmailChanged`   | `account_email_changed` | Alteração de e-mail da conta   |
| `AdministrativeChange`  | `administrative_change` | Alteração administrativa       |

As finalidades `AccountCreated`, `NewAffiliation`, `AccountEmailChanged` e `AdministrativeChange` representam mensagens administrativas com conteúdo renderizado persistido em `email_messages` e tentativas associadas. `AccountCreated` leva à solicitação de definição da senha sem guardar token ou URL assinada; `NewAffiliation` leva ao login. Registros antigos de conta criada ou novo vínculo podem não ter `email_message`. `AdministrativeChange` cobre avisos ligados a desativação/exclusão de vínculo ou exclusão de conta. `Notification` identifica conteúdo operacional associado a uma notificação interna. Recuperação de senha não usa esse enum porque não é registrada nessas tabelas.

## Decisões de segurança

- Recuperação de senha não pode persistir token, URL assinada ou corpo sensível.
- Mensagens operacionais guardam o conteúdo renderizado e imutável, sem cast criptografado.

O fluxo de recuperação de senha não inclui confirmação adicional de endereço de e-mail e não cria registros de mensagem ou tentativa.

## Checklist de implementação

- [x] Confirmar cases e nomes no enum atual.
- [x] Criar `App\Enums\EmailMessagePurpose` como enum string.
- [x] Implementar `label()`, `options()` e `values()`.
- [x] Adicionar cast em `EmailMessage`.
- [x] Persistir o conteúdo de novas mensagens das cinco finalidades em [email_messages](doc:migration-06-email-messages), exceto recuperação de senha, que fica fora dessas tabelas.
- [x] Criar testes para cases, conversão e opções.
- [x] Testar que senhas, tokens de recuperação, identificadores internos de entrega e exceções brutas não sejam persistidos ou exibidos no histórico administrativo.

## Relacionamentos

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [Migration de email_messages](doc:migration-06-email-messages)
- [EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
