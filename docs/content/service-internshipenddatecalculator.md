---
id: service-internshipenddatecalculator
title: Service — InternshipEndDateCalculator
description: Contrato técnico do cálculo automático da previsão de término.
type: technical-reference
status: in-progress
visibility: public
tags: sge/services, sge/calculos, sge/estagio
related: migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules
source_refs: https://github.com/sge-suite/sge/blob/master/app/Support/InternshipEndDateCalculator.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ProjectInternshipRequestEndDate.php
---
`InternshipEndDateCalculator` é um serviço puro, sem Eloquent nem relógio global. Recebe início, carga exigida, jornada semanal, datas bloqueadas e margem em dias corridos; devolve a data de conclusão da carga, data projetada e horas creditadas. No fluxo atual, `ProjectInternshipRequestEndDate` resolve o calendário para o endereço e prepara essa chamada no envio e no aceite da solicitação. `internships.projected_end_date` guarda o resultado, sem fórmula, versão do algoritmo ou JSONB de entradas.

## Invariantes

- datas são `CarbonImmutable` no timezone institucional;
- as sete chaves da jornada existem e seus valores são inteiros;
- a jornada recebe sete valores inteiros, de domingo a sábado;
- o último dia credita `min(jornada_do_dia, horas_restantes)`;
- margem é contada em dias corridos; após a margem, a data avança até um dia programado não bloqueado;
- máximo defensivo de dez anos de iteração, configurável apenas em teste.

Os feriados nacionais, estaduais e municipais aplicáveis à cidade e à UF do local de trabalho são carregados antes da chamada; o cálculo não consulta API. A abertura valida que as importações nacionais e estaduais dos anos necessários estão completas e sem pendências. O Setor ainda não recalcula estágios quando o calendário muda.

## Recalculo

O cálculo inicial ocorre ao enviar a solicitação e é recalculado no aceite. Recálculo acionado por novas pausas, alterações de calendário, vigência de aditivo ou correção aprovada ainda não está integrado. A previsão histórica não mantém versão do algoritmo nem as entradas completas.

## Referências

- [Migration 22 — holidays](doc:migration-22-holidays)
- [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides)
- [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules)

## Dependência de calendário

A base local, importação anual e gestão estão implementadas em [Calendário de feriados](doc:calendario-de-feriados). O cálculo inicial é usado no envio da abertura e é refeito no aceite. Não há chamada externa durante a consulta e o conjunto de entradas não é congelado como base histórica. Recálculo após mudanças e exceções específicas do estágio continuam pendentes.

## Calculadora inicial implementada — 16/10/2026

`App\Support\InternshipEndDateCalculator` é puro: recebe início imutável, carga, sete dias com horas inteiras, datas bloqueadas já resolvidas e margem; devolve conclusão da carga, data projetada e horas creditadas. O último dia limita crédito às horas restantes e, após a margem corrida, avança a um dia programado não bloqueado. Há limite defensivo de dez anos.

`ProjectInternshipRequestEndDate` carrega o calendário local para a cidade/UF associada à abertura e valida importações nacionais/estaduais completas, sem pendências, em cada ano usado. A ausência de base impede o envio; o rascunho continua salvável. A solicitação também recebe pausas planejadas, mas o cálculo inicial não integra as vigências futuras de aditivos. A base de entradas versionada e reproduzível de D-019 continua pendente.
