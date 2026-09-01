---
title: SGE — Migration 17 — internship_pauses
description: Contrato das pausas de estágio e sua validação temporal.
type: migration-reference
status: planned
order: 17
table: internship_pauses
tags:
  - sge/migrations
  - sge/estagio
  - sge/historico
---
> [!todo] Estado
> Planejada. Depende de [[SGE - Migration - 15 - Internships|`internships`]].

## Contrato

| Campo                   | Regra                                                   |
| ----------------------- | ------------------------------------------------------- |
| `id`                    | bigint, chave primária.                                 |
| `internship_id`         | FK obrigatória.                                         |
| `starts_at` / `ends_at` | `date` obrigatórios; início e fim inclusivos da pausa.  |
| `reason`                | motivo obrigatório.                                     |
| timestamps              | auditoria.                                              |

Pausas não podem se sobrepor, só podem ser criadas em estágio `InProgress`, não podem começar antes de `planned_start_date` e devem participar do recálculo da previsão de término. O intervalo é inclusivo e não credita horas, mesmo que contenha dia programado. A FK deve preservar o histórico de pausas. A Action de criação ou alteração usa lock no estágio, chama [[SGE - Service - InternshipEndDateCalculator]] e sincroniza o status efetivo; [[SGE - Schedules|Schedules]] repete essa conferência diariamente.

## Checklist

- [ ] Criar migration, Model, relação e índices por estágio/período.
- [ ] Definir validação de intervalo e sobreposição.
- [ ] Atualizar status `Paused`/`InProgress` pela Action de sincronização, com autorização e sem update direto.
- [ ] Registrar criação, alteração e remoção no Activity Log.
- [ ] Testar pausa válida, sobreposição, intervalo invertido e impacto na data final.
- [ ] Testar migrate/rollback na ordem completa.
