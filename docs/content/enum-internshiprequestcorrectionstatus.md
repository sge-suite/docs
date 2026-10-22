---
id: enum-internshiprequestcorrectionstatus
title: Enum — InternshipRequestCorrectionStatus
description: Ciclo de cada pendência devolvida na solicitação de estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/estagio, sge/pendencias
related: migration-base-04-activity-log, migration-20-internship-request-corrections
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/InternshipRequestCorrectionStatus.php
diagram: enum-correction-status
---
> [!success] Estado
> A classe, o cast em `InternshipRequestCorrection`, a Migration 20 e o fluxo de análise por seção estão implementados. A Action serializa as decisões pelo bloqueio da solicitação e o Model impede mais de uma correção `Open`; não há constraint única no banco. Este enum controla a pendência; não substitui o status da solicitação nem o [`activity_log`](doc:migration-base-04-activity-log). A validação funcional fica para a preparação para produção.

## Contrato

| Case | Valor persistido | Rótulo | Efeito |
| --- | --- | --- | --- |
| `Open` | `open` | Aberta | O discente pode editar exclusivamente as seções indicadas. |
| `Responded` | `responded` | Respondida | O discente reenviou; a solicitação voltou à fila de análise. |
| `Resolved` | `resolved` | Resolvida | O Setor aprovou os dados corrigidos e aplicou o resultado ao estágio quando houver. |
| `Cancelled` | `cancelled` | Cancelada | A pendência perdeu objeto, por desistência ou encerramento do processo. |

## Transições

{{diagram:enum-correction-status}}

Somente uma correção em `Open` pode existir por solicitação. Uma correção `Responded` permanece no histórico enquanto o Setor analisa; se ele devolver outra pendência, encerra a anterior conforme a decisão e abre uma nova, com sua própria mensagem e seções afetadas.

## Checklist de implementação

- [x] Criar enum string, rótulos, `options()` e `values()`.
- [x] Adicionar cast em `InternshipRequestCorrection`.
- [x] Usar o valor inicial do enum na [migration de internship_request_corrections](doc:migration-20-internship-request-corrections).
- [x] Validar que só exista uma pendência aberta por solicitação e serializar as decisões pela solicitação; não há constraint única no banco.
- [ ] Testar cases, valores, rótulos e opções.
- [ ] Testar devolução, reenvio, nova devolução, aprovação e desistência no fluxo de domínio.
