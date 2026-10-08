---
id: e-mails-notificacoes-e-entregas
title: E-mails, notificações e entregas
description: Contrato atual das notificações internas, mensagens, tentativas e consulta administrativa de e-mails.
type: technical-reference
status: in-progress
visibility: public
tags: sge/planejamento, sge/email, sge/notificacoes, sge/auditoria
related: enums, migrations, dominio-e-modelo-de-dados, fluxos-principais
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/RequestEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Jobs/SendEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Mail/DeliveryMail.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailMessage.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailDeliveryAttempt.php, https://github.com/sge-suite/sge/blob/master/app/Policies/EmailDeliveryAttemptPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/EmailLogAccess.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryFlowTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailLogInterfaceTest.php
diagram: mensageria-fluxo
---
> [!abstract] Decisão de planejamento
> As Migrations 05–07, o backend de envio em fila e as telas de consulta administrativa estão implementados. O Administrador do Sistema consulta mensagens ligadas a contas e vínculos administrativos, inclusive quando o destinatário é externo. A tela mostra o conteúdo salvo e as tentativas, sem ação de reenvio. A integração de notificações operacionais nos fluxos de domínio, os escopos para outros vínculos e a política de retenção continuam pendentes.

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

Notificações de estágio, vínculo, avaliação e demais eventos operacionais serão criadas no vínculo destinatário antes de seguirem por e-mail. A caixa de notificações por vínculo já usa `Affiliation::notifications()`; `AffiliationPolicy::viewNotifications` exige que o vínculo ativo pertença à conta autenticada, e a relação não mistura caixas de vínculos diferentes. Ainda faltam as classes que criam essas notificações nos fluxos de domínio. Recuperação de senha e convite inicial não criam registros internos em `notifications`.

O schema nativo não recebe coluna de deduplicação. Para evento reexecutável, a Action precisa persistir e consultar a fonte de idempotência do domínio. `email_messages.idempotency_key` cobre a mensagem de e-mail; um aviso somente interno que exigir deduplicação durável precisa de um registro operacional próprio antes de o fluxo ser ativado.

O aviso de documento disponível para assinatura será uma exceção controlada por seleção humana: ao mover o documento para `awaiting_signature`, o Setor escolherá os interessados elegíveis. Para cada selecionado com conta, o plano prevê uma `notification` interna e uma `email_message`; para o contato externo da concedente, a modelagem de conteúdo e destinatário ainda precisa ser definida. O Model atual aceita mensagens operacionais ligadas a notificações e avisos de alteração de e-mail da conta; a seleção externa exige entidade, motivo e autorização implementados antes do envio. Não haverá caixa de texto para destinatário livre.

### `email_messages`

Guarda o conteúdo imutável já renderizado das finalidades que têm histórico próprio: notificações operacionais e avisos de conta criada, novo vínculo, alteração do e-mail da conta ou outra alteração administrativa. Inclui `notification_id` quando há notificação, finalidade, assunto, texto/HTML, identificadores opcionais do template e `idempotency_key`. O conteúdo é armazenado sem cast criptografado. Destinatário, solicitante e contexto do registro afetado ficam na tentativa. Recuperação de senha não cria mensagem nem tentativa.

### `email_delivery_attempts`

Cada linha representa uma tentativa de transporte. `recipient_email` registra o destinatário efetivo, que pode não pertencer a uma conta do SGE. `purpose` identifica a finalidade. Novos envios das finalidades administrativas têm `email_message_id` ligado ao conteúdo imutável; tentativas antigas de conta criada ou novo vínculo podem permanecer sem mensagem. `scope_context` guarda um snapshot de `user_id`, `affiliation_ids`, `affiliation_types` e `campus_ids` do registro afetado; não representa o último vínculo selecionado. `delivery_key` é uma chave UUID estável do envio; ela permite idempotência e até três tentativas com números únicos. `requested_by_affiliation_id` registra o vínculo solicitante, quando houver; para envio automático, fica nulo. A tentativa mantém número, estado `queued`, `sent` ou `failed`, provedor, identificador do provedor, marcos temporais e motivo técnico sanitizado de falha.

O Model bloqueia exclusão e mudança de uma tentativa finalizada. `RequestEmailDelivery` reserva a tentativa e despacha `SendEmailDelivery` depois do commit; o Job envia com o mailer nativo e registra o resultado. O reprocessamento explícito usa a mesma Action. Mensagens e tentativas não usam `LogsActivity`: são o histórico técnico de entrega. O acesso ao banco deve impedir alterações diretas que contornem essas regras.

## Regras por finalidade

| Finalidade | Persistência | Conteúdo |
| --- | --- | --- |
| Recuperação de senha | Nenhuma linha em `email_messages` ou `email_delivery_attempts`. | Token, URL, destinatário e corpo não são registrados nessas tabelas. |
| Conta criada com primeiro vínculo | Uma mensagem imutável e uma tentativa `account_created`. Registros antigos podem ter `email_message_id` nulo. | Informa a criação da conta e do primeiro vínculo; leva à solicitação de definição da senha sem guardar token ou URL assinada. |
| Novo vínculo em conta existente | Uma mensagem imutável e uma tentativa `new_affiliation` por endereço avisado. | Avisa o e-mail da conta e o do vínculo, deduplicando quando iguais, e leva ao login. |
| Alteração de e-mail da conta | Uma mensagem imutável e uma tentativa por endereço avisado. | A tela de Segurança reserva dois avisos, para os e-mails anterior e novo, com o vínculo ativo como solicitante. O conteúdo renderizado inclui os endereços e permanece igual em cada tentativa. |
| Alteração administrativa | Uma mensagem imutável e uma tentativa `administrative_change` por endereço avisado. | Registra conteúdo dos avisos de desativação/exclusão de vínculo e exclusão de conta; o contexto aponta para a conta ou vínculo afetado. |
| Notificação operacional | `notifications`, `email_messages` e tentativas. | Guarda assunto e conteúdo renderizado na mensagem; destinatário e transporte na tentativa. |
| Resumo interno do Setor | Apenas `notifications`. | Conteúdo interno pertinente ao vínculo. |

> [!warning] Segredos não entram no histórico
> Senhas, tokens, URLs assinadas e credenciais SMTP não devem ser persistidos em mensagens, tentativas, notificações ou Activity Log.

O e-mail de conta criada leva à tela de recuperação com o e-mail preenchido. A pessoa então solicita o link para definir a senha. Essa notificação do Fortify é enfileirada com payload cifrado, pois a fila técnica precisa transportar temporariamente o token; ela não cria histórico nas tabelas de e-mail da aplicação.

## Fluxos planejados

### Recuperação de senha

{{diagram:recuperacao-de-senha-fluxo}}

### Notificação operacional por e-mail

{{diagram:notificacao-operacional-fluxo}}

## Implementação e pendências

As estruturas e o pipeline abaixo já existem; esta lista mostra o que está implementado e o que falta integrar. A migration de `notifications` não declara FKs porque `notifiable_type`/`notifiable_id` são polimórficos; a FK de `email_messages` depende de `notifications`; as referências de `email_delivery_attempts` dependem de `affiliations`.

1. [x] Implementar os enums de finalidade e status; ambos já têm testes unitários.
2. [x] Criar a migration nativa de `notifications` pelo gerador do Laravel e adaptar `data` para `jsonb`; adicionar `Notifiable` a `Affiliation` e cobrir a relação e a Policy por testes PostgreSQL.
3. [x] Criar as migrations de mensagens e tentativas com suas FKs.
4. [x] Implementar Models, relações, validações e factories próprios de e-mail.
5. [x] Manter o envio de recuperação do Fortify fora das tabelas de mensagens e tentativas.
6. [x] Definir o convite inicial sem envio de senha; o link abre a tela de recuperação com o e-mail preenchido.
7. [x] Criar o backend comum de reserva e envio em fila, com conteúdo persistido apenas nas finalidades que o exigem.
8. [x] Configurar Jobs, timeout, reprocessamento explícito e motivo de falha sanitizado. O reprocessamento é pela Action; a interface de consulta não oferece reenvio.
9. [x] Cobrir os fluxos implementados, idempotência, reenvio, renderização e proteção de segredos. Os testes não entregam mensagens ao Mailpit.
10. [x] Disponibilizar índice e detalhes de envios para o Administrador do Sistema, revalidando o vínculo ativo e selecionado pela Policy em cada requisição.
11. [x] Filtrar por registro afetado via `scope_context`, incluindo contas e vínculos administrativos sem inferir escopo pelo destinatário ou solicitante.
12. [x] Mostrar o conteúdo persistido e as tentativas em visualização isolada; não expor segredos nem permitir reenvio na interface.
13. [ ] Definir escopos de consulta para outros tipos de vínculo e a política institucional de retenção.

## Pendência de retenção

A duração de retenção de `email_messages`, tentativas e conteúdo precisa seguir a política institucional de auditoria e LGPD. Até essa decisão, o acesso deve ser mínimo, auditado e permitido apenas a perfis administrativos autorizados; limpeza automática não deve ser implementada sem a definição formal de prazo.

Veja também [Enums](doc:enums), [Migrations](doc:migrations), [Painel de desenvolvimento](doc:painel-de-desenvolvimento), [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).
