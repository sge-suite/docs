---
id: enum-internshipcancellationrequeststatus
title: Enum — InternshipCancellationRequestStatus
description: Ciclo do pedido de cancelamento de estágio formalizado.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/cancelamento
related: migration-21-internship-cancellation-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/InternshipCancellationRequestStatus.php
---
> [!success] Estado
> A classe existe em `app/Enums/InternshipCancellationRequestStatus.php`. O cast em `InternshipCancellationRequest` e a Migration 21 já existem; guardas de transição e efeitos da decisão continuam planejados. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

| Case | Valor | Rótulo |
| --- | --- | --- |
| `Submitted` | `submitted` | Enviada |
| `UnderReview` | `under_review` | Em análise |
| `Approved` | `approved` | Aprovada |
| `Rejected` | `rejected` | Recusada |
| `Withdrawn` | `withdrawn` | Retirada pelo discente |

O pedido nasce enviado porque motivo e estágio são obrigatórios. O Setor de Estágio inicia a análise e aprova ou recusa. O discente pode retirar somente antes da decisão. Estados finais não são editáveis nem apagados.

## Checklist

- [x] Criar enum, rótulos, `values()` e `options()`.
- [ ] Cobrir cases, valores, rótulos e opções com teste unitário.
- [x] Adicionar cast no Model.
- [ ] Implementar guardas de transição.
- [ ] Testar concorrência entre retirada e decisão.
