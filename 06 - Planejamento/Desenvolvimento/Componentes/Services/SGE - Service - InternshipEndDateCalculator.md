---
title: SGE — Service — InternshipEndDateCalculator
description: Contrato técnico do cálculo reproduzível da previsão de término.
type: technical-reference
status: planned
tags:
  - sge/services
  - sge/calculos
  - sge/estagio
---
Serviço puro, sem Eloquent e sem relógio global. Recebe um DTO com data inicial, carga exigida, jornada pactuada e eventuais vigências criadas por aditivos já formalizados, pausas, datas sem expediente, margem e versão da fórmula. Retorna `ProjectedEndDateResult` com data de conclusão da carga, data final projetada, horas creditadas e snapshot compacto das entradas.

## Invariantes

- datas são `CarbonImmutable` no timezone institucional;
- as sete chaves da jornada existem e seus valores são inteiros;
- vigências e pausas não se sobrepõem dentro do mesmo conjunto;
- cada data usa no máximo uma jornada vigente;
- o último dia credita `min(jornada_do_dia, horas_restantes)`;
- margem é contada em dias corridos; após a margem, a data avança até um dia programado não bloqueado;
- versão de algoritmo desconhecida falha explicitamente;
- máximo defensivo de dez anos de iteração, configurável apenas em teste.

O calendário é carregado antes da chamada; o serviço não consulta API. O resultado usado em `internships.projected_end_date_calculation` guarda somente as datas sem expediente que afetaram o intervalo, além de IDs/hashes para auditoria.

## Recalculo

Criação do estágio, nova pausa, alteração/cancelamento de pausa, ativação de jornada vinculada a aditivo com assinaturas conferidas e correção da data inicial disparam `RecalculateProjectedEndDate`. A Action usa lock pessimista, recalcula dentro da transação e registra valor anterior/novo no Activity Log. Não há alteração temporária ou direta de jornada fora desse fluxo de aditivo.

## Referências

- [[SGE - Migration - 22 - Non-working dates]]
- [[SGE - Migration - 23 - Internship work schedules]]
