---
id: fase-04-integracao-de-email
title: Fase 04 — Integração de e-mail
description: Simplificação e fechamento do backend de preparação, envio e reprocessamento de e-mails.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/email, sge/checklist
related: enums, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose, enum-emaildeliveryattemptstatus, migration-05-notifications, migration-06-email-messages, migration-07-email-delivery-attempts, fase-03-activity-log
source_refs:
---
As tabelas `notifications`, `email_messages` e `email_delivery_attempts`, seus enums, Models e validações já existem. Esta fase implementa uma API de backend fácil de usar nos fluxos e concentra nela persistência, segurança, idempotência e transporte.

## Backend de envio

- [ ] Rever o contrato final de finalidades, destinatários, conteúdo persistido e retenção.
- [ ] Criar um ponto de entrada único para preparar e solicitar o envio de uma mensagem, sem repetir detalhes de persistência nos fluxos.
- [ ] Reservar tentativas com sequência segura e concorrência controlada.
- [ ] Despachar envio somente depois do commit da transação de domínio.
- [ ] Registrar `queued`, `sent` e `failed` com provedor e motivo sanitizado.
- [ ] Configurar timeout, retry, backoff e limite de tentativas por finalidade.
- [ ] Permitir reprocessamento autorizado sem alterar a mensagem original nem duplicar efeitos.
- [ ] Manter a recuperação de senha fora de `email_messages` e `email_delivery_attempts`; não persistir token, URL, destinatário ou corpo desse envio.
- [ ] Fazer o link do convite inicial abrir a tela de recuperação com o e-mail preenchido; a pessoa solicita o link de redefinição com um clique. O envio inicial registra somente `email_delivery_attempts` e nenhuma mensagem com conteúdo.
- [ ] Reservar a tentativa de convite no momento da solicitação, com `requested_by_affiliation_id` quando houver vínculo ativo; o Job posterior preserva essa autoria. Para envio automático, o campo é nulo.
- [ ] Validar modelos de e-mail reais pelo Mailpit para cada finalidade e destinatário.
- [ ] Testar idempotência, concorrência, falha do transporte, reprocessamento e proteção contra vazamento em logs.

## Notificações

- [ ] Criar notificações operacionais somente na conta ou vínculo destinatário adequado.
- [ ] Manter leitura interna independente da entrega de e-mail.
- [ ] Definir destinatários e canais para novo vínculo, documento disponível, correções, avaliações e eventos do estágio.
- [ ] Manter o resumo do Setor de Estágio como notificação agrupada interna quando o contrato assim determinar.

## Interface administrativa futura

- [ ] Definir autorização de consulta de tentativas e solicitação de reenvio por vínculo.
- [ ] Exibir histórico sem revelar tokens, credenciais, conteúdo protegido ou dados de outro escopo.

## Critério de saída

- [ ] Fluxos chamam uma interface de backend comum e idempotente.
- [ ] Falhas são observáveis, tentativas anteriores permanecem intactas e reprocessar não duplica mensagens.
- [ ] Segredos não aparecem em Activity Log, exceções, propriedades ou telas sem autorização.

## Próxima fase

[Fase 05 — Administração hierárquica](doc:fase-05-administracao)
