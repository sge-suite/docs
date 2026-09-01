---
title: SGE — Enum — EmancipationEvidenceStatus
description: Ciclo da prova privada de emancipação analisada pelo Setor de Estágio.
type: enum-reference
status: planned
domain: emancipation
tags:
  - sge/enums
  - sge/emancipacao
---
| Case | Valor | Rótulo |
| --- | --- | --- |
| `Submitted` | `submitted` | Enviada |
| `UnderReview` | `under_review` | Em análise |
| `Approved` | `approved` | Aprovada |
| `Returned` | `returned` | Devolvida |
| `Cancelled` | `cancelled` | Cancelada |

O arquivo é enviado diretamente pelo formulário do SGE e fica em mídia privada vinculada a um registro desta tabela. Uma devolução exige motivo e não reabre o binário antigo. O discente envia uma nova prova ou troca a declaração para menor de idade; o registro anterior continua preservado. `Cancelled` é usado quando o ramo emancipado deixa de ser aplicável. O arquivo nunca entra no Activity Log.
