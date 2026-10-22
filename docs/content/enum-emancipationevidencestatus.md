---
id: enum-emancipationevidencestatus
title: Enum — EmancipationEvidenceStatus
description: Ciclo da prova privada de emancipação analisada pelo Setor de Estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/emancipacao
related: migration-19a-emancipation-evidences
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/EmancipationEvidenceStatus.php
---
> [!success] Estado
> A classe está integrada ao Model e ao fluxo privado de envio e análise. `EmancipationEvidencePolicy` limita consulta ao Discente proprietário e ao Setor autorizado; a Action de revisão implementa aprovação e devolução com justificativa. A validação funcional fica para a preparação para produção.

| Case | Valor | Rótulo |
| --- | --- | --- |
| `Submitted` | `submitted` | Enviada |
| `UnderReview` | `under_review` | Em análise |
| `Approved` | `approved` | Aprovada |
| `Returned` | `returned` | Devolvida |
| `Cancelled` | `cancelled` | Cancelada |

O arquivo é enviado diretamente pelo formulário do SGE e fica em mídia privada vinculada a um registro desta tabela. Uma devolução exige motivo e não reabre o binário antigo. O discente envia uma nova prova ou troca a declaração para menor de idade; o registro anterior continua preservado. `Cancelled` é usado quando o ramo emancipado deixa de ser aplicável. O arquivo nunca entra no Activity Log.

## Checklist

- [x] Criar enum, rótulos, `values()` e `options()`.
- [ ] Cobrir cases, valores, rótulos e opções com teste unitário.
- [x] Adicionar cast no Model.
- [ ] Implementar guardas de transição e autorização da mídia.
- [ ] Testar envio, devolução, nova evidência, aprovação e cancelamento no fluxo de domínio.
