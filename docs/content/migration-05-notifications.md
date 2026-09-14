---
id: migration-05-notifications
title: Migration 05 — notifications
description: Extensão das notificações nativas do Laravel com contexto de vínculo.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/notificacoes, sge/email
related: migration-04-affiliations, migration-06-email-messages, e-mails-notificacoes-e-entregas
source_refs:
---
> [!todo] Estado
> Planejada. Depende de `users` e [`affiliations`](doc:migration-04-affiliations). Deve preservar compatibilidade com Laravel Notifications.

## Contrato

| Campo                               | Regra                                                             |
| ----------------------------------- | ----------------------------------------------------------------- |
| `id`                                | UUID, compatível com a tabela nativa.                             |
| `type`                              | classe/tipo estável da notificação.                               |
| `notifiable_type` / `notifiable_id` | destinatário polimórfico; inicialmente `User`.                    |
| `affiliation_id`                    | nullable; vínculo que define contexto e destinatário operacional. |
| `data`                              | JSONB com título, texto, rota/entidade e metadados não sensíveis. |
| `deduplication_key`                 | nullable e única quando preenchida; evita avisos duplicados de evento idempotente. |
| `read_at`                           | nullable; leitura interna, nunca leitura do e-mail.               |
| timestamps                          | auditoria temporal.                                               |

## Checklist

- [ ] Criar extensão da migration nativa sem quebrar o Notification model do Laravel.
- [ ] Definir tipo do UUID e índices do morph/notifiable, `affiliation_id` e `read_at`.
- [ ] Criar índice único parcial para `deduplication_key` preenchida, sem impedir notificações manuais sem chave.
- [ ] Criar relação opcional com `Affiliation`.
- [ ] Garantir que `data` não contenha tokens, senhas, códigos ou URLs sensíveis.
- [ ] Criar factory/fake de notificação operacional.
- [ ] Testar leitura interna, vínculo desativado e destinatário sem e-mail.
- [ ] Validar criação sem mensagem de e-mail quando a regra não permitir envio.
- [ ] Testar reexecução de schedule sem duplicar a notificação por destinatário.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [email_messages](doc:migration-06-email-messages)
- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
