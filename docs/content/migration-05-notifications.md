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

Notificações de estágio, avaliação, documento e demais eventos operacionais têm `notifiable = Affiliation`. Recuperação de senha e o aviso inicial da conta têm `notifiable = User`. `AffiliationPolicy::viewNotifications` exige que o vínculo exista, esteja ativo e pertença à conta autenticada. A relação polimórfica limita cada consulta ao par `notifiable_type`/`notifiable_id`, inclusive quando a conta possui outros vínculos. As futuras Notifications usam `toDatabase()` e `databaseType()`; nenhuma classe de domínio foi criada nesta migration.

Deduplicação durável de eventos repetíveis não deve alterar a tabela nativa. A Action que gerar um evento precisa usar a fonte de idempotência do domínio; quando ela ainda não existir, o fluxo deve definir um registro operacional próprio antes de ser ativado.

## Checklist

- [x] Gerar a migration com `php artisan make:notifications-table --no-interaction` e adaptar `data` para `jsonb`.
- [x] Usar o canal `database`, `toDatabase()` e `databaseType()` nas Notifications futuras.
- [x] Adicionar `Notifiable` a `Affiliation` e consultar a caixa operacional pelo vínculo ativo.
- [ ] Garantir que `data` não contenha tokens, senhas, códigos ou URLs sensíveis.
- [x] Testar criação e leitura/não leitura pelo Model nativo para `Affiliation` e `User`.
- [x] Testar que uma notificação de vínculo não aparece em outro vínculo da mesma conta.
- [x] Testar migrate/rollback da migration isolada.

## Próxima etapa

[`email_messages`](doc:migration-06-email-messages) é uma etapa posterior e pode referenciar `notifications`; ela não é dependência desta migration. Veja também [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).
