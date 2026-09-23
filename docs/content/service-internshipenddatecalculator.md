---
id: service-internshipenddatecalculator
title: Service — InternshipEndDateCalculator
description: Contrato técnico do cálculo reproduzível da previsão de término.
type: technical-reference
status: planned
visibility: public
tags: sge/services, sge/calculos, sge/estagio
related: migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules
source_refs:
---
Serviço puro, sem Eloquent e sem relógio global. Recebe um DTO com data inicial, carga exigida, jornada pactuada e eventuais vigências criadas por aditivos já formalizados, pausas, feriados, margem e versão do algoritmo de cálculo. A versão identifica a implementação da fórmula usada; ela não é uma regra configurável em `internship_types`. O resultado e essa versão ficam registrados em `internships.projected_end_date_calculation` para auditoria. Retorna `ProjectedEndDateResult` com data de conclusão da carga, data final projetada, horas creditadas e snapshot compacto das entradas.

## Invariantes

- datas são `CarbonImmutable` no timezone institucional;
- as sete chaves da jornada existem e seus valores são inteiros;
- vigências e pausas não se sobrepõem dentro do mesmo conjunto;
- cada data usa no máximo uma jornada vigente;
- o último dia credita `min(jornada_do_dia, horas_restantes)`;
- margem é contada em dias corridos; após a margem, a data avança até um dia programado não bloqueado;
- versão de algoritmo desconhecida falha explicitamente;
- máximo defensivo de dez anos de iteração, configurável apenas em teste.

O calendário de feriados nacional, estadual e municipal versionado, aplicável à cidade e à UF do endereço histórico do local de trabalho, é carregado antes da chamada; o serviço não consulta API. A fonte externa, quando usada, serve somente à importação administrativa do calendário, nunca durante o cálculo. O resultado usado em `internships.projected_end_date_calculation` guarda somente os feriados que afetaram o intervalo, pausas, exceções aplicadas e a versão/hash usada na auditoria.

## Recalculo

Criação do estágio, nova pausa, alteração/cancelamento de pausa, ativação de jornada vinculada a aditivo com assinaturas conferidas e correção da data inicial disparam `RecalculateProjectedEndDate`. A Action usa lock pessimista, recalcula dentro da transação e registra valor anterior/novo no Activity Log. Não há alteração temporária ou direta de jornada fora desse fluxo de aditivo.

## Referências

- [Migration 22 — holidays](doc:migration-22-holidays)
- [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides)
- [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules)
