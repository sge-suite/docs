---
id: fase-04-integracao-de-email
title: Fase 04 — Integração de e-mail
description: Backend de e-mail em fila, snapshots dos templates e histórico administrativo de envios.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/email, sge/checklist
related: enums, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose, enum-emaildeliveryattemptstatus, migration-05-notifications, migration-06-email-messages, migration-07-email-delivery-attempts, fase-03-activity-log
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/RequestEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Jobs/SendEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Mail/DeliveryMail.php, https://github.com/sge-suite/sge/blob/master/app/Policies/EmailDeliveryAttemptPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/EmailLogAccess.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1index.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1show.blade.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryFlowTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailLogInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Settings/SecurityTest.php
---
As tabelas `notifications`, `email_messages` e `email_delivery_attempts`, seus enums, Models, validações e telas de consulta administrativa existem. `RequestEmailDelivery` grava snapshots e reserva tentativas, depois despacha `SendEmailDelivery` após o commit. Os fluxos administrativos de criação de conta, criação ou encerramento de vínculo, exclusão de conta e alteração do e-mail registram o conteúdo renderizado. A troca de e-mail da conta gera avisos aos endereços anterior e novo. Templates Markdown do Laravel produzem HTML e texto. Quando existe um vínculo solicitante, o conteúdo registra seu nome e tipo e mantém a assinatura no snapshot; envios automáticos assinam em nome do sistema. A recuperação de senha usa a Notification enfileirada do Fortify e não cria linhas nas tabelas próprias de entrega. O transporte vem de `config/mail.php`.

## Backend de envio

- [x] Definir finalidades: notificação operacional, conta criada, novo vínculo, alteração do e-mail da conta e alteração administrativa. A retenção institucional continua pendente.
- [x] Criar um ponto de entrada único para solicitar o envio sem repetir persistência nos fluxos.
- [x] Reservar tentativas com `delivery_key` UUID e sequência única, até três tentativas por envio.
- [x] Despachar envio somente depois do commit da transação de domínio.
- [x] Registrar `queued`, `sent` e `failed` com provedor e motivo sanitizado.
- [x] Configurar timeout SMTP de 10 segundos, Job de 60 segundos e limite de três tentativas. A nova tentativa é explícita; o Job não repete automaticamente um SMTP de resultado incerto.
- [x] Reprocessar falhas pela Action, preservando tentativas anteriores e o conteúdo imutável.
- [x] Manter a recuperação de senha fora de `email_messages` e `email_delivery_attempts`; a Notification do Fortify é enfileirada após o commit.
- [x] Enviar e-mail de conta criada informando o primeiro vínculo e levando à recuperação com o e-mail preenchido para solicitar a definição da senha; armazenar assunto, HTML e texto já renderizados.
- [x] Ao criar vínculo em conta existente, avisar `users.email` e `affiliations.email` com link de login; deduplicar quando forem iguais e armazenar um snapshot imutável por envio.
- [x] Armazenar os avisos administrativos de desativação/exclusão de vínculo e exclusão de conta, com a finalidade, o conteúdo e o registro associado.
- [x] Incluir a assinatura do vínculo solicitante em avisos administrativos; manter nome e função no snapshot para retries e exibição históricos.
- [x] Reservar a tentativa de convite com `requested_by_affiliation_id` quando houver vínculo ativo; o Job preserva essa autoria.
- [x] Cobrir por renderização os templates de conta criada, novo vínculo e alteração do e-mail; testes automatizados não encaminham mensagens ao SMTP.
- [ ] Validar a notificação operacional e os demais destinatários no Mailpit quando os fluxos de domínio forem ligados.
- [x] Testar idempotência, falha do transporte, reprocessamento e motivo de falha sanitizado.
- [ ] Validar o comportamento sob concorrência real de workers.

A API exige uma chave UUID estável por envio. Chamadas repetidas com a mesma chave e os mesmos dados devolvem a tentativa existente. Reutilizar uma chave com destinatário ou conteúdo diferente falha. O envio operacional recebe uma `DatabaseNotification` já criada e guarda um snapshot imutável de assunto e corpo. Os avisos de conta criada, novo vínculo, alteração do e-mail e alteração administrativa também guardam o conteúdo renderizado em `email_messages`; registros antigos de conta criada ou novo vínculo podem não ter esse conteúdo. O primeiro leva à solicitação de definição de senha e o aviso de novo vínculo ao login. A tela de Segurança reserva dois avisos com chaves distintas, um para o endereço anterior e outro para o novo, na mesma transação que atualiza `users.email`. Cada tentativa referencia o snapshot utilizado. Os e-mails usam os componentes Markdown nativos do Laravel, também documentados para Mail Notifications; o Job próprio mantém o histórico de tentativas e o resultado do transporte.

O Job usa bloqueio transacional da tentativa. Se o worker morrer depois de o SMTP aceitar a mensagem e antes de gravar `sent`, o resultado é incerto; um reenvio manual pode gerar uma segunda entrega. Esse limite do SMTP precisa ser considerado na futura interface de reprocessamento. Não há endpoint administrativo de reenvio nesta fase.

Workers de fila mantêm o código carregado em memória. Após alterar templates de e-mail, Mailables ou Jobs, execute `php artisan queue:restart` e confirme que há um worker novo em execução. Se `queue:work` foi iniciado manualmente, inicie-o outra vez após a saída; `queue:restart` não o relança. Mensagens já entregues no Mailpit mantêm o conteúdo original.

## Notificações

- [ ] Criar notificações operacionais somente na conta ou vínculo destinatário adequado.
- [x] Manter leitura interna independente da entrega de e-mail; `read_at` é testado separadamente do histórico de transporte.
- [ ] Definir destinatários e canais para novo vínculo, documento disponível, correções, avaliações e eventos do estágio.
- [ ] Manter o resumo do Setor de Estágio como notificação agrupada interna quando o contrato assim determinar.

## Histórico de e-mails para o Administrador do Sistema

- [x] Disponibilizar índice com filtros de finalidade e estado, e detalhes com conteúdo armazenado e todas as tentativas.
- [x] Revalidar por Policy, em cada requisição, que o vínculo ativo selecionado é Administrador do Sistema; não há bypass de autorização.
- [x] Filtrar por `scope_context` do registro: contas e vínculos dos tipos Administrador do Sistema e Administrador do Campus. O destinatário pode ser uma pessoa sem conta; não determina o escopo.
- [x] Excluir notificações operacionais, recuperação de senha e mensagens sem contexto administrativo verificável.
- [x] Renderizar HTML em iframe sandboxed com scripts e recursos externos bloqueados; usar texto escapado como fallback e mostrar tentativas sem expor chaves, tokens ou exceções brutas.
- [ ] Definir autorizações e limites de consulta para outros tipos de vínculo.
- [ ] Definir uma interface autorizada para solicitar reenvio. O detalhe atual não oferece ação de reenvio.

## Critério de saída

- [x] Os fluxos já ligados usam a interface comum e idempotente; os demais fluxos de domínio ainda precisam ser integrados.
- [x] Falhas e tentativas anteriores ficam registradas; o reenvio manual preserva o histórico. Se o SMTP aceitar a mensagem e o worker falhar antes de gravar o resultado, uma nova tentativa pode duplicar a entrega.
- [x] Senhas, tokens e credenciais não são gravados no Activity Log nem nas tabelas próprias de mensagem/entrega.

## Próxima fase

[Fase 05 — Administração hierárquica](doc:fase-05-administracao)
