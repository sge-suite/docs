---
id: migration-20-internship-request-corrections
title: Migration 20 — internship_request_corrections
description: Pendências operacionais que direcionam a edição da solicitação de estágio.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/estagio, sge/pendencias
related: enum-internshiprequestcorrectionstatus, migration-base-04-activity-log, migration-19-internship-requests, migration-04-affiliations
source_refs:
---
> [!success] Estado
> Migration, Model, factory e validação da pendência implementados. O fluxo de correção e autorização permanece planejado.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `internship_request_id` | FK obrigatória para a solicitação devolvida. |

| `message` | orientação obrigatória e legível ao discente. |
| `affected_sections` | JSONB com códigos estáveis das seções editáveis do formulário, como `granting_party`, `supervisor`, `schedule` e `planned_start_date`. |
| `status` | [`InternshipRequestCorrectionStatus`](doc:enum-internshiprequestcorrectionstatus): aberta, respondida, resolvida ou cancelada. |
| `responded_at` / `resolved_at` | marcos temporais do reenvio do discente e da decisão do Setor. |
| timestamps | auditoria temporal. |

Uma solicitação pode ter várias correções ao longo do processo, mas somente uma deve permanecer aberta por vez. A tela de correção mostra a mensagem e libera somente as seções em `affected_sections`; as demais aparecem como resumo não editável. Ao salvar, a correção fica `respondida` e a solicitação retorna obrigatoriamente para nova análise formal do Setor de Estágio. Somente esse setor pode resolvê-la e autorizar a geração ou reemissão de documentos. Se já existir estágio, ele conserva os dados aprovados até a nova aprovação; então recebe os campos autorizados e os valores derivados recalculados.

Não há schedule para vencimento de assinatura. Se, após acompanhamento manual, o Setor decidir cancelar o documento ou pedir uma nova data, poderá mover o estágio para `PendingCorrection` e abrir esta correção manualmente. A autoria da decisão humana fica no Activity Log, sem FK redundante nesta tabela.

O [`activity_log`](doc:migration-base-04-activity-log) deve registrar a abertura, resposta, resolução e os atributos alterados. Ele é histórico de auditoria; esta tabela é a fonte de verdade sobre a pendência aberta e suas seções prioritárias.

## Checklist

- [x] Separar pendência operacional de auditoria.
- [x] Definir mensagem e seções afetadas como contrato da devolução.
- [x] Definir edição parcial, com as demais seções somente para consulta.
- [x] Definir enum, transições e responsável por encerrar a correção.
- [x] Definir que uma correção respondida sempre volta para nova análise formal do Setor de Estágio.
- [x] Criar validação no Model que impeça mais de uma correção aberta por solicitação.
- [ ] Garantir serialização da abertura concorrente na Action transacional.
- [ ] Mapear códigos de seções para os componentes da tela.
- [x] Criar migration, Model, factory e relação com a solicitação.
- [ ] Criar Policy, fluxo e testes de autorização.

## Dependências

- [internship_requests](doc:migration-19-internship-requests)
- [affiliations](doc:migration-04-affiliations)
- [activity_log](doc:migration-base-04-activity-log)
