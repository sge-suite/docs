---
id: migration-23-internship-work-schedules
title: Migration 23 — internship_work_schedules
description: Jornada semanal pactuada, preservada por vigência somente quando um aditivo formalizado a alterar.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/jornada, sge/calculos
related: migration-15-internships, migration-16-generated-documents, migration-17-internship-pauses, migration-22-non-working-dates, migration-22-internship-calendar-overrides, service-internshipenddatecalculator
source_refs:
---
> [!todo] Estado
> Planejada. A jornada inicial nasce na formalização do estágio; novas vigências só são criadas depois de um aditivo formalizado e conferido pelo Setor de Estágio.

## Contrato da tabela

| Coluna | Tipo SQL | Nulável | Índice/constraint | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da vigência da jornada. |
| `internship_id` | `bigint` | não | `FK`, índice | Referencia `internships.id`; exclusão `RESTRICT`. |
| `starts_on` | `date` | não | índice composto | Primeiro dia inclusivo desta distribuição de horas. |
| `ends_on` | `date` | sim | índice composto | Último dia inclusivo; nulo apenas na vigência atual. |
| `weekly_hours` | `jsonb` | não | — | Objeto com as sete chaves de dia da semana e inteiros não negativos em horas. |
| `reason` | `varchar(32)` | não | índice | `initial` para a jornada inicial ou `addendum` para vigência criada por aditivo. O documento e a justificativa ficam nas colunas próprias. |
| `generated_document_id` | `bigint` | sim | `FK`, índice | Referencia `generated_documents.id`; obrigatório quando `reason = addendum`, nulo na jornada inicial quando ela não depender de documento gerado. |
| `created_by_affiliation_id` | `bigint` | não | `FK`, índice | Vínculo que registrou a vigência; exclusão `RESTRICT`. |
| `created_at` | `timestamp(0)` | não | — | Instante de criação. |
| `updated_at` | `timestamp(0)` | não | — | Instante da última alteração técnica permitida. |

`internship_id`, `starts_on` e `ends_on` formam a vigência temporal do estágio. A aplicação deve impedir sobreposição. A lacuna entre vigências também é inválida quando a nova jornada deveria continuar o período do estágio; a primeira vigência começa em `planned_start_date` e uma vigência posterior começa no dia seguinte ao encerramento da anterior.

O banco deve garantir, quando o PostgreSQL estiver disponível, que `ends_on` seja nulo ou maior/igual a `starts_on`, que `weekly_hours` contenha exatamente os dias esperados e que cada valor seja inteiro não negativo. A regra condicional de `reason`, `generated_document_id`, aditivo assinado e continuidade temporal também deve ser validada na Action e nos testes.

## Regras de negócio

Ao aceitar a solicitação, o SGE cria uma jornada inicial com início igual a `planned_start_date`. Durante a execução não existe edição ordinária nem mudança temporária de carga horária: pausas apenas suspendem o cômputo. Se for necessário alterar a distribuição de horas, o Setor gera um aditivo e só aplica a nova jornada depois de conferir as assinaturas. A aplicação fecha a vigência anterior no dia precedente e cria nova linha; nunca recalcula dias passados usando a nova distribuição.

O documento principal usa a jornada inicial. O aditivo referencia a vigência que ele formaliza. Toda alteração efetivada por aditivo recalcula `internships.projected_end_date` usando a jornada correta para cada data, o calendário nacional/estadual/municipal persistido aplicável ao endereço do local de trabalho, as pausas e a margem definida no snapshot do tipo de estágio.

`weekly_hours` não registra horário de entrada e saída. A tabela informa somente quantas horas são creditadas em cada dia da semana. A quantidade exigida e os limites ordinários ou excepcionais continuam no snapshot de `internship_type_snapshot`.

## Integridade histórica

Uma vigência que já participou de cálculo, documento ou auditoria não pode ser apagada nem ter suas horas reescritas. Correções contratuais criam uma nova vigência e preservam a anterior. Alterações em `updated_at` não devem mudar a distribuição histórica; na prática, o Model deve tratar a linha como imutável depois de utilizada.

Uma pausa não é uma jornada e não altera `weekly_hours`. Uma exceção de feriado também não é uma jornada: fica em [`internship_calendar_overrides`](doc:migration-22-internship-calendar-overrides). A lista de dias trabalhados é derivada no momento da consulta a partir das vigências, pausas, calendário e exceções; não há tabela materializada de dias individuais.

## Checklist

- [ ] Criar migration `create_internship_work_schedules_table` com tipos SQL, FKs e índices.
- [ ] Criar Model com cast de `weekly_hours` e relações para estágio, documento e vínculo criador.
- [ ] Validar exatamente as sete chaves de `weekly_hours` e os limites do snapshot do tipo.
- [ ] Garantir no banco e na Action que vigências do mesmo estágio não se sobreponham.
- [ ] Exigir aditivo e assinaturas conferidas para `reason = addendum`.
- [ ] Impedir lacunas indevidas e impedir edição/exclusão depois do primeiro uso.
- [ ] Recalcular a previsão somente após a nova vigência ser efetivada.
- [ ] Testar jornada inicial, aditivo, vigência encerrada, sobreposição, lacuna, pausa e reprocessamento idempotente.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [internships](doc:migration-15-internships)
- [generated_documents](doc:migration-16-generated-documents)
- [internship_pauses](doc:migration-17-internship-pauses)
- [non_working_dates](doc:migration-22-non-working-dates)
- [internship_calendar_overrides](doc:migration-22-internship-calendar-overrides)
- [Service — InternshipEndDateCalculator](doc:service-internshipenddatecalculator)
