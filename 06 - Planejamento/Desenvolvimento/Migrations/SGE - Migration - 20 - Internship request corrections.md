---
title: SGE — Migration 20 — internship_request_corrections
description: Pendências operacionais que direcionam a edição da solicitação de estágio.
type: migration-reference
status: planned
order: 20
table: internship_request_corrections
tags:
  - sge/migrations
  - sge/estagio
  - sge/pendencias
---
> [!todo] Estado
> Planejada. Não substitui a auditoria: representa somente a pendência que ainda requer tratamento.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `internship_request_id` | FK obrigatória para a solicitação devolvida. |
| `requested_by_affiliation_id` | FK obrigatória para o vínculo do Setor de Estágio que abriu a correção. |
| `message` | orientação obrigatória e legível ao discente. |
| `affected_sections` | JSONB com códigos estáveis das seções editáveis do formulário, como `granting_party`, `supervisor`, `schedule` e `planned_start_date`. |
| `status` | [[SGE - Enum - InternshipRequestCorrectionStatus|`InternshipRequestCorrectionStatus`]]: aberta, respondida, resolvida ou cancelada. |
| `responded_at` / `resolved_at` | marcos temporais do reenvio do discente e da decisão do Setor. |
| timestamps | auditoria temporal. |

Uma solicitação pode ter várias correções ao longo do processo, mas somente uma deve permanecer aberta por vez. A tela de correção mostra a mensagem e libera somente as seções em `affected_sections`; as demais aparecem como resumo não editável. Ao salvar, a correção fica `respondida` e a solicitação retorna obrigatoriamente para nova análise formal do Setor de Estágio. Somente esse setor pode resolvê-la e autorizar a geração ou reemissão de documentos. Se já existir estágio, ele conserva os dados aprovados até a nova aprovação; então recebe os campos autorizados e os valores derivados recalculados.

Não há schedule para vencimento de assinatura. Se, após acompanhamento manual, o Setor decidir cancelar o documento ou pedir uma nova data, poderá mover o estágio para `PendingCorrection` e abrir esta correção manualmente. O campo `requested_by_affiliation_id` permanece, portanto, sempre vinculado a uma decisão humana do Setor.

O [[SGE - Migration - Base 04 - Activity log|`activity_log`]] deve registrar a abertura, resposta, resolução e os atributos alterados. Ele é histórico de auditoria; esta tabela é a fonte de verdade sobre a pendência aberta e suas seções prioritárias.

## Checklist

- [x] Separar pendência operacional de auditoria.
- [x] Definir mensagem e seções afetadas como contrato da devolução.
- [x] Definir edição parcial, com as demais seções somente para consulta.
- [x] Definir enum, transições e responsável por encerrar a correção.
- [x] Definir que uma correção respondida sempre volta para nova análise formal do Setor de Estágio.
- [ ] Criar validação que impeça mais de uma correção aberta por solicitação.
- [ ] Mapear códigos de seções para os componentes da tela.
- [ ] Criar migration, Model, Policy e testes de autorização.

## Dependências

- [[SGE - Migration - 19 - Internship requests|internship_requests]]
- [[SGE - Migration - 04 - Affiliations|affiliations]]
- [[SGE - Migration - Base 04 - Activity log|activity_log]]
