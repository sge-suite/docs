---
id: fase-04-integracao-de-email
title: Fase 04 — Integração de e-mail
description: Simplificação e fechamento do backend de preparação, envio e reprocessamento de e-mails.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/email, sge/checklist
related: enums, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose, enum-emaildeliveryattemptstatus, migration-05-notifications, migration-06-email-messages, migration-07-email-delivery-attempts, fase-03-activity-log
source_refs:
---
As tabelas `notifications`, `email_messages` e `email_delivery_attempts`, seus enums, Models e validações já existem. `RequestEmailDelivery` é o ponto de entrada para notificações operacionais, convites e avisos de alteração do e-mail da conta. Ele reserva a tentativa e despacha `SendEmailDelivery` para a fila após o commit. `DeliveryMail` usa o transporte nativo configurado em `config/mail.php`.

## Backend de envio

- [x] Definir finalidades: notificação operacional, novo vínculo e alteração do e-mail da conta. A retenção institucional continua pendente.
- [x] Criar um ponto de entrada único para solicitar o envio sem repetir persistência nos fluxos.
- [x] Reservar tentativas com `delivery_key` UUID e sequência única, até três tentativas por envio.
- [x] Despachar envio somente depois do commit da transação de domínio.
- [x] Registrar `queued`, `sent` e `failed` com provedor e motivo sanitizado.
- [x] Configurar timeout SMTP de 10 segundos, Job de 60 segundos e limite de três tentativas. A nova tentativa é explícita; o Job não repete automaticamente um SMTP de resultado incerto.
- [x] Reprocessar falhas pela Action, preservando tentativas anteriores e o conteúdo imutável.
- [x] Manter a recuperação de senha fora de `email_messages` e `email_delivery_attempts`; a Notification do Fortify é enfileirada após o commit.
- [x] Fazer o link do convite abrir a tela de recuperação com o e-mail preenchido. A pessoa solicita o link de redefinição com um clique; o convite registra somente a tentativa.
- [x] Reservar a tentativa de convite com `requested_by_affiliation_id` quando houver vínculo ativo; o Job preserva essa autoria.
- [x] Validar o convite inicial por SMTP no Mailpit em teste opt-in.
- [ ] Validar também as demais finalidades e destinatários no Mailpit quando os fluxos de domínio forem ligados.
- [x] Testar idempotência, falha do transporte, reprocessamento e motivo de falha sanitizado.
- [ ] Validar o comportamento sob concorrência real de workers.

A API exige uma chave UUID estável por envio. Chamadas repetidas com a mesma chave e os mesmos dados devolvem a tentativa existente. Reutilizar uma chave com destinatário ou conteúdo diferente falha. O envio operacional recebe uma `DatabaseNotification` já criada e guarda um snapshot imutável de assunto e corpo; convites e avisos de troca de e-mail guardam apenas a tentativa. Na futura alteração do e-mail da conta, o fluxo deve solicitar dois avisos com chaves distintas, um para o endereço anterior e outro para o novo.

O Job usa bloqueio transacional da tentativa. Se o worker morrer depois de o SMTP aceitar a mensagem e antes de gravar `sent`, o resultado é incerto; um reenvio manual pode gerar uma segunda entrega. Esse limite do SMTP precisa ser considerado na futura interface de reprocessamento. Não há endpoint administrativo de reenvio nesta fase.

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
