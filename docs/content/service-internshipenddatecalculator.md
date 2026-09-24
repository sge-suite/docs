---
id: service-internshipenddatecalculator
title: Service — InternshipEndDateCalculator
description: Contrato técnico do cálculo automático da previsão de término.
type: technical-reference
status: planned
visibility: public
tags: sge/services, sge/calculos, sge/estagio
related: migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules
source_refs:
---
Serviço puro, sem Eloquent e sem relógio global. Recebe um DTO com data inicial, carga exigida, jornada inicial de `internships.weekly_hours`, eventuais vigências criadas por aditivos formalizados, pausas, feriados e margem. Retorna `ProjectedEndDateResult` com data de conclusão da carga, data final projetada e horas creditadas. Somente a data final projetada é persistida em `internships.projected_end_date`; o estágio não guarda fórmula, versão de algoritmo nem JSONB das entradas.

## Invariantes

- datas são `CarbonImmutable` no timezone institucional;
- as sete chaves da jornada existem e seus valores são inteiros;
- vigências e pausas não se sobrepõem dentro do mesmo conjunto;
- cada data usa no máximo uma jornada vigente;
- o último dia credita `min(jornada_do_dia, horas_restantes)`;
- margem é contada em dias corridos; após a margem, a data avança até um dia programado não bloqueado;
- máximo defensivo de dez anos de iteração, configurável apenas em teste.

O calendário de feriados nacional, estadual e municipal versionado, aplicável à cidade e à UF do endereço histórico do local de trabalho, é carregado antes da chamada; o serviço não consulta API. A fonte externa, quando usada, serve somente à importação administrativa do calendário, nunca durante o cálculo. O serviço usa os feriados, pausas e exceções aplicáveis ao intervalo; o resultado persistido no estágio é a data projetada. Mudanças autorizadas da previsão são registradas no Activity Log.

## Recalculo

Criação do estágio, nova pausa, alteração/cancelamento de pausa, ativação de jornada vinculada a aditivo com assinaturas conferidas e correção da data inicial disparam `RecalculateProjectedEndDate`. A Action usa lock pessimista, recalcula dentro da transação e registra as datas anterior e nova no Activity Log. Não há alteração temporária ou direta de jornada fora desse fluxo de aditivo.

## Referências

- [Migration 22 — holidays](doc:migration-22-holidays)
- [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides)
- [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules)
