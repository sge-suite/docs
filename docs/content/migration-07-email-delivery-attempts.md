---
id: migration-07-email-delivery-attempts
title: Migration 07 — email_delivery_attempts
description: Histórico append-only das tentativas de transporte de e-mails.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/email, sge/auditoria
related: migration-06-email-messages, enum-emaildeliveryattemptstatus
source_refs:
---
> [!todo] Estado
> Planejada. Depende de [`email_messages`](doc:migration-06-email-messages) e [`EmailDeliveryAttemptStatus`](doc:enum-emaildeliveryattemptstatus).

## Contrato

| Campo                                 | Regra                                    |
| ------------------------------------- | ---------------------------------------- |
| `id`                                  | UUID, chave primária.                    |
| `email_message_id`                    | FK obrigatória para a mensagem.          |
| `attempt_number`                      | smallint, sequência por mensagem.        |
| `status`                              | `queued`, `sent` ou `failed`.            |
| `provider`                            | nullable; inicialmente SMTP configurado. |
| `provider_message_id`                 | nullable.                                |
| `queued_at` / `sent_at` / `failed_at` | marcos temporais nullable.               |
| `failure_reason`                      | nullable; erro técnico sanitizado.       |
| timestamps                            | auditoria temporal.                      |

Criar restrição única em (`email_message_id`, `attempt_number`). Reenvio cria nova linha; nunca sobrescrever a tentativa anterior.

## Checklist

- [ ] Criar migration e índice pela mensagem/status.
- [ ] Criar Model com cast de `EmailDeliveryAttemptStatus`.
- [ ] Implementar reserva da tentativa antes de chamar o transportador.
- [ ] Definir transições diretas `queued → sent` e `queued → failed`.
- [ ] Sanitizar `failure_reason`; nunca registrar credenciais ou tokens.
- [ ] Criar factory para fila, envio, sucesso e falha.
- [ ] Testar idempotência, sequência, reprocessamento e reenvio autorizado.
- [ ] Testar migrate/rollback na ordem completa.
