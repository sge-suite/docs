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
> Migration, Model, factory e testes implementados. Reserva transacional, transporte e reenvio autorizado pertencem à futura integração de envio.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | `bigint` autoincremental, chave primária. |
| `email_message_id` | `bigint` nullable, FK para o conteúdo de uma notificação. Nulo para convite inicial. |
| `purpose` | `Notification` ou `NewAffiliation`. |
| `recipient_email` | Destinatário efetivo do envio. |
| `requested_by_affiliation_id` | FK nullable para o vínculo que solicitou o envio. A conta é `affiliations.user_id`; nulo identifica envio automático. |
| `attempt_number` | Sequência por mensagem; para convites, a estratégia de reenvio ainda será definida. |
| `status` | `queued`, `sent` ou `failed`. |
| `provider` / `provider_message_id` | Provedor e identificador devolvido pelo transporte, opcionais. |
| `queued_at` / `sent_at` / `failed_at` | Marcos temporais opcionais. |
| `failure_reason` | Código técnico sanitizado, sem exceção bruta. |
| timestamps | Criação e atualização. |

O Model captura o vínculo ativo do `CauserResolver` no momento da criação; solicitações humanas sem vínculo válido são rejeitadas. A tentativa de convite exige mensagem nula, e a tentativa de notificação exige mensagem existente e destinatário correspondente. As transições permitidas são `queued → sent` e `queued → failed`. Identidade e tentativa finalizada são imutáveis; exclusão via Model é bloqueada. Não há `LogsActivity` nessas tabelas, pois elas são o próprio histórico técnico do envio.

A restrição única (`email_message_id`, `attempt_number`) evita repetição de número para a mesma mensagem. Como `email_message_id` é nulo nos convites, a reserva concorrente e idempotência desses envios ainda precisam ser implementadas na Fase 04. O Job deve receber ou usar a tentativa já criada para preservar a autoria do solicitante; um Job sem contexto humano registra envio do sistema.

## Limites e testes

`EmailDeliveryAttemptTest` verifica esquema, destinatário, autoria, transições e imutabilidade. SQL direto pode contornar as regras do Model; o acesso ao banco precisa ser restrito.
