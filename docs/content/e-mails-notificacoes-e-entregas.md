---
id: e-mails-notificacoes-e-entregas
title: E-mails, notificações e entregas
description: Contrato planejado para notificações internas, mensagens de e-mail e tentativas de entrega.
type: technical-plan
status: defined
visibility: public
tags: sge/planejamento, sge/email, sge/notificacoes, sge/auditoria
related: enums, migrations, dominio-e-modelo-de-dados, fluxos-principais
source_refs:
diagram: mensageria-fluxo
---
> [!abstract] Decisão de planejamento
> A persistência das Migrations 05–07 está implementada: notificações internas, mensagens preparadas e tentativas de entrega. A geração automática, o transporte SMTP, o reenvio e as telas continuam planejados.

## Objetivo e limites

O SGE terá uma trilha separada para a notificação exibida no sistema, a mensagem de e-mail gerada e as tentativas de enviá-la. Assim, reenvios e falhas não sobrescrevem o histórico nem fazem uma notificação parecer enviada quando o provedor recusou a mensagem.

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

Notificações de estágio, vínculo, avaliação e demais eventos operacionais devem nascer no vínculo destinatário antes de serem encaminhadas ao e-mail. A notificação destinada apenas ao Setor de Estágio permanece interna no vínculo. Recuperação de senha e convite inicial não criam notificação interna nesse fluxo. A implementação atual adiciona `Notifiable` a `Affiliation`; `AffiliationPolicy::viewNotifications` valida que o vínculo está ativo e pertence à conta autenticada. Cada consulta usa a relação polimórfica desse vínculo, sem misturar caixas de vínculos diferentes da mesma conta. As futuras Notifications devem implementar `toDatabase()` e `databaseType()`.

O schema nativo não recebe coluna de deduplicação. Para evento reexecutável, a Action precisa persistir e consultar a fonte de idempotência do domínio. `email_messages.idempotency_key` cobre a mensagem de e-mail; um aviso somente interno que exigir deduplicação durável precisa de um registro operacional próprio antes de o fluxo ser ativado.

O aviso de documento disponível para assinatura será uma exceção controlada por seleção humana: ao mover o documento para `awaiting_signature`, o Setor escolherá os interessados elegíveis. Para cada selecionado com conta, o plano prevê uma `notification` interna e uma `email_message`; para o contato externo da concedente, a modelagem de conteúdo e destinatário ainda precisa ser definida. O Model atual só aceita mensagem ligada a notificação interna; a seleção externa exige entidade, motivo e autorização implementados antes do envio. Não haverá caixa de texto para destinatário livre.

### `email_messages`

Guarda apenas o conteúdo renderizado de notificações operacionais: `notification_id`, `purpose = notification`, assunto, texto/HTML, identificadores opcionais do template e `idempotency_key`. O conteúdo é imutável e armazenado sem cast criptografado. Destinatário e solicitante ficam na tentativa, não na mensagem. Recuperação de senha e convite inicial não criam mensagem.

### `email_delivery_attempts`

Cada linha representa uma tentativa de transporte. `recipient_email` registra o destinatário efetivo; `purpose` distingue notificação de convite inicial. `email_message_id` é obrigatório para notificação e nulo para convite. `requested_by_affiliation_id` registra o vínculo que solicitou o envio humano; a conta é obtida por `affiliations.user_id`. Para envio automático, o campo é nulo. A tentativa mantém número, estado `queued`, `sent` ou `failed`, provedor, identificador do provedor, marcos temporais e motivo técnico sanitizado de falha.

O Model bloqueia exclusão e mudança de uma tentativa finalizada. A reserva segura de número, o transporte e o reenvio ainda serão implementados na Fase 04. Mensagens e tentativas não usam `LogsActivity`: são o histórico técnico de entrega. O acesso ao banco deve impedir alterações diretas que contornem essas regras.

## Regras por finalidade

| Finalidade | Persistência | Conteúdo |
| --- | --- | --- |
| Recuperação de senha | Nenhuma linha em `email_messages` ou `email_delivery_attempts`. | Token, URL, destinatário e corpo não são registrados nessas tabelas. |
| Convite inicial de conta | Uma `email_delivery_attempt`, com `email_message_id` nulo. | Guarda destinatário, finalidade, solicitante e resultado; não guarda corpo. |
| Notificação operacional | `notifications`, `email_messages` e tentativas. | Guarda assunto e conteúdo renderizado na mensagem; destinatário e transporte na tentativa. |
| Resumo interno do Setor | Apenas `notifications`. | Conteúdo interno pertinente ao vínculo. |

> [!warning] Segredos não entram no histórico
> Senhas, tokens, URLs assinadas e credenciais SMTP não devem ser persistidos em mensagens, tentativas, notificações ou Activity Log.

O futuro convite inicial poderá levar à tela de recuperação de senha com o e-mail preenchido. A pessoa então solicita o link de redefinição. Essa navegação ainda não foi implementada.

## Fluxos planejados

### Recuperação de senha

{{diagram:recuperacao-de-senha-fluxo}}

### Notificação operacional por e-mail

{{diagram:notificacao-operacional-fluxo}}

## Ordem de implementação futura

O planejamento acima deve ser mantido antes das demais funcionalidades. A migration de `notifications` não declara FKs porque `notifiable_type`/`notifiable_id` são polimórficos; ela foi posicionada após `users` e `affiliations`. A FK de `email_messages` depende de `notifications`; `email_delivery_attempts.requested_by_affiliation_id` depende de `affiliations`.

1. [x] Implementar os enums de finalidade e status; ambos já têm testes unitários.
2. [x] Criar a migration nativa de `notifications` pelo gerador do Laravel e adaptar `data` para `jsonb`; adicionar `Notifiable` a `Affiliation` e cobrir a relação e a Policy por testes PostgreSQL.
3. [x] Criar as migrations de mensagens e tentativas com suas FKs.
4. [x] Implementar Models, relações, validações e factories próprios de e-mail.
5. Manter o envio de recuperação do Fortify fora das tabelas de mensagens e tentativas.
6. Definir o fluxo seguro de senha inicial sem confirmação adicional de endereço de e-mail.
7. Criar a base comum que grava Notifications nativas, mensagens e tentativas para eventos de domínio.
8. Configurar Jobs, limite de taxa, reprocessamento, alertas de falha e autorização de reenvio.
9. Cobrir fluxos, idempotência, reenvio e proteção de segredos com testes.

## Pendência de retenção

A duração de retenção de `email_messages`, tentativas e conteúdo precisa seguir a política institucional de auditoria e LGPD. Até essa decisão, o acesso deve ser mínimo, auditado e permitido apenas a perfis administrativos autorizados; limpeza automática não deve ser implementada sem a definição formal de prazo.

Veja também [Enums](doc:enums), [Migrations](doc:migrations), [Painel de desenvolvimento](doc:painel-de-desenvolvimento), [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).
