---
id: e-mails-notificacoes-e-entregas
title: E-mails, notificações e entregas
description: Contrato atual das notificações internas, mensagens, tentativas e consulta administrativa de e-mails.
type: technical-reference
status: in-progress
visibility: public
tags: sge/planejamento, sge/email, sge/notificacoes, sge/auditoria
related: enums, migrations, dominio-e-modelo-de-dados, fluxos-principais
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/RequestEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Jobs/SendEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Mail/DeliveryMail.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailMessage.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailDeliveryAttempt.php, https://github.com/sge-suite/sge/blob/master/app/Policies/EmailDeliveryAttemptPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/EmailLogAccess.php
diagram: mensageria-fluxo
---
> [!abstract] Estado atual
> As Migrations 05–07, o backend em fila e as telas administrativas estão implementados. Há avisos para decisões/correções da abertura, avaliação do supervisor, assinatura de documentos, liberação, início/pausa/retomada, cancelamento e conclusão. O Administrador do Sistema consulta mensagens ligadas a contas e vínculos administrativos; o Setor consulta mensagens operacionais do campus. As telas mostram conteúdo salvo e tentativas, sem ação de reenvio. Permanecem a validação operacional, escopos de consulta para outros vínculos e a definição institucional de retenção.

## Objetivo e limites

O SGE mantém trilhas separadas para notificações exibidas no sistema, mensagens de e-mail e tentativas de transporte. Assim, reenvios e falhas não sobrescrevem o histórico nem fazem uma notificação parecer enviada quando o provedor recusou a mensagem.

O termo **enviado** neste plano significa que o provedor SMTP aceitou a mensagem. Confirmação de abertura ou leitura do e-mail não faz parte do escopo inicial. A leitura da notificação interna continua independente, controlada exclusivamente por `read_at`.

{{diagram:mensageria-fluxo}}

## Estruturas de persistência

### `notifications`

Usa a tabela nativa plural do Laravel, com `data` em `jsonb`. Cada linha representa uma notificação destinada a uma conta ou a um vínculo dentro do sistema.

| Campo                               | Tipo conceitual    | Finalidade                                                                 |
| ----------------------------------- | ------------------ | -------------------------------------------------------------------------- |
| `id`                                | uuid               | Identificador compatível com Notifications do Laravel.                     |
| `notifiable_type` / `notifiable_id` | morph              | `Affiliation` para operação; `User` somente quando um aviso interno da conta for definido. |
| `type`                              | string             | Classe/tipo estável da notificação.                                        |
| `data`                              | jsonb              | JSON convertido pelo cast nativo `array`, com título, texto interno, rota/entidade e metadados não sensíveis. |
| `read_at`                           | timestamp nullable | Leitura no SGE; não representa leitura do e-mail.                          |
| `created_at` / `updated_at`         | timestamp          | Auditoria temporal.                                                        |

Avisos de decisão e correção da solicitação de estágio são criados no vínculo discente e seguem por e-mail após o commit. A caixa de notificações por vínculo usa `Affiliation::notifications()`; `AffiliationPolicy::viewNotifications` exige que o vínculo ativo pertença à conta autenticada, e a relação não mistura caixas de vínculos diferentes. Avaliações do supervisor geram avisos internos e e-mails após commit: liberação e revisão ao vínculo supervisor, envio da resposta aos vínculos ativos do Setor do campus. Avisos de assinatura, execução, cancelamento e conclusão também usam o pipeline. Recuperação de senha e convite inicial não criam registros internos em `notifications`.

O schema nativo não recebe coluna de deduplicação. Para evento reexecutável, a Action precisa persistir e consultar a fonte de idempotência do domínio. `email_messages.idempotency_key` cobre a mensagem de e-mail; um aviso somente interno que exigir deduplicação durável precisa de um registro operacional próprio antes de o fluxo ser ativado.

O aviso de documento disponível para assinatura é uma seleção humana: ao mover para `awaiting_signature`, o Setor informa o local e escolhe se avisará os interessados. Com aviso habilitado, ao menos um contato elegível deve ser selecionado; não há destinatário livre. Cada selecionado recebe nome, papel, estágio, documento e local, com complemento opcional próprio. Vínculos recebem notificação interna e e-mail; o contato cadastrado da concedente recebe somente e-mail. `EmailMessagePurpose::DocumentSignature` permite conteúdo imutável com ou sem notificação interna, preservando destinatário nas tentativas do pipeline após commit. O Activity Log registra somente categorias/quantidade e local, sem conteúdo personalizado ou endereços.

### `email_messages`

Guarda o conteúdo imutável já renderizado das finalidades que têm histórico próprio: notificações operacionais e avisos de conta criada, novo vínculo, alteração do e-mail da conta ou outra alteração administrativa. Inclui `notification_id` quando há notificação, finalidade, assunto, texto/HTML, identificadores opcionais do template e `idempotency_key`. O conteúdo é armazenado sem cast criptografado. Destinatário, solicitante e contexto do registro afetado ficam na tentativa. Recuperação de senha não cria mensagem nem tentativa.

### `email_delivery_attempts`

Cada linha representa uma tentativa de transporte. `recipient_email` registra o destinatário efetivo, que pode não pertencer a uma conta do SGE. `purpose` identifica a finalidade. Novos envios das finalidades administrativas têm `email_message_id` ligado ao conteúdo imutável; tentativas antigas de conta criada ou novo vínculo podem permanecer sem mensagem. `scope_context` guarda um snapshot de `user_id`, `affiliation_ids`, `affiliation_types` e `campus_ids` do registro afetado; não representa o último vínculo selecionado. `delivery_key` é uma chave UUID estável do envio; ela permite idempotência e até três tentativas com números únicos. `requested_by_affiliation_id` registra o vínculo solicitante, quando houver; para envio automático, fica nulo. A tentativa mantém número, estado `queued`, `sent` ou `failed`, provedor, identificador do provedor, marcos temporais e motivo técnico sanitizado de falha.

O Model bloqueia exclusão e mudança de uma tentativa finalizada. `RequestEmailDelivery` reserva a tentativa e despacha `SendEmailDelivery` depois do commit; o Job envia com o mailer nativo e registra o resultado. O reprocessamento explícito usa a mesma Action. Mensagens e tentativas não usam `LogsActivity`: são o histórico técnico de entrega. O acesso ao banco deve impedir alterações diretas que contornem essas regras.

## Regras por finalidade

| Finalidade | Persistência | Conteúdo |
| --- | --- | --- |
| Recuperação de senha | Nenhuma linha em `email_messages` ou `email_delivery_attempts`. | Token, URL, destinatário e corpo não são registrados nessas tabelas. |
| Conta criada com primeiro vínculo | Uma mensagem imutável e uma tentativa `account_created`. Registros antigos podem ter `email_message_id` nulo. | Envia um único convite ao e-mail de login, com tipo do primeiro vínculo, campus/escopo, matrícula, curso e e-mail do vínculo quando aplicáveis. Não envia aviso separado de novo vínculo para esse primeiro cadastro. Leva à solicitação de definição da senha sem guardar token ou URL assinada. |
| Novo vínculo em conta existente | Uma mensagem imutável e uma tentativa `new_affiliation` por endereço avisado. | Avisa o e-mail da conta e o do vínculo, deduplicando quando iguais, e leva ao login. |
| Alteração de e-mail da conta | Uma mensagem imutável e uma tentativa por endereço avisado. | A própria pessoa recebe um aviso que identifica a alteração como feita na própria conta e assina em nome do sistema. Quando outra pessoa solicita a alteração, o aviso identifica o nome e o tipo do vínculo solicitante. Os dois avisos, para os endereços anterior e novo, preservam o mesmo conteúdo em cada tentativa. |
| Alteração administrativa | Uma mensagem imutável e uma tentativa `administrative_change` por endereço avisado. | Registra conteúdo dos avisos de desativação/exclusão de vínculo e exclusão de conta; o contexto aponta para a conta ou vínculo afetado. |
| Decisão ou correção da solicitação de estágio | `notifications`, `email_messages` e tentativas. | A correção detalha cada etapa afetada, a mensagem específica e, quando informada, a orientação geral; o destinatário e o transporte ficam na tentativa. |
| Operação da avaliação do supervisor | `notifications`, `email_messages` e tentativas. | Liberação e revisão ao vínculo supervisor responsável; envio da resposta aos vínculos ativos do Setor do campus. Link `supervisor-evaluations.show`, com autorização por vínculo/campus. |
| Avaliação do supervisor aceita e prática concluída | Reutiliza a notificação interna de conclusão do Discente e reserva mensagem/tentativa na transação do aceite. | Somente o vínculo discente recebe a nota do supervisor e a confirmação de estágio concluído; não aguarda relatório/apresentação e não inclui nota final nem observações da avaliação. |
| Avaliação final disponível | Uma notificação interna, uma mensagem imutável e tentativas por estágio. | Somente o vínculo discente recebe as três notas e a nota final calculada, depois de todas estarem preenchidas e válidas. Alterações posteriores não disparam novo aviso automático. |
| Resumo interno do Setor | Apenas `notifications`. | Conteúdo interno pertinente ao vínculo. |

> [!warning] Segredos não entram no histórico
> Senhas, tokens, URLs assinadas e credenciais SMTP não devem ser persistidos em mensagens, tentativas, notificações ou Activity Log.

O e-mail de conta criada leva à tela de recuperação com o e-mail preenchido. A pessoa então solicita o link para definir a senha. Essa notificação do Fortify é enfileirada com payload cifrado, pois a fila técnica precisa transportar temporariamente o token; ela não cria histórico nas tabelas de e-mail da aplicação.

## Fluxos de autenticação e avisos operacionais

### Recuperação de senha

{{diagram:recuperacao-de-senha-fluxo}}

### Notificação operacional por e-mail

{{diagram:notificacao-operacional-fluxo}}

## Implementação e pendências

As estruturas e o pipeline abaixo já existem; esta lista mostra o que está implementado e o que falta integrar. A migration de `notifications` não declara FKs porque `notifiable_type`/`notifiable_id` são polimórficos; a FK de `email_messages` depende de `notifications`; as referências de `email_delivery_attempts` dependem de `affiliations`.

1. [x] Implementar os enums de finalidade e status.
2. [x] Criar a migration nativa de `notifications` pelo gerador do Laravel e adaptar `data` para `jsonb`; adicionar `Notifiable` a `Affiliation`.
3. [x] Criar as migrations de mensagens e tentativas com suas FKs.
4. [x] Implementar Models, relações, validações e factories próprios de e-mail.
5. [x] Manter o envio de recuperação do Fortify fora das tabelas de mensagens e tentativas.
6. [x] Definir o convite inicial sem envio de senha; o link abre a tela de recuperação com o e-mail preenchido.
7. [x] Criar o backend comum de reserva e envio em fila, com conteúdo persistido apenas nas finalidades que o exigem.
8. [x] Configurar Jobs, timeout, reprocessamento explícito e motivo de falha sanitizado. O reprocessamento é pela Action; a interface de consulta não oferece reenvio.
9. [ ] Validar os fluxos implementados, idempotência, reenvio, renderização e proteção de segredos na preparação para produção, sem integração real com Meilisearch.
10. [x] Disponibilizar índice e detalhes de envios para o Administrador do Sistema, revalidando o vínculo ativo e selecionado pela Policy em cada requisição.
11. [x] Filtrar por registro afetado via `scope_context`, incluindo contas e vínculos administrativos sem inferir escopo pelo destinatário ou solicitante.
12. [x] Mostrar o conteúdo persistido e as tentativas em visualização isolada; não expor segredos nem permitir reenvio na interface.
13. [ ] Definir escopos de consulta para outros tipos de vínculo e a política institucional de retenção.

## Pendência de retenção

A duração de retenção de `email_messages`, tentativas e conteúdo precisa seguir a política institucional de auditoria e LGPD. Até essa decisão, o acesso deve ser mínimo, auditado e permitido apenas a perfis administrativos autorizados; limpeza automática não deve ser implementada sem a definição formal de prazo.

Veja também [Enums](doc:enums), [Migrations](doc:migrations), [Painel de desenvolvimento](doc:painel-de-desenvolvimento), [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).

## Integração da abertura — 16/10/2026

Devolução, recusa e aceite da abertura enfileiram `DeliverInternshipRequestNotice` após commit. O job preserva uma UUID por decisão, cria a notificação no vínculo discente e usa `RequestEmailDelivery::notification` para reservar mensagem/tentativa com a mesma chave. Reexecução não duplica notificação nem reserva. O texto contém apenas número/situação e orientação de acesso; motivos detalhados, dados pessoais e comprovantes permanecem no sistema.

`internship-requests:notify-office`, agendado às 08h no fuso institucional, cria somente um resumo interno diário por vínculo ativo do Setor e campus, agrupando solicitações Submitted/UnderReview. A identidade determinística por destinatário/data e a PK da notificação impedem duplicidade. Não envia e-mail ao Setor nem distribui a mesma pendência em mensagens individuais. O resumo aponta para Analisar solicitações. Os avisos documentais e a escolha dos interessados são feitos pelo Setor no fluxo de documentos, sem aviso automático ao Setor por e-mail.

## Integração da avaliação do supervisor

`ManageSupervisorEvaluation` despacha `DeliverSupervisorEvaluationNotice` somente após commit. Cada aviso leva uma UUID estável ao job, reutilizada como ID da notificação e chave da reserva de e-mail; reexecução reaproveita ambas. A notificação guarda título, mensagem, rota e ID da avaliação. O job usa o e-mail do vínculo destinatário e o pipeline operacional existente. Leitura interna não confirma entrega SMTP. Avisos de avaliação integram os logs de e-mail do Setor no campus do estágio; o escopo global do Administrador continua restrito a mensagens administrativas. Se a mesma pessoa também for Coordenadora, avisos referentes à sua atuação como Orientador continuam endereçados ao vínculo de Orientador. Workers precisam carregar a nova versão; consumo da fila, Mailpit e concorrência permanecem pendentes de validação operacional.

### Aceite da avaliação do supervisor e conclusão da prática

O aceite pelo Setor seleciona a avaliação vigente, calcula a nota do supervisor e conclui o estágio na mesma transação, com carga horária integral confirmada. `NotifyInternshipLifecycle` mantém os avisos internos existentes para Discente, Orientador e Supervisor. Para o Discente, `NotifyInternshipEvaluationResults::supervisorApproved` prepara o e-mail específico de aceite/conclusão usando a própria notificação de conclusão, sem um segundo e-mail genérico de conclusão ao mesmo vínculo. Orientador e Supervisor continuam recebendo os avisos existentes de conclusão; a decisão da avaliação continua sendo avisada ao Supervisor.

O destinatário acadêmico é o vínculo discente ativo do estágio, do mesmo campus e com e-mail válido, selecionado por `InternshipRecipients`. O legado (`SupervisorEvaluationController::associate`, `AvaliacaoEstagioConcluida` e `emails.estagios.avaliacao-concluida`) enviava ao e-mail do discente nome, curso, tipo, nota/peso do supervisor e confirmação de carga horária cumprida e conclusão. O SGE novo preserva esses elementos e acrescenta a identificação do estágio, concedente, campus e período previsto. Não envia as considerações nem os aspectos de rendimento que o template antigo podia incluir: as observações permanecem nas consultas autorizadas. O e-mail não contém nota final, mesmo quando as notas acadêmicas já existem, e não depende delas para ser preparado.

### Avaliação final disponível

O legado não possuía um e-mail de nota final: `InternshipViewController::updateAdvisorGrades` apenas persistia as notas e o resultado. Por decisão do responsável em 22/10/2026, o novo aviso é exclusivo do vínculo discente elegível, com nota do supervisor, relatório, apresentação e nota final calculada. Não são adicionados destinatários institucionais.

`NotifyInternshipEvaluationResults::finalGradeAvailable` é chamado tanto no aceite da avaliação quanto no lançamento das notas por `UpdateAdvisorGrades`, cobrindo qualquer ordem de preenchimento. Exige as três notas e a consolidada não nulas, avaliação vigente aprovada do próprio estágio com carga cumprida, estágio não cancelado e correspondência com o cálculo de `InternshipGradeCalculator`. Zero é uma nota válida; componentes com peso zero seguem a normalização do cálculo existente, mas os três campos precisam estar preenchidos. A mensagem usa `consolidated_grade`, sem fórmula paralela nem corte de aprovação.

O ID determinístico por estágio e evento é compartilhado pela notificação e pela chave do e-mail. A reserva e os corpos HTML/texto são criados dentro da transação de domínio com o estágio bloqueado; somente `SendEmailDelivery` é despachado após commit. Salvar novamente, limpar e preencher notas, alterar nota ou e-mail do vínculo depois da primeira reserva não cria outro aviso nem reescreve destinatário/conteúdo antigos. Sem destinatário elegível não há fallback institucional. Não há varredura ou disparo retroativo de estágios antigos nesta entrega.

Falhas de transporte continuam sujeitas ao reprocessamento explícito por `RequestEmailDelivery::retry`, preservando mensagem e endereço da reserva. Os Jobs de avisos de avaliação e de decisão da solicitação retornam quando a mensagem já existe, evitando reconstrução do conteúdo a partir de dados alterados. O limite de resultado incerto do SMTP continua válido. Uma política futura de aviso de retificação da nota final depende de decisão própria; até lá não há reenvio automático por alteração.

Os avisos novos apontam para o painel e não concedem acesso ao formulário ou aos comentários da avaliação. Policies, vínculos, notificações internas existentes e escopo dos logs permanecem vigentes. O assunto, as tabelas de identificação e resultados e os corpos em texto ficam preservados no histórico do pipeline. Os demais avisos operacionais de estágio também identificam o nome do tipo do snapshot; assinatura e recibo de abertura já o continham. Os e-mails de conta/vínculo não recebem dados de um estágio sem relação com seu evento.

## Identificação no aviso de assinatura

A versão atual de `document.signature-available` identifica o documento pelo nome, o estágio pelo discente/matrícula, curso, campus, concedente, tipo e período previsto. Usa valores congelados na emissão quando disponíveis, com referência ao estágio para os demais campos. Assunto e corpos HTML/texto não exibem IDs internos de estágio ou documento. Número de protocolo aparece somente quando cadastrado no documento. Complementos permanecem por destinatário; conteúdos/tentativas históricos não são reescritos.

## Contatos institucionais e destinatários

`campuses.internship_office_email` guarda o e-mail institucional do Setor de Estágio do campus, e `courses.coordination_email` guarda o e-mail institucional da Coordenação do curso. São campos obrigatórios, validados e normalizados e aparecem nos detalhes de campus/curso. O e-mail do Setor também é exibido nos formulários de abertura e avaliação do supervisor; nesses dois contatos, o botão copia o endereço e mostra confirmação por toast. Esses dois campos ainda não fazem parte do catálogo de variáveis dos documentos: `CAMPUS_EMAIL` continua sem origem, pois o sistema não tem um e-mail geral do campus.

Esses campos não mudam a seleção de destinatários das notificações atuais: avisos operacionais continuam vinculados ao papel/vínculo responsável, e avisos pessoais ou de segurança usam os endereços correspondentes à pessoa/conta. O endereço institucional da Coordenação não recebe atualmente um fluxo próprio de notificação. O endereço institucional do Setor é contato para dúvidas e não substitui os e-mails individuais dos vínculos do Setor nos avisos operacionais. Não há fallback silencioso do campo institucional para um endereço pessoal.

O nome do documento usado no aviso é obrigatório no modal de envio, informado pelo Setor e limitado a 255 caracteres. A versão 3 de `document.signature-available` não usa o nome do template como alternativa. O campo também é exigido em novo envio de aviso; sem envio de aviso, ele não é obrigatório. O nome escolhido fica preservado no conteúdo imutável da mensagem, sem alterar o template ou o snapshot de geração.

## Consulta dos avisos operacionais pelo Setor

O Setor consulta avisos de assinatura, avaliações, liberação, conclusão, cancelamento, execução e solicitações do próprio campus, incluindo contatos externos da concedente. Novas reservas guardam o campus do processo em `scope_context`; ele não é inferido do endereço de e-mail nem do campus do supervisor. Registros anteriores sem contexto são recuperados pelas notificações tipadas e pelos processos relacionados; recibos e assinaturas sem notificação usam a autoria institucional registrada. Não há alteração retroativa de mensagem, destinatário, resultado ou reserva. O Administrador mantém seu escopo administrativo.

“Solicitar avaliação do supervisor” mantém a página do estágio, atualiza os dados e mostra um toast confirmando a solicitação e o enfileiramento do aviso. A interface não confirma entrega SMTP antes do worker.
