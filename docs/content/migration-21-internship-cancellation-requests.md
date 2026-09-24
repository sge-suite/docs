---
id: migration-21-internship-cancellation-requests
title: Migration 21 — internship_cancellation_requests
description: Pedidos rastreáveis de cancelamento de estágio formalizado feitos pelo discente.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/estagio, sge/cancelamento
related: enum-internshipcancellationrequeststatus, migration-15-internships, migration-04-affiliations, migration-base-04-activity-log
source_refs:
---
> [!success] Estado
> Migration, Model, factory, relação e regras dos estados do pedido implementados. Os efeitos transacionais da aprovação permanecem no fluxo funcional.

## Contrato inicial

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `internship_id` | FK obrigatória para o estágio que se pretende cancelar. |

| `reason` | texto obrigatório informado pelo discente. |
| `status` | [`InternshipCancellationRequestStatus`](doc:enum-internshipcancellationrequeststatus). |
| `reviewed_at` | data da decisão, nula até análise; a autoria fica no Activity Log. |
| `decision_reason` | obrigatório na recusa; opcional na aprovação. |
| `effective_date` | nullable; data efetiva do cancelamento, quando aprovada. |
| timestamps | auditoria temporal. |

O discente pode abrir o pedido quando o estágio estiver em formalização, aguardando assinatura, com pendência, liberado, em andamento ou pausado. Não pode haver dois pedidos não finais para o mesmo estágio. A solicitação não muda o estágio automaticamente: o vínculo `InternshipOffice` analisa e decide em transação. Abertura, retirada e decisão são auditadas no `activity_log`, que registra o autor sem duplicar FKs na tabela. Os efeitos serão auditados no fluxo.

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
- [x] Criar migration, Model, factory e relação com estágio.
- [x] Validar no Model os estados, motivos, datas e ausência de outro pedido em análise.
- [ ] Criar Policy, efeitos transacionais, notificações e testes do fluxo.

## Dependências

- [internships](doc:migration-15-internships)
- [affiliations](doc:migration-04-affiliations)
- [activity_log](doc:migration-base-04-activity-log)
