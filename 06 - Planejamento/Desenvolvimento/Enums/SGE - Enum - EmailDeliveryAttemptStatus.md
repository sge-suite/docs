---
title: SGE — Enum — EmailDeliveryAttemptStatus
description: Estados da tentativa de transporte de uma mensagem de e-mail.
type: enum-reference
status: planned
domain: email
tags:
  - sge/enums
  - sge/email
aliases:
  - Enum de status de entrega de e-mail
---
> [!todo] Estado
> Planejado para `email_delivery_attempts.status`. O estado de uma tentativa não é o estado de leitura da notificação.

## Contrato proposto

| Case      | Valor persistido | Significado                                        |
| --------- | ---------------- | -------------------------------------------------- |
| `Queued`  | `queued`         | Tentativa criada e aguardando Job.                 |
| `Sent`    | `sent`           | SMTP/provedor aceitou a mensagem.                  |
| `Failed`  | `failed`         | Transporte recusou ou o Job esgotou as tentativas. |

O fluxo é direto: `queued` passa para `sent` quando o SMTP/provedor aceita a mensagem, ou para `failed` quando ela falha. `notifications.read_at` continua sendo a fonte da leitura interna. Não usar `sending`, `read` ou `delivered` sem decisão explícita.

## Checklist de implementação

- [ ] Criar `App\Enums\EmailDeliveryAttemptStatus` como enum string.
- [ ] Implementar rótulos e opções da interface, se houver select administrativo.
- [ ] Adicionar cast em `EmailDeliveryAttempt`.
- [ ] Usar o enum na [[SGE - Migration - 07 - Email delivery attempts|migration de email_delivery_attempts]].
- [ ] Testar transições `queued → sent` e `queued → failed`, reprocessamento e criação de nova linha no reenvio.
- [ ] Garantir que `sent` só seja salvo após aceitação do SMTP.

## Relacionamentos

- [[SGE - E-mails, notificações e entregas]]
- [[SGE - Enum - EmailMessagePurpose|EmailMessagePurpose]]
- [[SGE - Migration - 07 - Email delivery attempts|Migration de email_delivery_attempts]]
