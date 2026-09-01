---
title: SGE — Migration 23 — internship_work_schedules
description: Jornada semanal pactuada, preservada por vigência somente quando um aditivo formalizado a alterar.
type: migration-reference
status: planned
order: 23
table: internship_work_schedules
tags:
  - sge/migrations
  - sge/jornada
  - sge/calculos
---
| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `internship_id` | FK obrigatória. |
| `starts_on` / `ends_on` | vigência inclusiva; fim nullable para a vigente atual. |
| `weekly_hours` | JSONB com as sete chaves e valores inteiros não negativos. |
| `reason` | `initial` ou referência textual ao aditivo formalizado; não precisa enum. |
| `generated_document_id` | FK nullable na jornada inicial e obrigatória em toda jornada criada por aditivo. |
| `created_by_affiliation_id` | vínculo responsável. |
| timestamps | auditoria. |

Ao aceitar a solicitação, o SGE cria a jornada inicial com início igual a `planned_start_date`. Durante a execução não existe edição ordinária nem mudança temporária de carga horária: pausas apenas suspendem o cômputo. Se for necessário alterar a distribuição de horas, o Setor gera o aditivo e só aplica a nova jornada depois de conferir as assinaturas. A aplicação fecha a vigência anterior no dia precedente e cria nova linha; nunca recalcula dias passados usando a nova distribuição. Vigências do mesmo estágio não podem se sobrepor nem deixar lacuna dentro do intervalo projetado. Toda alteração por aditivo recalcula o término.

As validações de 6 horas diárias, 30 semanais e exceções usam o snapshot do tipo. O documento principal usa a jornada inicial; aditivo usa a vigência que ele formaliza. Exclusão física é proibida depois que a jornada participar de cálculo ou documento.
