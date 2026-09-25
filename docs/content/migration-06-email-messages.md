---
id: migration-06-email-messages
title: Migration 06 — email_messages
description: Snapshot imutável da mensagem de e-mail preparada para envio.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/email, sge/auditoria
related: migration-05-notifications, enum-emailmessagepurpose, e-mails-notificacoes-e-entregas, migration-07-email-delivery-attempts
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_160834_create_email_messages_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailMessage.php, https://github.com/sge-suite/sge/blob/master/database/factories/EmailMessageFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailMessageTest.php
---
> [!success] Estado
> Migration, Model, factory e testes implementados. A geração e o envio de e-mails permanecem para a integração funcional.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | `bigint` autoincremental, chave primária. |
| `notification_id` | UUID nullable, FK para `notifications.id`. |
| `purpose` | `Notification`; mensagens de convite e recuperação não são armazenadas. |
| `subject` | Assunto renderizado da notificação. |
| `content_text` / `content_html` | Conteúdo renderizado, ao menos uma versão obrigatória. |
| `template_key` / `template_version` | Identificadores opcionais do template. |
| `idempotency_key` | UUID único para a mensagem. |
| timestamps | Criação e atualização. |

O Model permite somente conteúdo de notificação, exige notificação interna existente, oculta assunto e corpo na serialização e bloqueia atualização e exclusão via Eloquent. O conteúdo é armazenado sem cast criptografado. Destinatário e solicitante pertencem à tentativa de entrega, não à mensagem. A recuperação de senha não cria linha nesta tabela; o convite inicial também não cria mensagem e usa `email_message_id` nulo na tentativa. Não existe migration de conversão: as migrations originais foram ajustadas antes de haver dados de produção.

## Limites e testes

`EmailMessageTest` verifica o esquema, a finalidade, o conteúdo e a imutabilidade. A criação automática e a reserva idempotente do envio pertencem à Fase 04. SQL direto pode contornar as regras do Model; o acesso ao banco precisa ser restrito.

## Dependências

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [email_delivery_attempts](doc:migration-07-email-delivery-attempts)
