---
title: SGE — Migration 21 — internship_cancellation_requests
description: Pedidos rastreáveis de cancelamento de estágio formalizado feitos pelo discente.
type: migration-reference
status: planned
order: 21
table: internship_cancellation_requests
tags:
  - sge/migrations
  - sge/estagio
  - sge/cancelamento
---
> [!todo] Estado
> Planejada. Aplica-se a estágio já criado; desistência anterior à formalização altera a própria `internship_request`.

## Contrato inicial

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `internship_id` | FK obrigatória para o estágio que se pretende cancelar. |
| `requested_by_affiliation_id` | FK obrigatória para o vínculo discente solicitante. |
| `reason` | texto obrigatório informado pelo discente. |
| `status` | [[SGE - Enum - InternshipCancellationRequestStatus|`InternshipCancellationRequestStatus`]]. |
| `reviewed_by_affiliation_id` / `reviewed_at` | vínculo do Setor e data da decisão, nulos até análise. |
| `decision_reason` | obrigatório na recusa; opcional na aprovação. |
| `effective_date` | nullable; data efetiva do cancelamento, quando aprovada. |
| timestamps | auditoria temporal. |

O discente pode abrir o pedido quando o estágio estiver em formalização, aguardando assinatura, com pendência, liberado, em andamento ou pausado. Não pode haver dois pedidos não finais para o mesmo estágio. A solicitação não muda o estágio automaticamente: o vínculo `InternshipOffice` analisa e decide em transação. Abertura, retirada, decisão e efeitos são auditados no `activity_log`.

## Efeitos da aprovação

- grava `effective_date` e muda o estágio para `Cancelled`;
- cancela documentos `Generated` ou `AwaitingSignature`, com motivo e autoria;
- preserva documentos já `Signed` como histórico; não os reclassifica como cancelados;
- gera um termo de rescisão versionado quando existir TCE assinado ou quando o Setor indicar necessidade; a data e justificativa vêm deste pedido;
- encerra avaliações `Draft`, `Submitted` ou `Returned` como `Cancelled`; avaliações aprovadas e notas já lançadas permanecem históricas, mas não produzem conclusão;
- preserva jornadas, pausas, snapshots, notas e logs; não calcula nota final faltante nem marca o estágio como concluído;
- notifica discente, supervisor, orientador e Setor conforme o contexto.

Estágio `Completed` não é cancelado por este fluxo. Correção administrativa posterior exige ação própria e justificativa institucional.

## Checklist

- [x] Separar desistência antes da formalização de cancelamento de estágio já criado.
- [x] Permitir pedido pelo discente antes do início e durante o andamento.
- [x] Definir o Setor de Estágio como autoridade e fechar os estados do pedido.
- [x] Definir efeitos sobre documentos gerados, assinados ou aguardando assinatura.
- [x] Definir preservação de carga horária, avaliações e notas sem conclusão.
- [ ] Criar migration, Model, Policy, notificações e testes.

## Dependências

- [[SGE - Migration - 15 - Internships|internships]]
- [[SGE - Migration - 04 - Affiliations|affiliations]]
- [[SGE - Migration - Base 04 - Activity log|activity_log]]
