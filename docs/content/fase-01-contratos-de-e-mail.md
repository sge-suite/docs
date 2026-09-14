---
id: fase-01-contratos-de-e-mail
title: Fase 01 — Contratos de e-mail
description: Checklist para fechar notificações, mensagens e tentativas de e-mail.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/email, sge/checklist
related: enums, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose, enum-emaildeliveryattemptstatus, migration-05-notifications, migration-06-email-messages, migration-07-email-delivery-attempts, fase-03-fundacao-de-dados
source_refs:
---
> [!important] Precedência
> Feche este contrato antes de implementar conta, notificações de domínio ou qualquer fluxo que envie e-mail. A implementação física aguarda `users` e `affiliations`.

## Checklist

- [ ] Aprovar a separação entre `notifications`, `email_messages` e `email_delivery_attempts`.
- [ ] Confirmar campos, índices, FKs, estados e [enums](doc:enums) correspondentes.
- [ ] Confirmar que recuperação de senha não registra token, URL assinada ou conteúdo sensível.
- [x] Não implementar confirmação adicional de endereço de e-mail ou código de confirmação.
- [ ] Confirmar finalidades e destinatários das notificações operacionais.
- [ ] Definir perfis autorizados a consultar conteúdo e solicitar reenvio.
- [ ] Definir retenção e descarte conforme auditoria e LGPD.
- [ ] Registrar decisões em [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).

## Referências executáveis

- [Enum de finalidade](doc:enum-emailmessagepurpose).
- [Enum de tentativa](doc:enum-emaildeliveryattemptstatus).
- [Migration de notifications](doc:migration-05-notifications).
- [Migration de email_messages](doc:migration-06-email-messages).
- [Migration de tentativas](doc:migration-07-email-delivery-attempts).

## Próxima fase

[Fase 03 — Fundação de dados](doc:fase-03-fundacao-de-dados)
