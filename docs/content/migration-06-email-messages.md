---
id: migration-06-email-messages
title: Migration 06 — email_messages
description: Snapshot imutável da mensagem de e-mail preparada para envio.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/email, sge/auditoria
related: migration-05-notifications, enum-emailmessagepurpose, e-mails-notificacoes-e-entregas, migration-07-email-delivery-attempts
source_refs:
---
> [!todo] Estado
> Planejada. Depende de [`notifications`](doc:migration-05-notifications), `users`, `affiliations` e [`EmailMessagePurpose`](doc:enum-emailmessagepurpose).

## Contrato

| Campo                               | Regra                                                             |
| ----------------------------------- | ----------------------------------------------------------------- |
| `id`                                | UUID, chave primária.                                             |
| `notification_id`                   | nullable, FK quando a mensagem deriva de notificação interna; nulo para aviso externo selecionado. |
| `user_id`                           | nullable; obrigatório para recuperação de senha e e-mail inicial. |
| `affiliation_id`                    | nullable; obrigatório para e-mail operacional do vínculo.         |
| `purpose`                           | enum/string de [Enum — EmailMessagePurpose](doc:enum-emailmessagepurpose) (finalidade). |
| `recipient_email`                   | snapshot do endereço efetivamente escolhido.                      |
| `subject`                           | nullable; assunto final seguro.                                   |
| `content_text` / `content_html`     | nullable; conteúdo renderizado permitido.                         |
| `template_key` / `template_version` | nullable; identificação do template.                              |
| `idempotency_key`                   | UUID único para evitar duplicidade.                               |
| timestamps                          | auditoria temporal.                                               |

Conteúdo operacional deve ser protegido e imutável. Para `Notification`, `affiliation_id` identifica o vínculo destinatário e `user_id` permanece nulo. Para `PasswordReset` e `NewAffiliation`, `user_id` identifica a conta destinatária e `affiliation_id` permanece nulo. Mensagens de autenticação não podem persistir token, URL assinada, código ou qualquer segredo. Um aviso de assinatura destinado ao contato externo cadastrado da concedente pode ter `notification_id`, `user_id` e `affiliation_id` nulos, mas sempre exige `recipient_email`, motivo/entidade rastreável e autorização da seleção feita pelo Setor; não há destinatário arbitrário digitado na tela.

## Checklist

- [ ] Criar migration com FKs opcionais e índices de consulta/autorização.
- [ ] Definir criptografia/proteção de conteúdo e destinatário no Model.
- [ ] Criar Model com cast de `EmailMessagePurpose`.
- [ ] Validar no Model o destinatário exigido para cada finalidade, sem `CHECK` de domínio.
- [ ] Implementar idempotência por solicitação de envio.
- [ ] Criar factory com mensagem operacional e mensagem de autenticação segura.
- [ ] Testar snapshot após alteração de usuário, vínculo ou template.
- [ ] Testar rejeição de segredo em `content`, `data`, exceções e Activity Log.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [email_delivery_attempts](doc:migration-07-email-delivery-attempts)
