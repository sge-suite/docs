---
id: migration-07-email-delivery-attempts
title: Migration 07 — email_delivery_attempts
description: Histórico append-only das tentativas de transporte de e-mails.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/email, sge/auditoria
related: migration-06-email-messages, enum-emaildeliveryattemptstatus
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_160858_create_email_delivery_attempts_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailDeliveryAttempt.php, https://github.com/sge-suite/sge/blob/master/database/factories/EmailDeliveryAttemptFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryAttemptTest.php
---
> [!success] Estado
> Migration, Model, factory e testes PostgreSQL implementados. Reserva transacional, transporte e reenvio autorizado pertencem à futura integração de envio.

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
| `failure_reason`                      | nullable; código técnico sanitizado (`[a-z0-9_.-]`, até 120 caracteres). |
| timestamps                            | auditoria temporal.                      |

Criar restrição única em (`email_message_id`, `attempt_number`). Reenvio cria nova linha; nunca sobrescrever a tentativa anterior.

O Model aceita `queued → sent` e `queued → failed`, exige os marcos e o motivo correspondentes, protege `provider_message_id` com cast criptografado e impede alterar uma tentativa finalizada. A coluna de mensagem tem FK com exclusão restrita. A lógica que reserva o próximo número sob concorrência e chama o SMTP ainda não existe.

## Checklist

- [x] Criar migration e índice pela mensagem/status.
- [x] Criar Model com cast de `EmailDeliveryAttemptStatus`.
- [ ] Implementar reserva da tentativa antes de chamar o transportador.
- [x] Definir transições diretas `queued → sent` e `queued → failed` no Model.
- [x] Restringir `failure_reason` a código técnico; o transporte ainda deverá mapear falhas sem registrar credenciais ou tokens.
- [x] Criar factory para fila, sucesso e falha.
- [ ] Testar idempotência, sequência, reprocessamento e reenvio autorizado.
- [x] Testar migrate/rollback na ordem completa.
