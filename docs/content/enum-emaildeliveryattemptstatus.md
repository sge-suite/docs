---
id: enum-emaildeliveryattemptstatus
title: Enum — EmailDeliveryAttemptStatus
description: Estados da tentativa de transporte de uma mensagem de e-mail.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/email
related: migration-07-email-delivery-attempts, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/EmailDeliveryAttemptStatus.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/EmailDeliveryAttemptStatusTest.php
---
> [!success] Estado
> A classe, o cast em `EmailDeliveryAttempt`, a migration e os testes existem. Jobs de envio continuam planejados. O estado da tentativa não é o estado de leitura da notificação.

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
- [x] Adicionar cast em `EmailDeliveryAttempt`.
- [x] Persistir os valores do enum em [email_delivery_attempts](doc:migration-07-email-delivery-attempts).
- [x] Testar cases, valores, rótulos e opções.
- [ ] Testar as transições `queued → sent` e `queued → failed`, reprocessamento e criação de nova linha no reenvio.
- [ ] Garantir que `sent` só seja salvo após aceitação do SMTP.

## Relacionamentos

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [EmailMessagePurpose](doc:enum-emailmessagepurpose)
- [Migration de email_delivery_attempts](doc:migration-07-email-delivery-attempts)
