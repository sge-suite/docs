---
id: migration-23-internship-work-schedules
title: Migration 23 — internship_work_schedules
description: Vigências da jornada criadas por aditivos após a jornada inicial do estágio.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/jornada, sge/calculos
related: migration-15-internships, migration-16-generated-documents, migration-17-internship-pauses, migration-22-holidays, migration-22-internship-calendar-overrides, service-internshipenddatecalculator
source_refs:
---
> [!success] Estado
> Migration, Model, factory e relações implementados. A jornada inicial permanece em `internships.weekly_hours`; a aplicação transacional do aditivo e o recálculo ainda pertencem ao fluxo funcional.

## Contrato da tabela

| Coluna | Tipo SQL | Nulável | Índice/constraint | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da vigência da jornada. |
| `internship_id` | `bigint` | não | `FK`, índice | Referencia `internships.id`; exclusão `RESTRICT`. |
| `starts_on` | `date` | não | índice composto | Primeiro dia inclusivo desta distribuição de horas. |
| `ends_on` | `date` | sim | índice composto | Último dia inclusivo; nulo apenas na vigência atual. |
| `weekly_hours` | `jsonb` | não | — | Objeto com as sete chaves de dia da semana e inteiros não negativos em horas. |
| `generated_document_id` | `bigint` | não | `FK`, índice | Referencia o aditivo formalizado em `generated_documents.id`. |

| `created_at` | `timestamp(0)` | não | — | Instante de criação. |
| `updated_at` | `timestamp(0)` | não | — | Instante da última alteração técnica permitida. |

`internships.weekly_hours` vale desde `planned_start_date` até o dia anterior ao primeiro aditivo efetivado. As linhas desta tabela representam apenas vigências posteriores; a aplicação impede sobreposição e lacunas entre elas. Cada nova vigência começa no dia seguinte ao encerramento da anterior.

O Model valida que `ends_on` seja nulo ou maior/igual a `starts_on`, que `weekly_hours` contenha exatamente os dias esperados e que cada valor seja inteiro não negativo dentro dos limites do snapshot. Também verifica a referência a um aditivo assinado do mesmo estágio, sobreposição e continuidade com a vigência anterior. A Action ainda deverá serializar essas mudanças com lock no estágio; não há SQL bruto nem `CHECK` adicional na migration.

## Regras de negócio

Ao aceitar a solicitação, o SGE grava a jornada inicial em `internships.weekly_hours`, com início em `planned_start_date`. Durante a execução não existe edição ordinária nem mudança temporária de carga horária: pausas apenas suspendem o cômputo. Se for necessário alterar a distribuição de horas, o Setor gera um aditivo e só aplica a nova jornada depois de conferir as assinaturas. A primeira linha delimita implicitamente a jornada inicial até o dia anterior; as linhas seguintes encerram a vigência anterior no dia precedente. Nunca se recalculam dias passados usando a distribuição nova.

O documento principal usa `internships.weekly_hours`. O aditivo referencia a vigência que ele formaliza. Toda alteração efetivada por aditivo recalcula `internships.projected_end_date` usando a jornada correta para cada data, o calendário de feriados nacional/estadual/municipal persistido aplicável ao endereço do local de trabalho, as pausas e a margem definida no snapshot do tipo de estágio.

`weekly_hours` não registra horário de entrada e saída. Tanto no estágio quanto nesta tabela, ela informa somente quantas horas são creditadas em cada dia da semana. A quantidade exigida e os limites ordinários ou excepcionais continuam no snapshot de `internship_type_snapshot`.

## Integridade histórica

A jornada inicial e uma vigência posterior que já participaram de cálculo, documento ou auditoria não podem ser apagadas nem ter suas horas reescritas. Correções contratuais criam uma nova vigência e preservam a anterior. Alterações em `updated_at` não devem mudar a distribuição histórica; na prática, o Model deve tratar a linha como imutável depois de utilizada.

Uma pausa não é uma jornada e não altera `weekly_hours`. Uma exceção de feriado também não é uma jornada: fica em [`internship_calendar_overrides`](doc:migration-22-internship-calendar-overrides). A lista de dias trabalhados é derivada no momento da consulta a partir das vigências, pausas, feriados e exceções; não há tabela materializada de dias individuais.

## Checklist

- [x] Criar migration `create_internship_work_schedules_table` com tipos SQL, FKs e índices.
- [x] Criar Model com cast de `weekly_hours` e relações para estágio e documento; autoria no Activity Log.
- [x] Validar exatamente as sete chaves de `weekly_hours` e os limites do snapshot do tipo no Model.
- [x] Rejeitar sobreposição e lacuna com a vigência anterior no Model.
- [ ] Garantir serialização concorrente das alterações na Action transacional.
- [ ] Exigir aditivo e assinaturas conferidas para cada vigência posterior.
- [x] Impedir reescrita da jornada e exclusão física pelo Model; permitir apenas encerramento único da vigência.
- [ ] Recalcular a previsão somente após a nova vigência ser efetivada.
- [ ] Testar jornada inicial em `internships`, aditivo, vigência encerrada, sobreposição, lacuna, pausa e reprocessamento idempotente.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [internships](doc:migration-15-internships)
- [generated_documents](doc:migration-16-generated-documents)
- [internship_pauses](doc:migration-17-internship-pauses)
- [holidays](doc:migration-22-holidays)
- [internship_calendar_overrides](doc:migration-22-internship-calendar-overrides)
- [Service — InternshipEndDateCalculator](doc:service-internshipenddatecalculator)
