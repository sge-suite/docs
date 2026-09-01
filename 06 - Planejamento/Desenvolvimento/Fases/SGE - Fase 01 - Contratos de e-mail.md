---
title: SGE — Fase 01 — Contratos de e-mail
description: Checklist para fechar notificações, mensagens e tentativas de e-mail.
type: development-phase
status: planned
order: 1
tags:
  - sge/desenvolvimento
  - sge/email
  - sge/checklist
---
> [!important] Precedência
> Feche este contrato antes de implementar conta, notificações de domínio ou qualquer fluxo que envie e-mail. A implementação física aguarda `users` e `affiliations`.

## Checklist

- [ ] Aprovar a separação entre `notifications`, `email_messages` e `email_delivery_attempts`.
- [ ] Confirmar campos, índices, FKs, estados e [[SGE - Enums|enums]] correspondentes.
- [ ] Confirmar que recuperação de senha não registra token, URL assinada ou conteúdo sensível.
- [x] Não implementar verificação de e-mail, código de confirmação ou `email_verification_challenges`.
- [ ] Confirmar finalidades e destinatários das notificações operacionais.
- [ ] Definir perfis autorizados a consultar conteúdo e solicitar reenvio.
- [ ] Definir retenção e descarte conforme auditoria e LGPD.
- [ ] Registrar decisões em [[SGE - E-mails, notificações e entregas]].

## Referências executáveis

- [[SGE - Enum - EmailMessagePurpose|Enum de finalidade]].
- [[SGE - Enum - EmailDeliveryAttemptStatus|Enum de tentativa]].
- [[SGE - Migration - 05 - Notifications|Migration de notifications]].
- [[SGE - Migration - 06 - Email messages|Migration de email_messages]].
- [[SGE - Migration - 07 - Email delivery attempts|Migration de tentativas]].

## Próxima fase

[[SGE - Fase 03 - Fundação de dados|Fase 03 — Fundação de dados]]
