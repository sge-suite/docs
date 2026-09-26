---
id: fase-04-integracao-de-email
title: Fase 04 — Integração de e-mail
description: Backend de e-mail em fila, templates renderizados e integração parcial com conta e vínculo.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/email, sge/checklist
related: enums, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose, enum-emaildeliveryattemptstatus, migration-05-notifications, migration-06-email-messages, migration-07-email-delivery-attempts, fase-03-activity-log
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/RequestEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Jobs/SendEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Mail/DeliveryMail.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryFlowTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Settings/SecurityTest.php
---
As tabelas `notifications`, `email_messages` e `email_delivery_attempts`, seus enums, Models e validações existem. `RequestEmailDelivery` reserva envios e despacha `SendEmailDelivery` para a fila após o commit. Já é usado por `admin:create` para conta criada/novo vínculo e pela troca de e-mail em Segurança. Os templates usam os componentes Markdown nativos do Laravel para gerar HTML e texto simples; os avisos de alteração persistem essas versões já renderizadas em `email_messages`. A recuperação de senha usa a Notification enfileirada do Fortify e não cria linhas nas tabelas próprias de entrega. O transporte vem de `config/mail.php`.

## Backend de envio

- [x] Definir finalidades: notificação operacional, conta criada, novo vínculo e alteração do e-mail da conta. A retenção institucional continua pendente.
- [x] Criar um ponto de entrada único para solicitar o envio sem repetir persistência nos fluxos.
- [x] Reservar tentativas com `delivery_key` UUID e sequência única, até três tentativas por envio.
- [x] Despachar envio somente depois do commit da transação de domínio.
- [x] Registrar `queued`, `sent` e `failed` com provedor e motivo sanitizado.
- [x] Configurar timeout SMTP de 10 segundos, Job de 60 segundos e limite de três tentativas. A nova tentativa é explícita; o Job não repete automaticamente um SMTP de resultado incerto.
- [x] Reprocessar falhas pela Action, preservando tentativas anteriores e o conteúdo imutável.
- [x] Manter a recuperação de senha fora de `email_messages` e `email_delivery_attempts`; a Notification do Fortify é enfileirada após o commit.
- [x] Enviar e-mail de conta criada informando o primeiro vínculo e levando à recuperação com o e-mail preenchido para solicitar a definição da senha; armazenar somente a tentativa.
- [x] Ao criar vínculo em conta existente, avisar `users.email` e `affiliations.email` com link de login; deduplicar quando forem iguais e armazenar somente as tentativas.
- [x] Reservar a tentativa de convite com `requested_by_affiliation_id` quando houver vínculo ativo; o Job preserva essa autoria.
- [x] Cobrir por renderização os templates de conta criada, novo vínculo e alteração do e-mail, sem envio SMTP nos testes.
- [ ] Validar a notificação operacional e os demais destinatários no Mailpit quando os fluxos de domínio forem ligados.
- [x] Testar idempotência, falha do transporte, reprocessamento e motivo de falha sanitizado.
- [ ] Validar o comportamento sob concorrência real de workers.

A API exige uma chave UUID estável por envio. Chamadas repetidas com a mesma chave e os mesmos dados devolvem a tentativa existente. Reutilizar uma chave com destinatário ou conteúdo diferente falha. O envio operacional recebe uma `DatabaseNotification` já criada e guarda um snapshot imutável de assunto e corpo. Os avisos de conta criada e de novo vínculo guardam somente tentativas, sem corpo; o primeiro leva à solicitação de definição de senha e o segundo ao login. O aviso de troca de e-mail guarda assunto, HTML e texto completos em `email_messages`. A tela de Segurança reserva dois avisos com chaves distintas, um para o endereço anterior e outro para o novo, na mesma transação que atualiza `users.email`. Cada tentativa referencia o conteúdo imutável usado no reenvio. Os e-mails usam os componentes Markdown nativos do Laravel, também documentados para Mail Notifications; o Job próprio mantém o histórico de tentativas e o resultado do transporte.

O Job usa bloqueio transacional da tentativa. Se o worker morrer depois de o SMTP aceitar a mensagem e antes de gravar `sent`, o resultado é incerto; um reenvio manual pode gerar uma segunda entrega. Esse limite do SMTP precisa ser considerado na futura interface de reprocessamento. Não há endpoint administrativo de reenvio nesta fase.

Workers de fila mantêm o código carregado em memória. Após alterar templates de e-mail, Mailables ou Jobs, execute `php artisan queue:restart` e confirme que há um worker novo em execução. Se `queue:work` foi iniciado manualmente, inicie-o outra vez após a saída; `queue:restart` não o relança. Mensagens já entregues no Mailpit mantêm o conteúdo original.

## Notificações

- [ ] Criar notificações operacionais somente na conta ou vínculo destinatário adequado.
- [x] Manter leitura interna independente da entrega de e-mail; `read_at` é testado separadamente do histórico de transporte.
- [ ] Definir destinatários e canais para novo vínculo, documento disponível, correções, avaliações e eventos do estágio.
- [ ] Manter o resumo do Setor de Estágio como notificação agrupada interna quando o contrato assim determinar.

## Interface administrativa futura

- [ ] Definir autorização de consulta de tentativas e solicitação de reenvio por vínculo.
- [ ] Exibir histórico sem revelar tokens, credenciais, conteúdo protegido ou dados de outro escopo.

## Critério de saída

- [x] Os fluxos já ligados usam a interface comum e idempotente; os demais fluxos de domínio ainda precisam ser integrados.
- [x] Falhas e tentativas anteriores ficam registradas; o reenvio manual preserva o histórico. Se o SMTP aceitar a mensagem e o worker falhar antes de gravar o resultado, uma nova tentativa pode duplicar a entrega.
- [x] Senhas, tokens e credenciais não são gravados no Activity Log nem nas tabelas próprias de mensagem/entrega.

## Próxima fase

[Fase 05 — Administração hierárquica](doc:fase-05-administracao)
