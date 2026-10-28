---
id: service-internshipenddatecalculator
title: Service — InternshipEndDateCalculator
description: Contrato técnico do cálculo automático da previsão de término.
type: technical-reference
status: in-progress
visibility: public
tags: sge/services, sge/calculos, sge/estagio
related: migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules
source_refs: https://github.com/sge-suite/sge/blob/master/app/Support/InternshipCalculationHistory.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ApplyInternshipWorkSchedule.php, https://github.com/sge-suite/sge/blob/master/app/Support/InternshipEndDateCalculator.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ProjectInternshipRequestEndDate.php, https://github.com/sge-suite/sge/blob/master/app/Rules/WorkingInternshipStartDate.php
updated: 2026-10-28
---
`InternshipEndDateCalculator` é um serviço puro, sem Eloquent nem relógio global. Recebe início, carga exigida, jornada semanal, datas bloqueadas e margem em dias corridos; devolve a data de conclusão da carga, data projetada e horas creditadas. No fluxo atual, `ProjectInternshipRequestEndDate` resolve o calendário para o endereço e prepara essa chamada no envio e no aceite da solicitação. `internships.projected_end_date` guarda o resultado, enquanto o evento imutável de cálculo preserva as entradas resolvidas e a revisão do algoritmo.

## Invariantes

- datas são `CarbonImmutable` no timezone institucional;
- as sete chaves da jornada existem e seus valores são inteiros;
- a jornada recebe sete valores inteiros, de domingo a sábado;
- o último dia credita `min(jornada_do_dia, horas_restantes)`;
- margem é contada em dias corridos; após a margem, a data avança até um dia programado não bloqueado;
- máximo defensivo de dez anos de iteração, configurável apenas em teste.

Os feriados nacionais, estaduais e municipais aplicáveis à cidade e à UF do local de trabalho são carregados antes da chamada; o cálculo não consulta API. A abertura valida que as importações nacionais e estaduais dos anos necessários estão completas e sem pendências. O Setor ainda não recalcula estágios quando o calendário muda.

## Validação da data inicial

`WorkingInternshipStartDate` valida separadamente a data informada: o dia da semana precisa ter horas na jornada inicial e a data não pode ser feriado nacional, estadual ou municipal do local do estágio, pausa prevista/registrada ou bloqueio de expediente. Uma exceção que libere expediente não autoriza escolher um feriado ou um dia sem jornada para iniciar. Sábados e domingos são permitidos quando têm horas previstas e não estão bloqueados.

Essa validação é aplicada ao preenchimento da jornada e ao salvamento/envio da solicitação quando há dados suficientes, às prévias editáveis e ao salvamento de alterações contratuais que recalculam o estágio. No aceite de correções de data, jornada ou concedente, as condições são conferidas novamente com o calendário efetivo do estágio. O erro é associado a `planned_start_date`; dados incompletos de rascunho continuam sujeitos à validação completa no envio. A reprodução dos cálculos históricos e os recálculos de execução não revalidam retroativamente a data inicial; o algoritmo e sua revisão permanecem preservados.

## Recalculo da previsão

O cálculo ocorre no envio e no aceite da solicitação. A Action `ProjectInternshipEndDate` também atualiza e persiste a previsão ao salvar alterações relevantes do estágio, pausas ou exceções de calendário. A conferência do aditivo assinado integra a nova vigência e o recálculo na mesma transação. Novos cálculos salvos possuem entradas completas e revisão do algoritmo no evento imutável end_date_calculated.

## Referências

- [Migration 22 — holidays](doc:migration-22-holidays)
- [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides)
- [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules)

## Dependência de calendário

A base local, importação anual e gestão estão implementadas em [Calendário de feriados](doc:calendario-de-feriados). O cálculo é usado no envio da abertura, refeito no aceite e atualizado após mudanças relevantes e exceções específicas do estágio. Não há chamada externa durante o cálculo; novos cálculos salvos congelam as entradas efetivas em uma base histórica.

## Calculadora inicial implementada — 16/10/2026

`App\Support\InternshipEndDateCalculator` é puro: recebe início imutável, carga, sete dias com horas inteiras, datas bloqueadas já resolvidas e margem; devolve conclusão da carga, data projetada e horas creditadas. O último dia limita crédito às horas restantes e, após a margem corrida, avança a um dia programado não bloqueado. Há limite defensivo de dez anos.

`ProjectInternshipRequestEndDate` carrega o calendário local para a cidade/UF associada à abertura e valida importações nacionais/estaduais completas, sem pendências, em cada ano usado. A ausência de base impede o envio; o rascunho continua salvável. A solicitação também recebe pausas planejadas, mas o cálculo inicial não integra as vigências futuras de aditivos. A base de entradas versionada e reproduzível de D-019 está integrada aos novos cálculos salvos.

## Base reproduzível dos novos cálculos — 23/10/2026

`InternshipCalculationHistory` preserva um snapshot explícito no evento imutável `end_date_calculated`, associado à solicitação ou ao estágio e à autoria atual. A gravação ocorre no salvamento da transação de domínio, não na prévia. Inclui revisão do schema e do algoritmo, fuso, início, carga, margem, jornada inicial, vigências, datas bloqueadas efetivas e resultado. A reprodução matemática depende dessas entradas resolvidas, não dos cadastros atuais de feriados ou pausas. Motivos dos dias bloqueados são congelados quando disponíveis no cálculo do estágio.

Um SHA-256 canônico das chaves e valores permite conferir a integridade após persistência JSONB e evita registros consecutivos idênticos. Reproduzir compara conclusão das horas, término previsto e horas creditadas; revisão incompatível ou divergência é recusada. Alterações futuras no algoritmo devem preservar suporte às revisões já utilizadas. A reprodução não grava outra previsão nem modifica histórico.

O Setor consulta e reproduz cálculos no detalhe do estágio; o acesso revalida vínculo ativo, campus e posse do registro. O primeiro aceite copia a base do cálculo para o histórico do estágio. Não há backfill de entradas inexistentes em registros antigos. Nenhuma coluna, tabela ou migration foi criada ou aplicada nesta integração. A validação funcional e de concorrência permanece pendente; não foram criados nem executados testes.
