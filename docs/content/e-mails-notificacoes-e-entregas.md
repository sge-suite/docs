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
> A base nativa de notificações internas da Migration 05 está implementada. Este plano continua definindo as etapas futuras de mensagens de e-mail e tentativas de entrega; não implica que esses fluxos estejam implementados.

## Objetivo e limites

O SGE terá uma trilha separada para a notificação exibida no sistema, a mensagem de e-mail gerada e as tentativas de enviá-la. Assim, reenvios e falhas não sobrescrevem o histórico nem fazem uma notificação parecer enviada quando o provedor recusou a mensagem.

O termo **enviado** neste plano significa que o provedor SMTP aceitou a mensagem. Confirmação de abertura ou leitura do e-mail não faz parte do escopo inicial. A leitura da notificação interna continua independente, controlada exclusivamente por `read_at`.

{{diagram:mensageria-fluxo}}

## Estruturas planejadas

### `notifications`

Usará a tabela nativa plural do Laravel, com `data` em `jsonb`. Cada linha representa uma notificação destinada a uma conta ou a um vínculo dentro do sistema.

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

O aviso de documento disponível para assinatura é uma exceção controlada por seleção humana: ao mover o documento para `awaiting_signature`, o Setor escolhe os interessados elegíveis. Para cada selecionado com conta, cria-se `notification` interna e `email_message`; para o contato externo da concedente, quando selecionado e sem conta, cria-se somente `email_message`, com `notification_id`, `user_id` e `affiliation_id` nulos. Não há caixa de texto para destinatário livre. O conteúdo usa o local de disponibilização informado pelo Setor e não pressupõe uma plataforma específica.

### `email_messages`

Representa uma mensagem preparada, com destinatário e conteúdo congelados no instante da geração. É a fonte de consulta do que seria enviado; não é uma tentativa de transporte.

| Campo                               | Tipo conceitual | Finalidade                                                                         |
| ----------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `id`                                | uuid            | Identificador da mensagem.                                                         |
| `notification_id`                   | uuid nullable   | FK para `notifications` quando o e-mail deriva de um aviso interno.                |
| `user_id`                           | bigint nullable | Conta destinatária da recuperação de senha ou do aviso de novo vínculo.             |
| `affiliation_id`                    | bigint nullable | Vínculo destinatário do e-mail operacional.                                        |
| `purpose`                           | enum            | Finalidade estável, como `password_reset`, `notification` ou `new_affiliation`. |
| `recipient_email`                   | string          | Snapshot do endereço efetivamente escolhido.                                       |
| `subject`                           | string nullable | Assunto final, quando não expuser segredo.                                         |
| `content_text` / `content_html`     | text nullable   | Snapshot do conteúdo renderizado, nos casos permitidos.                            |
| `template_key` / `template_version` | string nullable | Identificação do template utilizado.                                               |
| `idempotency_key`                   | uuid unique     | Evita que a mesma solicitação gere mensagens duplicadas.                           |
| `created_at` / `updated_at`         | timestamp       | Rastreabilidade.                                                                   |

Para e-mails de notificação, `content_text` e `content_html` devem guardar o conteúdo final renderizado. Eles, o endereço e os metadados deverão receber proteção compatível com dados pessoais (por exemplo, cast criptografado no modelo e autorização restrita de consulta). Uma alteração posterior de template, usuário ou vínculo não poderá alterar esse snapshot.

No aviso de novo vínculo, a mensagem de conta usa a finalidade `new_affiliation` e o snapshot de `users.email`. Quando `affiliations.email` é diferente, o mesmo evento prepara outra mensagem, de finalidade `notification`, para o vínculo. Cada endereço distinto tem sua própria mensagem, chave de idempotência e tentativas de entrega. Se os endereços coincidirem, prepara-se uma única mensagem `new_affiliation`, que também informa o vínculo. Dados ou links de acesso inicial são destinados somente ao e-mail da conta e nunca persistidos no conteúdo ou nos logs; o e-mail do vínculo recebe apenas informação operacional segura.

### `email_delivery_attempts`

Cada registro representa uma tentativa real de envio de uma `email_message`; reprocessar ou reenviar cria outra linha. O conteúdo não é duplicado aqui.

| Campo                                 | Tipo conceitual    | Finalidade                                                   |
| ------------------------------------- | ------------------ | ------------------------------------------------------------ |
| `id`                                  | uuid               | Identificador da tentativa.                                  |
| `email_message_id`                    | uuid               | FK para a mensagem.                                          |
| `attempt_number`                      | smallint           | Sequência por mensagem.                                      |
| `status`                              | enum               | `queued`, `sent` ou `failed`.                                |
| `provider`                            | string nullable    | Provedor/transport utilizado, inicialmente SMTP configurado. |
| `provider_message_id`                 | string nullable    | Identificador retornado pelo provedor, se disponível.        |
| `queued_at` / `sent_at` / `failed_at` | timestamp nullable | Marcos temporais do processamento.                           |
| `failure_reason`                      | text nullable      | Erro técnico sanitizado; nunca credenciais ou tokens.        |
| `created_at` / `updated_at`           | timestamp          | Auditoria temporal.                                          |

O Job cria ou reserva a tentativa antes de chamar o transportador. Só define `sent_at` e `status = sent` depois da aceitação pelo SMTP; exceções, recusas e esgotamento de tentativas ficam como `failed` e podem originar um reenvio autorizado. Não existe o status intermediário `sending`. O `idempotency_key` e uma restrição única em (`email_message_id`, `attempt_number`) impedem duplicidade acidental.

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
3. Criar as migrations de mensagens e tentativas com suas FKs.
4. Implementar Models, casts protegidos, relações e factories próprios de e-mail.
5. Integrar o envio de recuperação do Fortify ao log seguro.
6. Definir o fluxo seguro de senha inicial sem confirmação adicional de endereço de e-mail.
7. Criar a base comum que grava Notifications nativas, mensagens e tentativas para eventos de domínio.
8. Configurar Jobs, limite de taxa, reprocessamento, alertas de falha e autorização de reenvio.
9. Cobrir fluxos, idempotência, reenvio e proteção de segredos com testes.

## Pendência de retenção

A duração de retenção de `email_messages`, tentativas e conteúdo precisa seguir a política institucional de auditoria e LGPD. Até essa decisão, o acesso deve ser mínimo, auditado e permitido apenas a perfis administrativos autorizados; limpeza automática não deve ser implementada sem a definição formal de prazo.

Veja também [Enums](doc:enums), [Migrations](doc:migrations), [Painel de desenvolvimento](doc:painel-de-desenvolvimento), [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).
