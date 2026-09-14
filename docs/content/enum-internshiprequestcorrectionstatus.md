---
id: enum-internshiprequestcorrectionstatus
title: Enum — InternshipRequestCorrectionStatus
description: Ciclo de cada pendência devolvida na solicitação de estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/estagio, sge/pendencias
related: migration-base-04-activity-log, migration-20-internship-request-corrections
source_refs: ../../sge/app/Enums/InternshipRequestCorrectionStatus.php, ../../sge/tests/Unit/Enums/InternshipRequestCorrectionStatusTest.php
diagram: enum-correction-status
---
> [!success] Estado
> A classe e os testes unitários já existem. A integração com `InternshipRequestCorrection`, migration e fluxo de análise ainda está planejada. Este enum controla a pendência; não substitui o status da solicitação nem o [`activity_log`](doc:migration-base-04-activity-log).

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
- [ ] Adicionar cast em `InternshipRequestCorrection`.
- [ ] Usar o enum na [migration de internship_request_corrections](doc:migration-20-internship-request-corrections).
- [ ] Garantir por constraint/validação que só exista uma pendência aberta por solicitação.
- [x] Testar cases, valores, rótulos e opções.
- [ ] Testar devolução, reenvio, nova devolução, aprovação e desistência no fluxo de domínio.
