---
id: migration-06-email-messages
title: Migration 06 — email_messages
description: Snapshot imutável da mensagem de e-mail preparada para envio.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/email, sge/auditoria
related: migration-05-notifications, enum-emailmessagepurpose, e-mails-notificacoes-e-entregas, migration-07-email-delivery-attempts
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_160834_create_email_messages_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailMessage.php, https://github.com/sge-suite/sge/blob/master/database/factories/EmailMessageFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailMessageTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryFlowTest.php
---
> [!success] Estado
> Migration, Model, factory, testes e backend de envio em fila implementados.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | `bigint` autoincremental, chave primária. |
| `notification_id` | UUID nullable, FK para `notifications.id`. |
| `purpose` | Finalidade `Notification`, `AccountCreated`, `NewAffiliation`, `AccountEmailChanged` ou `AdministrativeChange`. Recuperação de senha não cria mensagem. |
| `subject` | Assunto da notificação ou do aviso. |
| `content_text` / `content_html` | Conteúdo renderizado, ao menos uma versão obrigatória. |
| `template_key` / `template_version` | Identificadores opcionais do template. |
| `idempotency_key` | UUID único para a mensagem. |
| timestamps | Criação e atualização. |

O Model permite as cinco finalidades. `Notification` pode estar vinculada a uma notificação interna existente; as quatro finalidades administrativas não usam `notification_id`. O Model oculta assunto e corpo na serialização e bloqueia atualização e exclusão via Eloquent. O conteúdo é armazenado sem cast criptografado. Destinatário, solicitante e contexto do registro afetado pertencem à tentativa de entrega, não à mensagem. Todas as finalidades administrativas guardam assunto, HTML e texto já renderizados, incluindo o nome/tipo do vínculo solicitante quando houver; o snapshot mantém o mesmo texto nas tentativas posteriores. A finalidade `AdministrativeChange` cobre os avisos de desativação/exclusão de vínculo e exclusão de conta. Recuperação de senha não cria mensagem.

O conteúdo é acessível ao Administrador do Sistema pela tela de e-mails somente quando a tentativa tem contexto administrativo verificável. A prévia é HTML sandboxed, com scripts e recursos externos bloqueados; o texto simples é escapado.

## Limites e testes

`EmailMessageTest` verifica o esquema, a finalidade, o conteúdo e a imutabilidade; `EmailDeliveryFlowTest` cobre a criação do aviso, idempotência e reenvio. SQL direto pode contornar as regras do Model; o acesso ao banco precisa ser restrito.

## Dependências

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [email_delivery_attempts](doc:migration-07-email-delivery-attempts)
