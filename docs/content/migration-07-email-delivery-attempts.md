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
> Migration, Model, factory, testes e backend de envio em fila implementados. A interface de reenvio autorizado ainda será definida.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | `bigint` autoincremental, chave primária. |
| `email_message_id` | `bigint` nullable, FK para o conteúdo de uma notificação. Nulo para convite inicial. |
| `delivery_key` | UUID estável do envio, com sequência única por chave. |
| `purpose` | `Notification`, `NewAffiliation` ou `AccountEmailChanged`. |
| `recipient_email` | Destinatário efetivo do envio. |
| `requested_by_affiliation_id` | FK nullable para o vínculo que solicitou o envio. A conta é `affiliations.user_id`; nulo identifica envio automático. |
| `attempt_number` | Sequência de 1 a 3 por `delivery_key`. |
| `status` | `queued`, `sent` ou `failed`. |
| `provider` / `provider_message_id` | Provedor e identificador devolvido pelo transporte, opcionais. |
| `queued_at` / `sent_at` / `failed_at` | Marcos temporais opcionais. |
| `failure_reason` | Código técnico sanitizado, sem exceção bruta. |
| timestamps | Criação e atualização. |

O Model captura o vínculo ativo do `CauserResolver` no momento da criação; solicitações humanas sem vínculo válido são rejeitadas. A tentativa de convite exige mensagem nula, e a tentativa de notificação exige mensagem existente e destinatário correspondente. As transições permitidas são `queued → sent` e `queued → failed`. Identidade e tentativa finalizada são imutáveis; exclusão via Model é bloqueada. Não há `LogsActivity` nessas tabelas, pois elas são o próprio histórico técnico do envio.

A restrição única (`delivery_key`, `attempt_number`) cobre também convites e avisos de alteração de e-mail, que não têm `email_message_id`. A restrição por mensagem também permanece. `RequestEmailDelivery` reutiliza tentativas com a mesma chave e rejeita dados incompatíveis. `SendEmailDelivery` recebe o ID da tentativa, preservando a autoria registrada na reserva; envio automático tem solicitante nulo. A tentativa é bloqueada durante o envio para impedir que dois workers enviem simultaneamente a mesma linha.

`delivery_key` pertence à migration de criação da tabela. Como o projeto ainda não tem dados de produção, a alteração é aplicada com `migrate:fresh` durante o desenvolvimento.

## Limites e testes

`EmailDeliveryAttemptTest` verifica esquema, destinatário, autoria, transições e imutabilidade. SQL direto pode contornar as regras do Model; o acesso ao banco precisa ser restrito.
