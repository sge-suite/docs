---
title: SGE — Enum — EmailMessagePurpose
description: Finalidades estáveis para mensagens de e-mail do SGE.
type: enum-reference
status: planned
domain: email
tags:
  - sge/enums
  - sge/email
aliases:
  - Enum de finalidade de e-mail
---
> [!todo] Estado
> Planejado. A criação depende da aprovação do contrato de [[SGE - E-mails, notificações e entregas]].

## Contrato proposto

Classifica por que uma `email_message` foi criada. Não substitui `notifications.type`, que identifica o tipo específico do aviso operacional.

| Case                | Valor persistido     | Rótulo                  |
| ------------------- | -------------------- | ----------------------- |
| `PasswordReset`     | `password_reset`     | Recuperação de senha    |
| `Notification`      | `notification`       | Notificação operacional |
| `NewAffiliation`    | `new_affiliation`    | Novo vínculo            |

## Decisões de segurança

- Recuperação de senha não pode persistir token, URL assinada ou corpo sensível.
- Mensagens operacionais podem guardar o conteúdo renderizado, protegido e imutável.

O SGE não terá verificação de e-mail nem o case `EmailVerification`.

## Checklist de implementação

- [ ] Confirmar cases e nomes com o fluxo de e-mails.
- [ ] Criar `App\Enums\EmailMessagePurpose` como enum string.
- [ ] Implementar `label()`, `options()` e `values()` se o padrão do projeto permanecer.
- [ ] Adicionar cast em `EmailMessage`.
- [ ] Usar o enum na [[SGE - Migration - 06 - Email messages|migration de email_messages]].
- [ ] Criar testes para cases, conversão e rejeição de valor inválido.
- [ ] Verificar que nenhum segredo aparece no conteúdo, logs ou Activity Log.

## Relacionamentos

- [[SGE - E-mails, notificações e entregas]]
- [[SGE - Migration - 06 - Email messages|Migration de email_messages]]
- [[SGE - Enum - EmailDeliveryAttemptStatus|EmailDeliveryAttemptStatus]]
- [[SGE - Guia de desenvolvimento]]
