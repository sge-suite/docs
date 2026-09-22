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
> Migration, Model, factory e testes PostgreSQL implementados. A geração e o envio de e-mails permanecem para a integração funcional.

## Contrato

| Campo                               | Regra                                                             |
| ----------------------------------- | ----------------------------------------------------------------- |
| `id`                                | `bigint` autoincremental (`$table->id()`), chave primária.         |
| `notification_id`                   | UUID nullable, FK para `notifications.id` quando a mensagem deriva de notificação interna; nulo para aviso externo selecionado. |
| `user_id`                           | nullable; obrigatório para recuperação de senha e aviso de novo vínculo à conta. |
| `affiliation_id`                    | nullable; obrigatório para e-mail operacional do vínculo.         |
| `purpose`                           | enum/string de [Enum — EmailMessagePurpose](doc:enum-emailmessagepurpose) (finalidade). |
| `recipient_email`                   | snapshot do endereço efetivamente escolhido.                      |
| `subject`                           | nullable; assunto final seguro.                                   |
| `content_text` / `content_html`     | nullable; conteúdo renderizado permitido.                         |
| `template_key` / `template_version` | nullable; identificação do template.                              |
| `idempotency_key`                   | UUID único para evitar duplicidade.                               |
| timestamps                          | auditoria temporal.                                               |

O Model criptografa `recipient_email`, `subject`, `content_text` e `content_html`; por isso essas colunas são `text`. O snapshot é imutável após a criação. `notification_id`, `user_id` e `affiliation_id` são FKs opcionais com exclusão restrita, validadas por finalidade no Model. Mensagens `Notification` exigem notificação interna do mesmo vínculo e snapshot do `affiliations.email`. `PasswordReset` e `NewAffiliation` exigem `user_id`, snapshot do `users.email` e conteúdo persistido nulo. A chave UUID única impede duplicação da mesma solicitação no banco.

O ID autoincremental da mensagem é independente de `idempotency_key`: a primeira identifica a linha, enquanto a segunda identifica de forma única a solicitação de envio. A FK `notification_id` segue o tipo UUID da tabela nativa do Laravel.

O fluxo futuro de novo vínculo enviará `NewAffiliation` a `users.email` e, quando diferente, `Notification` a `affiliations.email`. Endereços iguais produzirão uma única mensagem. Dados ou links de acesso inicial serão destinados somente à conta e não poderão ser persistidos no snapshot. O envio externo ao contato da concedente ainda exige entidade/motivo rastreável e autorização do Setor; o Model atual rejeita mensagem sem vínculo ou conta até essa integração existir.

## Checklist

- [x] Criar migration com FKs opcionais e índices de consulta/autorização.
- [x] Definir criptografia/proteção de conteúdo e destinatário no Model.
- [x] Criar Model com cast de `EmailMessagePurpose`.
- [x] Validar no Model o destinatário exigido para cada finalidade, sem `CHECK` de domínio.
- [ ] Implementar idempotência por solicitação de envio.
- [x] Criar factory com mensagem operacional e mensagem de autenticação segura.
- [ ] Testar aviso de novo vínculo para dois endereços distintos e um único envio quando coincidirem, sem expor dados de acesso no e-mail operacional.
- [x] Testar snapshot após alteração de usuário.
- [ ] Testar rejeição de segredo em `content`, `data`, exceções e Activity Log.
- [x] Testar migrate/rollback na ordem completa.

## Dependências

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [email_delivery_attempts](doc:migration-07-email-delivery-attempts)
