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
> Migration, Model, factory e validação da pendência implementados. O fluxo de correção e autorização está implementado, conforme a atualização ao final desta página.

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
- [x] Garantir serialização da abertura concorrente na Action transacional.
- [x] Mapear códigos de seções para os componentes da tela.
- [x] Criar migration, Model, factory e relação com a solicitação.
- [ ] Criar Policy, fluxo e testes de autorização.

## Dependências

- [internship_requests](doc:migration-19-internship-requests)
- [affiliations](doc:migration-04-affiliations)
- [activity_log](doc:migration-base-04-activity-log)

## Edição orientada implementada — 16/10/2026

A abertura de correção é serializada pelo bloqueio da solicitação em `ReviewInternshipRequest`. Os códigos aceitos são `personal_data`, `internship`, `granting_party`, `supervisor`, `activities`, `schedule`, `planned_start_date`, `legal_capacity` e `remuneration`. A interface marca os grupos liberados; as Actions recusam alterações de outros grupos, inclusive por chamadas forjadas.

**Salvar mantém a correção Open** e preserva o preenchimento; somente o **reenvio explícito**, com ciência e validação completa, marca Responded e devolve a solicitação para Submitted. Isso substitui a expressão anterior “ao salvar” quando usada com sentido de reenvio. O Setor resolve apenas na nova aprovação. O estágio já existente conserva os dados aprovados enquanto se corrige a solicitação; no novo aceite recebe somente campos autorizados e derivados. Documentos anteriores não são sobrescritos; sua geração/reemissão permanece integração posterior.

A devolução manual antes da liberação também atende AwaitingSignatures: documentos Generated/AwaitingSignature são cancelados com o motivo, mantendo seus snapshots e os documentos Signed como histórico. O novo aceite volta a PendingFormalization e exige nova geração documental pela integração posterior.
