---
id: enum-emaildeliveryattemptstatus
title: Enum — EmailDeliveryAttemptStatus
description: Estados da tentativa de transporte de uma mensagem de e-mail.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/email
related: migration-07-email-delivery-attempts, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose
source_refs: ../../sge/app/Enums/EmailDeliveryAttemptStatus.php, ../../sge/tests/Unit/Enums/EmailDeliveryAttemptStatusTest.php
---
> [!success] Estado
> A classe e os testes unitários já existem em `app/Enums/EmailDeliveryAttemptStatus.php`. A integração com `email_delivery_attempts` e os Jobs de envio ainda está planejada. O estado de uma tentativa não é o estado de leitura da notificação.

## Contrato proposto

| Case      | Valor persistido | Significado                                        |
| --------- | ---------------- | -------------------------------------------------- |
| `Queued`  | `queued`         | Tentativa criada e aguardando Job.                 |
| `Sent`    | `sent`           | SMTP/provedor aceitou a mensagem.                  |
| `Failed`  | `failed`         | Transporte recusou ou o Job esgotou as tentativas. |

O fluxo é direto: `queued` passa para `sent` quando o SMTP/provedor aceita a mensagem, ou para `failed` quando ela falha. `notifications.read_at` continua sendo a fonte da leitura interna. Não usar `sending`, `read` ou `delivered` sem decisão explícita.

## Checklist de implementação

- [x] Criar `App\Enums\EmailDeliveryAttemptStatus` como enum string.
- [x] Implementar rótulos e opções da interface.
- [ ] Adicionar cast em `EmailDeliveryAttempt`.
- [ ] Usar o enum na [migration de email_delivery_attempts](doc:migration-07-email-delivery-attempts).
- [x] Testar cases, valores, rótulos e opções.
- [ ] Testar as transições `queued → sent` e `queued → failed`, reprocessamento e criação de nova linha no reenvio.
- [ ] Garantir que `sent` só seja salvo após aceitação do SMTP.

## Relacionamentos

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [EmailMessagePurpose](doc:enum-emailmessagepurpose)
- [Migration de email_delivery_attempts](doc:migration-07-email-delivery-attempts)
