---
id: fase-04-integracao-de-email
title: Fase 04 — Integração de e-mail
description: Backend de e-mail em fila, snapshots dos templates e histórico administrativo de envios.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/email, sge/checklist
related: enums, e-mails-notificacoes-e-entregas, enum-emailmessagepurpose, enum-emaildeliveryattemptstatus, migration-05-notifications, migration-06-email-messages, migration-07-email-delivery-attempts, fase-03-activity-log
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/RequestEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Jobs/SendEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Mail/DeliveryMail.php, https://github.com/sge-suite/sge/blob/master/app/Policies/EmailDeliveryAttemptPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/EmailLogAccess.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1index.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1show.blade.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusEmailLogScope.php
---
As tabelas `notifications`, `email_messages` e `email_delivery_attempts`, seus enums, Models, validações e telas de consulta administrativa existem. `RequestEmailDelivery` grava snapshots e reserva tentativas, depois despacha `SendEmailDelivery` após o commit. Os fluxos administrativos de criação de conta, criação ou encerramento de vínculo, exclusão de conta e alteração do e-mail registram o conteúdo renderizado. A troca de e-mail da conta gera avisos aos endereços anterior e novo. Quando a própria pessoa altera o e-mail, o aviso identifica que a mudança foi feita na própria conta e usa a assinatura do sistema; quando outra pessoa faz a alteração, o aviso mantém o nome e o tipo de vínculo de quem solicitou. Templates Markdown do Laravel produzem HTML e texto, preservados no snapshot. A recuperação de senha usa a Notification enfileirada do Fortify e não cria linhas nas tabelas próprias de entrega. O fluxo de solicitação de estágio envia aviso interno e e-mail ao Discente após decisão; correções incluem mensagens por etapa e orientação geral do Setor. As avaliações do supervisor também usam aviso interno e e-mail pós-commit; avisos de documento, liberação, conclusão, cancelamento e execução estão integrados ao pipeline. O transporte vem de `config/mail.php`.

## Backend de envio

- [x] Definir finalidades: notificação operacional, conta criada, novo vínculo, alteração do e-mail da conta e alteração administrativa. A retenção institucional continua pendente.
- [x] Criar um ponto de entrada único para solicitar o envio sem repetir persistência nos fluxos.
- [x] Reservar tentativas com `delivery_key` UUID e sequência única, até três tentativas por envio.
- [x] Despachar envio somente depois do commit da transação de domínio.
- [x] Registrar `queued`, `sent` e `failed` com provedor e motivo sanitizado.
- [x] Configurar timeout SMTP de 10 segundos, Job de 60 segundos e limite de três tentativas. A nova tentativa é explícita; o Job não repete automaticamente um SMTP de resultado incerto.
- [x] Reprocessar falhas pela Action, preservando tentativas anteriores e o conteúdo imutável.
- [x] Manter a recuperação de senha fora de `email_messages` e `email_delivery_attempts`; a Notification do Fortify é enfileirada após o commit.
- [x] Enviar um único e-mail de conta criada ao login, incluindo tipo do primeiro vínculo, campus/escopo, matrícula, curso e contato quando aplicáveis, sem aviso separado para esse primeiro vínculo e levando à recuperação com o e-mail preenchido para solicitar a definição da senha; armazenar assunto, HTML e texto já renderizados.
- [x] Ao criar vínculo em conta existente, avisar `users.email` e `affiliations.email` com link de login; deduplicar quando forem iguais e armazenar um snapshot imutável por envio.
- [x] Armazenar os avisos administrativos de desativação/exclusão de vínculo e exclusão de conta, com a finalidade, o conteúdo e o registro associado.
- [x] Incluir a assinatura do vínculo solicitante em avisos administrativos; manter nome e função no snapshot para retries e exibição históricos.
- [x] Identificar nos avisos de troca de e-mail quando a própria pessoa alterou sua conta; usar a assinatura do sistema nesse caso e preservar a identificação do vínculo quando outra pessoa solicitar a alteração.
- [x] Reservar a tentativa de convite com `requested_by_affiliation_id` quando houver vínculo ativo; o Job preserva essa autoria.
- [ ] Cobrir por renderização os templates de conta criada, novo vínculo e alteração do e-mail, incluindo a distinção entre alteração própria e feita por outra pessoa; testes automatizados não encaminham mensagens ao SMTP.
- [x] Integrar notificação interna e e-mail pós-commit para decisões e correções da solicitação, incluindo mensagens de correção por seção.
- [ ] Validar no Mailpit os destinatários e conteúdos de todos os fluxos atualmente ligados.
- [ ] Testar idempotência, falha do transporte, reprocessamento e motivo de falha sanitizado.
- [ ] Validar o comportamento sob concorrência real de workers.

A API exige uma chave UUID estável por envio. Chamadas repetidas com a mesma chave e os mesmos dados devolvem a tentativa existente. Reutilizar uma chave com destinatário ou conteúdo diferente falha. O envio operacional recebe uma `DatabaseNotification` já criada e guarda um snapshot imutável de assunto e corpo. Os avisos de conta criada, novo vínculo, alteração do e-mail e alteração administrativa também guardam o conteúdo renderizado em `email_messages`; registros antigos de conta criada ou novo vínculo podem não ter esse conteúdo. O primeiro leva à solicitação de definição de senha e o aviso de novo vínculo ao login. A tela de Segurança reserva dois avisos com chaves distintas, um para o endereço anterior e outro para o novo, na mesma transação que atualiza `users.email`. Cada tentativa referencia o snapshot utilizado. Os e-mails usam os componentes Markdown nativos do Laravel, também documentados para Mail Notifications; o Job próprio mantém o histórico de tentativas e o resultado do transporte.

O Job usa bloqueio transacional da tentativa. Se o worker morrer depois de o SMTP aceitar a mensagem e antes de gravar `sent`, o resultado é incerto; um reenvio manual pode gerar uma segunda entrega. Esse limite do SMTP precisa ser considerado na futura interface de reprocessamento. Não há endpoint administrativo de reenvio nesta fase.

Workers de fila mantêm o código carregado em memória. Após alterar templates de e-mail, Mailables ou Jobs, execute `php artisan queue:restart` e confirme que há um worker novo em execução. Se `queue:work` foi iniciado manualmente, inicie-o outra vez após a saída; `queue:restart` não o relança. Mensagens já entregues no Mailpit mantêm o conteúdo original.

## Notificações

- [x] Direcionar as notificações de decisão e correção da solicitação ao vínculo discente proprietário, com autorização por vínculo.
- [x] Manter leitura interna independente da entrega de e-mail; `read_at` permanece separado do histórico de transporte. Automatizar a validação na preparação para produção.
- [x] Definir o destinatário e os canais dos avisos de decisão e correção da solicitação de estágio.
- [x] Integrar liberação e revisão da avaliação ao vínculo supervisor e envio da resposta aos vínculos ativos do Setor do campus, com notificação interna e e-mail após commit.
- [x] Separar o aviso de aceite da avaliação do supervisor/conclusão ao Discente do aviso de nota final, reservado somente com as três notas válidas; manter a entrega única por estágio e o histórico imutável.
- [x] Integrar avisos de documento disponível, eventos de execução, cancelamento e conclusão, com seleção e canais definidos em cada fluxo.
- [x] Agrupar solicitações e cancelamentos pendentes em resumo interno diário do Setor; o resumo de eventos temporais do estágio permanece pendente.

## Histórico de e-mails por escopo

- [x] Disponibilizar índice com filtros de finalidade e estado, e detalhes com conteúdo armazenado e todas as tentativas.
- [x] Compartilhar as telas e o grupo Logs com Administrador do Sistema e Setor de Estágio, revalidando o vínculo ativo selecionado e seu escopo em cada requisição; não há bypass de autorização.
- [x] Filtrar por `scope_context` do registro: na visão global, contas e vínculos dos tipos Administrador do Sistema e Setor de Estágio; na visão local, cadastro e alterações de contas e vínculos ligados ao campus selecionado, sem vínculos de Administrador do Sistema. O destinatário e o solicitante não determinam o escopo.
- [x] Proteger mensagens de vínculos globais na visão do Setor; permitir o aviso de alteração do próprio e-mail de login mesmo quando a conta também possui vínculo global.
- [x] Preservar a consulta das tentativas após exclusão do vínculo e em campus desativado, usando o contexto persistido do registro afetado.
- [x] Manter o escopo global do Administrador do Sistema limitado às mensagens administrativas; disponibilizar ao Setor os avisos operacionais do próprio campus conforme Policy e processo associado.
- [x] Renderizar HTML em iframe sandboxed com scripts e recursos externos bloqueados; usar texto escapado como fallback e mostrar tentativas sem expor chaves, tokens ou exceções brutas.
- [ ] Definir autorizações e limites de consulta para outros tipos de vínculo.
- [ ] Definir uma interface autorizada para solicitar reenvio. O detalhe atual não oferece ação de reenvio.


## Critério de saída

- [x] Os avisos atuais de abertura, avaliação, assinatura, execução, cancelamento e conclusão usam o pipeline comum e idempotente; retenção, escopos adicionais e validação operacional permanecem pendentes.
- [x] Falhas e tentativas anteriores ficam registradas; o reenvio manual preserva o histórico. Se o SMTP aceitar a mensagem e o worker falhar antes de gravar o resultado, uma nova tentativa pode duplicar a entrega.
- [x] Senhas, tokens e credenciais não são gravados no Activity Log nem nas tabelas próprias de mensagem/entrega.

## Próxima fase

[Fase 05 — Administração hierárquica](doc:fase-05-administracao)

A avaliação usa `DeliverSupervisorEvaluationNotice` e `RequestEmailDelivery::notification`: UUID por aviso preservada nas reexecuções, link nomeado para a avaliação, destinatário pelo vínculo e conteúdo/tentativas imutáveis no pipeline existente. A liberação não depende da entrega de e-mail para aparecer na lista autorizada. Validar consumo da fila e entrega no Mailpit permanece pendente.

O aceite/conclusão ao Discente e o aviso final usam `NotifyInternshipEvaluationResults`, integrado à conclusão por avaliação e ao lançamento das notas. As mensagens são reservadas na transação de domínio e o transporte continua após commit. O aceite usa a notificação interna de conclusão já existente; a nota final tem uma chave determinística única por estágio. Reexecuções de Jobs de avaliação e de decisão da solicitação não reconstroem mensagens já reservadas. Veja o [contrato separado dos dois eventos](doc:e-mails-notificacoes-e-entregas#aceite-da-avaliacao-do-supervisor-e-conclusao-da-pratica) e a [decisão sobre avisos acadêmicos](doc:backlog-e-decisoes#avisos-academicos-de-avaliacao-decisao-de-22-10-2026).
