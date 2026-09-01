---
title: SGE — Migration 06 — email_messages
description: Snapshot imutável da mensagem de e-mail preparada para envio.
type: migration-reference
status: planned
order: 6
table: email_messages
tags:
  - sge/migrations
  - sge/email
  - sge/auditoria
---
> [!todo] Estado
> Planejada. Depende de [[SGE - Migration - 05 - Notifications|`notifications`]], `users`, `affiliations` e [[SGE - Enum - EmailMessagePurpose|`EmailMessagePurpose`]].

## Contrato

| Campo                               | Regra                                                             |
| ----------------------------------- | ----------------------------------------------------------------- |
| `id`                                | UUID, chave primária.                                             |
| `notification_id`                   | nullable, FK quando a mensagem deriva de notificação interna; nulo para aviso externo selecionado. |
| `user_id`                           | nullable; obrigatório para autenticação.                          |
| `affiliation_id`                    | nullable; vínculo usado para resolver o destinatário.             |
| `purpose`                           | enum/string de [[SGE - Enum - EmailMessagePurpose]] (finalidade). |
| `recipient_email`                   | snapshot do endereço efetivamente escolhido.                      |
| `subject`                           | nullable; assunto final seguro.                                   |
| `content_text` / `content_html`     | nullable; conteúdo renderizado permitido.                         |
| `template_key` / `template_version` | nullable; identificação do template.                              |
| `idempotency_key`                   | UUID único para evitar duplicidade.                               |
| timestamps                          | auditoria temporal.                                               |

Conteúdo operacional deve ser protegido e imutável. Mensagens de autenticação não podem persistir token, URL assinada, código ou qualquer segredo. Um aviso de assinatura destinado ao contato externo cadastrado da concedente pode ter `notification_id`, `user_id` e `affiliation_id` nulos, mas sempre exige `recipient_email`, motivo/entidade rastreável e autorização da seleção feita pelo Setor; não há destinatário arbitrário digitado na tela.

## Checklist

- [ ] Criar migration com FKs opcionais e índices de consulta/autorização.
- [ ] Definir criptografia/proteção de conteúdo e destinatário no Model.
- [ ] Criar Model com cast de `EmailMessagePurpose`.
- [ ] Implementar idempotência por solicitação de envio.
- [ ] Criar factory com mensagem operacional e mensagem de autenticação segura.
- [ ] Testar snapshot após alteração de usuário, vínculo ou template.
- [ ] Testar rejeição de segredo em `content`, `data`, exceções e Activity Log.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [[SGE - E-mails, notificações e entregas]]
- [[SGE - Migration - 07 - Email delivery attempts|email_delivery_attempts]]
