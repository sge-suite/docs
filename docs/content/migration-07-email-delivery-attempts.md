---
id: migration-07-email-delivery-attempts
title: Migration 07 — email_delivery_attempts
description: Histórico append-only das tentativas de transporte de e-mails.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/email, sge/auditoria
related: migration-06-email-messages, enum-emaildeliveryattemptstatus
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_160858_create_email_delivery_attempts_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/EmailDeliveryAttempt.php, https://github.com/sge-suite/sge/blob/master/app/Policies/EmailDeliveryAttemptPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/EmailLogAccess.php, https://github.com/sge-suite/sge/blob/master/database/factories/EmailDeliveryAttemptFactory.php
---
> [!success] Estado
> Migration, Model, factory, backend em fila e histórico de consulta implementados. O detalhe permite solicitar nova tentativa elegível mediante autorização específica. A validação operacional de concorrência e SMTP permanece pendente.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | `bigint` autoincremental, chave primária. |
| `email_message_id` | `bigint` nullable, FK para o conteúdo da mensagem. Obrigatório nos novos envios de todas as finalidades registradas; pode ser nulo em tentativas antigas de conta criada ou novo vínculo. |
| `delivery_key` | UUID estável do envio, com sequência única por chave. |
| `purpose` | `Notification`, `AccountCreated`, `NewAffiliation`, `AccountEmailChanged` ou `AdministrativeChange`. |
| `recipient_email` | Destinatário efetivo do envio. |
| `requested_by_affiliation_id` | FK nullable para o vínculo que solicitou o envio. A conta é `affiliations.user_id`; nulo identifica envio automático. |
| `attempt_number` | Sequência de 1 a 3 por `delivery_key`. |
| `status` | `queued`, `sent` ou `failed`. |
| `provider` / `provider_message_id` | Provedor e identificador devolvido pelo transporte, opcionais. |
| `queued_at` / `sent_at` / `failed_at` | Marcos temporais opcionais. |
| `failure_reason` | Código técnico sanitizado, sem exceção bruta. |
| `scope_context` | JSONB nullable com snapshot de `user_id`, `affiliation_ids`, `affiliation_types` e `campus_ids` relacionados ao registro afetado. Não identifica o destinatário nem o vínculo solicitante. |
| timestamps | Criação e atualização. |

O Model captura o vínculo ativo do `CauserResolver` no momento da criação; solicitações humanas sem vínculo válido são rejeitadas. O `scope_context` é um snapshot imutável do registro associado e permanece após a exclusão dessa conta ou vínculo. `requested_by_affiliation_id` responde quem iniciou o envio; `scope_context` responde sobre qual registro ele foi feito. Esses campos não são intercambiáveis. Na reserva original, o destinatário da notificação deve corresponder à entidade notificada. Uma tentativa subsequente preserva exatamente mensagem, finalidade, destinatário e contexto da primeira e da imediatamente anterior, mesmo quando o e-mail atual mudou; o Model confere essa identidade, a numeração seguinte e a falha elegível anterior. As transições permitidas são `queued → sent` e `queued → failed`. Identidade e tentativa finalizada são imutáveis; exclusão via Model é bloqueada. Não há `LogsActivity` nessas tabelas, pois elas são o próprio histórico técnico do envio.

A restrição única (`delivery_key`, `attempt_number`) cobre também convites, que não têm `email_message_id`. A restrição por mensagem também permanece. `RequestEmailDelivery` reutiliza tentativas com a mesma chave e rejeita dados incompatíveis. `SendEmailDelivery` recebe o ID da tentativa, preservando a autoria registrada na reserva; envio automático tem solicitante nulo. A tentativa é bloqueada durante o envio para impedir que dois workers enviem simultaneamente a mesma linha.

`delivery_key` e `scope_context` pertencem à migration original de criação da tabela; não há migration adicional para o contexto. Novos envios das finalidades administrativas (`account_created`, `new_affiliation`, `account_email_changed`, `administrative_change`) guardam o conteúdo em `email_messages` e referenciam o snapshot correspondente; tentativas antigas de conta criada ou novo vínculo podem não ter mensagem. O contexto da tentativa determina o escopo administrativo mesmo quando o destinatário é um contato externo ou a conta/vínculo já foi removido. Uma repetição para a mesma entrega preserva mensagem e contexto.

## Consulta administrativa

A `EmailDeliveryAttemptPolicy` autoriza a consulta pelo vínculo ativo selecionado: Administrador no escopo administrativo e Setor no escopo administrativo/operacional do campus. Não usa endereço de destinatário nem `requested_by_affiliation_id` como substitutos do contexto do registro. O índice reúne cada envio pela tentativa mais recente; os detalhes mostram todas as tentativas e o conteúdo da tentativa acessada. Campus desativado mantém a consulta histórica.

A ability `retry` exige, adicionalmente, campus ativo para o Setor; não concede ação a outros tipos de vínculo. `RequestEmailDelivery::retry` recebe o ator, vínculo original da tela e ID da última tentativa confirmada. Revalida autorização na transação, bloqueia a sequência e só reserva outra tentativa se a identidade confirmada ainda for a mais recente, estiver `failed`, abaixo de três tentativas totais e possuir snapshot utilizável da mesma finalidade. Confirmação antiga devolve a tentativa existente sem novo despacho. As constraints únicas permanecem. A nova autoria é capturada por `CauserResolver`; anteriores não são modificadas. Registros antigos sem conteúdo não podem ser repetidos. O modal alerta sobre possível entrega duplicada após resultado SMTP incerto. Veja o [contrato completo](doc:e-mails-notificacoes-e-entregas#nova-tentativa-de-transporte-29-10-2026).

## Limites
