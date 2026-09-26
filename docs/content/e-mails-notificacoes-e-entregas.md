---
id: e-mails-notificacoes-e-entregas
title: E-mails, notificações e entregas
description: Estado atual do pipeline de notificações internas, mensagens e tentativas de e-mail.
type: technical-reference
status: in-progress
visibility: public
tags: sge/planejamento, sge/email, sge/notificacoes, sge/auditoria
related: enums, migrations, dominio-e-modelo-de-dados, fluxos-principais
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/RequestEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Jobs/SendEmailDelivery.php, https://github.com/sge-suite/sge/blob/master/app/Mail/DeliveryMail.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailMessage.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailDeliveryAttempt.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryFlowTest.php
diagram: mensageria-fluxo
---
> [!abstract] Decisão de planejamento
> As Migrations 05–07 e o backend de envio em fila estão implementados. `admin:create` enfileira o convite da conta criada e avisos para um novo vínculo; a troca do e-mail da conta também avisa os endereços antigo e novo. Os testes renderizam os templates sem enviar para SMTP/Mailpit. As notificações de domínio e as telas de consulta/reenvio continuam pendentes.

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

Guarda o conteúdo de notificações operacionais e o HTML/texto completo já renderizado dos avisos de alteração do e-mail da conta: `notification_id` quando houver notificação, finalidade, assunto, texto/HTML, identificadores opcionais do template e `idempotency_key`. O conteúdo é imutável e armazenado sem cast criptografado. Destinatário e solicitante ficam na tentativa, não na mensagem. Recuperação de senha e convite inicial não criam mensagem.

### `email_delivery_attempts`

Cada linha representa uma tentativa de transporte. `recipient_email` registra o destinatário efetivo; `purpose` distingue notificação, conta criada, novo vínculo e aviso de alteração de e-mail da conta. `email_message_id` é obrigatório para notificação e aviso de alteração, e nulo para conta criada e novo vínculo. `delivery_key` é uma chave UUID estável do envio; ela permite idempotência e até três tentativas com números únicos. `requested_by_affiliation_id` registra o vínculo que solicitou o envio humano; a conta é obtida por `affiliations.user_id`. Para envio automático, o campo é nulo. A tentativa mantém número, estado `queued`, `sent` ou `failed`, provedor, identificador do provedor, marcos temporais e motivo técnico sanitizado de falha.

O Model bloqueia exclusão e mudança de uma tentativa finalizada. `RequestEmailDelivery` reserva a tentativa e despacha `SendEmailDelivery` depois do commit; o Job envia com o mailer nativo e registra o resultado. O reprocessamento explícito usa a mesma Action. Mensagens e tentativas não usam `LogsActivity`: são o histórico técnico de entrega. O acesso ao banco deve impedir alterações diretas que contornem essas regras.

## Regras por finalidade

| Finalidade | Persistência | Conteúdo |
| --- | --- | --- |
| Recuperação de senha | Nenhuma linha em `email_messages` ou `email_delivery_attempts`. | Token, URL, destinatário e corpo não são registrados nessas tabelas. |
| Conta criada com primeiro vínculo | Uma tentativa `account_created`, com `email_message_id` nulo. | Informa a criação da conta e do primeiro vínculo; leva à recuperação para solicitar a definição da senha, sem guardar corpo. |
| Novo vínculo em conta existente | Uma tentativa `new_affiliation` para cada e-mail, com `email_message_id` nulo. | Avisa o e-mail da conta e o do vínculo, deduplicando quando iguais, e leva ao login; não guarda corpo. |
| Alteração de e-mail da conta | Uma mensagem imutável e uma tentativa por endereço avisado. | A tela de Segurança reserva dois avisos na fila, para os e-mails anterior e novo, com o vínculo ativo como solicitante. O assunto, texto e HTML já renderizados incluem ambos os endereços e permanecem iguais no reenvio. |
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

As estruturas e o pipeline abaixo já existem; esta lista mostra o que está implementado e o que falta integrar. A migration de `notifications` não declara FKs porque `notifiable_type`/`notifiable_id` são polimórficos; a FK de `email_messages` depende de `notifications`; `email_delivery_attempts.requested_by_affiliation_id` depende de `affiliations`.

1. [x] Implementar os enums de finalidade e status; ambos já têm testes unitários.
2. [x] Criar a migration nativa de `notifications` pelo gerador do Laravel e adaptar `data` para `jsonb`; adicionar `Notifiable` a `Affiliation` e cobrir a relação e a Policy por testes PostgreSQL.
3. [x] Criar as migrations de mensagens e tentativas com suas FKs.
4. [x] Implementar Models, relações, validações e factories próprios de e-mail.
5. [x] Manter o envio de recuperação do Fortify fora das tabelas de mensagens e tentativas.
6. [x] Definir o convite inicial sem envio de senha; o link abre a tela de recuperação com o e-mail preenchido.
7. [x] Criar o backend comum de reserva e envio em fila, com conteúdo persistido apenas nas finalidades que o exigem.
8. [x] Configurar Jobs, timeout, reprocessamento explícito e motivo de falha sanitizado. Integração dos demais fluxos e autorização de reenvio em tela continuam pendentes.
9. [x] Cobrir os fluxos implementados, idempotência, reenvio, renderização e proteção de segredos. Os testes não entregam mensagens ao Mailpit.

## Pendência de retenção

A duração de retenção de `email_messages`, tentativas e conteúdo precisa seguir a política institucional de auditoria e LGPD. Até essa decisão, o acesso deve ser mínimo, auditado e permitido apenas a perfis administrativos autorizados; limpeza automática não deve ser implementada sem a definição formal de prazo.

Veja também [Enums](doc:enums), [Migrations](doc:migrations), [Painel de desenvolvimento](doc:painel-de-desenvolvimento), [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).
