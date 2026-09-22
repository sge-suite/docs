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
| `notifiable_type` / `notifiable_id` | morph              | `Affiliation` para operação; `User` para recuperação de senha e e-mail inicial. |
| `type`                              | string             | Classe/tipo estável da notificação.                                        |
| `data`                              | jsonb              | JSON convertido pelo cast nativo `array`, com título, texto interno, rota/entidade e metadados não sensíveis. |
| `read_at`                           | timestamp nullable | Leitura no SGE; não representa leitura do e-mail.                          |
| `created_at` / `updated_at`         | timestamp          | Auditoria temporal.                                                        |

Notificações de estágio, vínculo, avaliação e demais eventos operacionais devem nascer no vínculo destinatário antes de serem encaminhadas ao e-mail. A notificação destinada apenas ao Setor de Estágio permanece interna no vínculo. Recuperação de senha e e-mail inicial pertencem à conta. A implementação atual adiciona `Notifiable` a `Affiliation`; `AffiliationPolicy::viewNotifications` valida que o vínculo está ativo e pertence à conta autenticada. Cada consulta usa a relação polimórfica desse vínculo, sem misturar caixas de vínculos diferentes da mesma conta. As futuras Notifications devem implementar `toDatabase()` e `databaseType()`.

O schema nativo não recebe coluna de deduplicação. Para evento reexecutável, a Action precisa persistir e consultar a fonte de idempotência do domínio. `email_messages.idempotency_key` cobre a mensagem de e-mail; um aviso somente interno que exigir deduplicação durável precisa de um registro operacional próprio antes de o fluxo ser ativado.

O aviso de documento disponível para assinatura será uma exceção controlada por seleção humana: ao mover o documento para `awaiting_signature`, o Setor escolherá os interessados elegíveis. Para cada selecionado com conta, será criada `notification` interna e `email_message`; para o contato externo da concedente, quando selecionado e sem conta, será criada somente `email_message`, com `notification_id`, `user_id` e `affiliation_id` nulos. O Model atual rejeita esse destinatário externo até que a entidade, o motivo e a autorização da seleção tenham implementação. Não haverá caixa de texto para destinatário livre.

### `email_messages`

Representa uma mensagem preparada, com destinatário e conteúdo congelados no instante da geração. É a fonte de consulta do que seria enviado; não é uma tentativa de transporte.

| Campo                               | Tipo conceitual | Finalidade                                                                         |
| ----------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `id`                                | uuid            | Identificador da mensagem.                                                         |
| `notification_id`                   | uuid nullable   | FK para `notifications` quando o e-mail deriva de um aviso interno.                |
| `user_id`                           | bigint nullable | Conta destinatária da recuperação de senha ou do aviso de novo vínculo.             |
| `affiliation_id`                    | bigint nullable | Vínculo destinatário do e-mail operacional.                                        |
| `purpose`                           | enum            | Finalidade estável, como `password_reset`, `notification` ou `new_affiliation`. |
| `recipient_email`                   | text            | Snapshot criptografado do endereço efetivamente escolhido.                        |
| `subject`                           | text nullable   | Assunto final criptografado, quando não expuser segredo.                           |
| `content_text` / `content_html`     | text nullable   | Snapshot do conteúdo renderizado, nos casos permitidos.                            |
| `template_key` / `template_version` | string nullable | Identificação do template utilizado.                                               |
| `idempotency_key`                   | uuid unique     | Evita que a mesma solicitação gere mensagens duplicadas.                           |
| `created_at` / `updated_at`         | timestamp       | Rastreabilidade.                                                                   |

Para e-mails de notificação, `content_text` e `content_html` guardam o conteúdo final renderizado. O Model criptografa conteúdo, assunto e endereço, oculta esses campos na serialização e impede atualizar o snapshot. `template_key` e `template_version` devem permanecer identificadores seguros, sem dados pessoais. Alterações posteriores de template, usuário ou vínculo não alteram a mensagem já gravada.

No futuro fluxo de novo vínculo, a mensagem de conta usará `new_affiliation` e o snapshot de `users.email`. Quando `affiliations.email` for diferente, o mesmo evento preparará outra mensagem, `notification`, para o vínculo. Cada endereço distinto terá sua própria mensagem, chave de idempotência e tentativas. Se os endereços coincidirem, haverá uma única `new_affiliation`. O Model exige conteúdo persistido nulo para mensagens de conta; o corpo e eventuais dados de acesso deverão ser gerados com segurança somente no envio à conta. O e-mail do vínculo receberá apenas informação operacional segura.

### `email_delivery_attempts`

Cada registro representa uma tentativa real de envio de uma `email_message`; reprocessar ou reenviar cria outra linha. O conteúdo não é duplicado aqui.

| Campo                                 | Tipo conceitual    | Finalidade                                                   |
| ------------------------------------- | ------------------ | ------------------------------------------------------------ |
| `id`                                  | uuid               | Identificador da tentativa.                                  |
| `email_message_id`                    | uuid               | FK para a mensagem.                                          |
| `attempt_number`                      | smallint           | Sequência por mensagem.                                      |
| `status`                              | enum               | `queued`, `sent` ou `failed`.                                |
| `provider`                            | string nullable    | Provedor/transport utilizado, inicialmente SMTP configurado. |
| `provider_message_id`                 | text nullable      | Identificador criptografado retornado pelo provedor.          |
| `queued_at` / `sent_at` / `failed_at` | timestamp nullable | Marcos temporais do processamento.                           |
| `failure_reason`                      | string(120) nullable | Código técnico sanitizado; nunca exceção bruta.            |
| `created_at` / `updated_at`           | timestamp          | Auditoria temporal.                                          |

O futuro Job deverá reservar a tentativa antes de chamar o transportador. Só poderá definir `sent_at` e `status = sent` depois da aceitação pelo SMTP. O Model já valida `queued → sent` e `queued → failed`, os marcos de cada estado e a imutabilidade dos estados finais. Não existe `sending`. A chave única de mensagem e a restrição (`email_message_id`, `attempt_number`) protegem contra duplicidade; a reserva concorrente e a autorização de reenvio ainda não estão implementadas.

## Regras por finalidade

| Finalidade                     | Destinatário                                    | Registros obrigatórios                                         | Conteúdo persistido                                                                                                    |
| ------------------------------ | ----------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Recuperação de senha           | `users.email`                                   | `email_messages` e ao menos uma `email_delivery_attempt`       | Não guardar URL, token nem corpo que os contenha. Registrar finalidade, destinatário, template e resultado da entrega. |
| Notificação operacional a usuário | `affiliations.email`, conforme o vínculo     | notificação no vínculo, `email_messages` e tentativas           | Guardar assunto e versões texto/HTML renderizadas, protegidas e imutáveis.                                             |
| Aviso externo de assinatura    | e-mail cadastrado da concedente, quando selecionado | `email_messages` e tentativas; sem notificação interna      | Guardar o local informado, documento e conteúdo renderizado; não criar destinatário livre.                            |
| Resumo do Setor de Estágio     | somente notificação interna do vínculo do Setor | `notifications`; sem `email_messages`                          | Guardar contagens e links filtrados do resumo diário, sem listar dados sensíveis.                                      |
| Aviso de novo vínculo          | `users.email` e `affiliations.email` quando distintos | notificações conforme o destinatário, uma `email_message` por endereço distinto e tentativas | Conta: `new_affiliation`; vínculo: `notification`. Endereços iguais geram um só envio. Conteúdo de acesso inicial fica restrito ao e-mail da conta. |

> [!warning] Segredos não entram no log
> Tokens de redefinição, URLs assinadas, senhas e credenciais SMTP nunca podem ser registrados em conteúdo, `data`, exceções ou Activity Log. O requisito de preservar conteúdo aplica-se às notificações operacionais; mensagens de autenticação registram somente conteúdo/metadados seguros e a prova da entrega. Não haverá confirmação adicional de endereço de e-mail.

## Fluxos planejados

### Recuperação de senha

{{diagram:recuperacao-de-senha-fluxo}}

### Notificação operacional por e-mail

{{diagram:notificacao-operacional-fluxo}}

## Ordem de implementação futura

O planejamento acima deve ser mantido antes das demais funcionalidades. A migration de `notifications` não declara FKs porque `notifiable_type`/`notifiable_id` são polimórficos; ela foi posicionada após `users` e `affiliations`. As FKs futuras de `email_messages` dependem de `notifications`, `users` e `affiliations`.

1. [x] Implementar os enums de finalidade e status; ambos já têm testes unitários.
2. [x] Criar a migration nativa de `notifications` pelo gerador do Laravel e adaptar `data` para `jsonb`; adicionar `Notifiable` a `Affiliation` e cobrir a relação e a Policy por testes PostgreSQL.
3. [x] Criar as migrations de mensagens e tentativas com suas FKs.
4. [x] Implementar Models, casts protegidos, relações e factories próprios de e-mail.
5. Integrar o envio de recuperação do Fortify ao log seguro.
6. Definir o fluxo seguro de senha inicial sem confirmação adicional de endereço de e-mail.
7. Criar a base comum que grava Notifications nativas, mensagens e tentativas para eventos de domínio.
8. Configurar Jobs, limite de taxa, reprocessamento, alertas de falha e autorização de reenvio.
9. Cobrir fluxos, idempotência, reenvio e proteção de segredos com testes.

## Pendência de retenção

A duração de retenção de `email_messages`, tentativas e conteúdo precisa seguir a política institucional de auditoria e LGPD. Até essa decisão, o acesso deve ser mínimo, auditado e permitido apenas a perfis administrativos autorizados; limpeza automática não deve ser implementada sem a definição formal de prazo.

Veja também [Enums](doc:enums), [Migrations](doc:migrations), [Painel de desenvolvimento](doc:painel-de-desenvolvimento), [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).
