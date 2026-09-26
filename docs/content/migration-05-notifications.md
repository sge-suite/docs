---
id: migration-05-notifications
title: Migration 05 — notifications
description: Tabela nativa do Laravel para notificações internas por vínculo ou conta.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/notificacoes, sge/email
related: migration-04-affiliations, migration-06-email-messages, e-mails-notificacoes-e-entregas
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_124656_create_notifications_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Affiliation.php, https://github.com/sge-suite/sge/blob/master/app/Policies/AffiliationPolicy.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/NotificationsTest.php
---
> [!success] Estado
> Implementada e verificada no PostgreSQL via Sail. A migration foi gerada pelo Laravel 13 e altera somente `data` para `jsonb`. Os destinatários polimórficos não criam FKs para `users` ou `affiliations`; a migration é executada depois da Migration 04 para que os dois tipos de destinatário estejam disponíveis no sistema.

## Contrato

| Campo                               | Regra                                                             |
| ----------------------------------- | ----------------------------------------------------------------- |
| `id`                                | UUID, chave primária da tabela nativa.                            |
| `type`                              | classe ou tipo estável da notificação.                            |
| `notifiable_type` / `notifiable_id` | destinatário polimórfico: `Affiliation` para operação e `User` para comunicação de conta. |
| `data`                              | `jsonb` convertido pelo cast `array` de `DatabaseNotification`. |
| `read_at`                           | nullable; leitura interna, nunca leitura do e-mail.               |
| timestamps                          | auditoria temporal.                                               |

O comando `php artisan make:notifications-table --no-interaction` produz a base desse schema. A migration troca apenas `data` para `jsonb`, compatível com o cast `array` de `DatabaseNotification` no PostgreSQL. `User` reutiliza `Notifiable`, `notifications()`, `readNotifications()` e `unreadNotifications()` do framework. `Affiliation` também usa `Notifiable`; a caixa operacional consulta a relação do vínculo ativo e nunca a relação geral de `User`. Não há Model customizado nem tabela paralela do SGE.

O UUID de `notifications.id` é intencional: preserva o schema e a geração de identificadores nativos de Laravel Notifications. As tabelas próprias de e-mail usam IDs `bigint` autoincrementais; somente `email_messages.notification_id` permanece UUID para referenciar esta tabela.

Notificações operacionais de estágio, avaliação e documento usarão `notifiable = Affiliation`. `AffiliationPolicy::viewNotifications` exige que o vínculo exista, esteja ativo e pertença à conta autenticada. A relação polimórfica limita cada consulta ao par `notifiable_type`/`notifiable_id`, inclusive quando a conta possui outros vínculos. `User` também aceita notificações pelo Laravel, mas recuperação de senha, convite inicial e novo vínculo são enviados pelo canal de e-mail e não criam linhas em `notifications`. As classes de domínio e a integração aos seus fluxos ainda não foram criadas.

Deduplicação durável de eventos repetíveis não deve alterar a tabela nativa. A Action que gerar um evento precisa usar a fonte de idempotência do domínio; quando ela ainda não existir, o fluxo deve definir um registro operacional próprio antes de ser ativado.

## Checklist

- [x] Gerar a migration com `php artisan make:notifications-table --no-interaction` e adaptar `data` para `jsonb`.
- [ ] Criar Notifications de domínio com canal `database`, `toDatabase()` e `databaseType()` quando os respectivos fluxos forem implementados.
- [x] Adicionar `Notifiable` a `Affiliation` e consultar a caixa operacional pelo vínculo ativo.
- [ ] Garantir que `data` não contenha tokens, senhas, códigos ou URLs sensíveis.
- [x] Testar criação e leitura/não leitura pelo Model nativo para `Affiliation` e `User`.
- [x] Testar que uma notificação de vínculo não aparece em outro vínculo da mesma conta.
- [x] Testar migrate/rollback da migration isolada.

## Próxima etapa

[`email_messages`](doc:migration-06-email-messages) e [`email_delivery_attempts`](doc:migration-07-email-delivery-attempts) implementam a persistência relacionada; `RequestEmailDelivery` e `SendEmailDelivery` implementam reserva e transporte em fila. A recuperação de senha do Fortify também usa fila, sem criar registros nessas tabelas. A ligação aos eventos de domínio ainda será feita conforme [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).
