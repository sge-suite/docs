---
id: schedules
title: Schedules
description: Comandos agendados ativos e rotinas de estágio ainda planejadas.
type: technical-reference
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/schedules, sge/estagio, sge/notificacoes
related: calendario-de-feriados, e-mails-notificacoes-e-entregas, ciclos-de-status, enum-internshipstatus, migration-17-internship-pauses, fase-08-estagio-em-andamento, configuracao-e-bootstrap
source_refs: https://github.com/sge-suite/sge/blob/master/routes/console.php, https://github.com/sge-suite/sge/blob/master/app/Console/Commands/SyncInternshipExecutionStatuses.php, https://github.com/sge-suite/sge/blob/master/app/Actions/SyncInternshipExecutionStatus.php, https://github.com/sge-suite/sge/blob/master/app/Actions/NotifyInternshipExecutionStatus.php
---
## Objetivo e limite

Os schedules tratam fatos que passam a valer com o tempo, mesmo sem alguém abrir o sistema. O sincronizador da execução do estágio já está ativo e reconcilia o estado persistido com a data institucional por uma Action. As rotinas de aviso de término previsto e resumo diário operacional do Setor continuam planejadas.

O horário de referência usa `app.timezone`, atualmente `America/Sao_Paulo`. Não há fuso por campus. `internships:sync-execution-status` aceita `--date=AAAA-MM-DD` para reprocessamento controlado e investigação; sem a opção, usa a data corrente nesse fuso.

> [!important] Ações imediatas e reconciliação
> Criar, alterar ou remover uma pausa chama a mesma Action de sincronização imediatamente. O schedule diário é a rede de segurança para datas que viram sem interação humana e para recuperar uma execução eventualmente interrompida.

O sincronizador ignora campi desativados na seleção e confere o estado novamente dentro da transação antes de gravar. Para evitar corrida com a desativação, bloqueia primeiro o campus e depois o estágio. Enquanto o campus está inativo, não altera status nem cria notificações ou e-mails. Reativar não dispara um replay além da reconciliação normal da data vigente.

## Rotinas ativas

| Comando | Horário | Seleção e efeito | Não faz |
| --- | --- | --- | --- |
| `internships:sync-execution-status` | diariamente, 00:05 | Em campus ativo, move `Released` para `InProgress` quando a data planejada chegou e ajusta para `Paused` ou `InProgress` conforme pausas vigentes. Notifica o discente quando o status muda. | Não conclui, cancela nem recalcula a previsão. |
| `holidays:prepare` | diariamente, 03:00 | Importa feriados nacionais e estaduais e gera feriados municipais por recorrência para o ano atual e os dois seguintes. | Não recalcula estágios. |
| `internship-requests:notify-office` | diariamente, 08:00 | Envia ao Setor o resumo interno das solicitações pendentes, agrupado por campus e destinatário. | Não resume eventos da execução dos estágios nem envia e-mail ao Setor. |

As três rotinas estão registradas em `routes/console.php`, no fuso institucional, com `onOneServer()` e `withoutOverlapping()`. Em produção, o servidor executa `php artisan schedule:run` a cada minuto; `schedule:work` é a alternativa de desenvolvimento local.

## Limpeza de documentos temporários

`documents:prune-temporary` está registrado a cada hora com `withoutOverlapping()`. Remove DOCX/PDF órfãos com mais de uma hora em `storage/app/private/generated-documents-tmp`, somente quando obtém lock exclusivo não bloqueante no arquivo. A geração e a transmissão já removem seus temporários em `finally`; o comando cobre interrupções abruptas do processo. Não altera emissões, snapshots nem originais dos templates. Essa rotina local de limpeza não usa `onOneServer()`, para atender o diretório de cada instância que executa o scheduler.

## Rotinas de estágio adiadas

O aviso ao discente de término previsto e o resumo diário dos eventos operacionais do Setor não estão implementados nem registrados no scheduler. A regra de aviso precisa ser revista: em muitos casos, quando faltam sete dias para a previsão, o estágio já terminou na prática. O prazo e o evento que devem disparar o aviso serão definidos antes de criar essa rotina.

O resumo diário futuro deverá reunir eventos de início, pausa e retomada e as pendências de execução relevantes para o Setor. O resumo existente de `internship-requests:notify-office` cobre somente solicitações pendentes.

## Regra de sincronização de execução

A Action `SyncInternshipExecutionStatus` recebe um estágio bloqueado e uma data de referência. Ela considera pausas executadas e planejadas cujos intervalos inclusivos contêm a data, e aplica as regras abaixo.

| Estado atual | Condição | Estado resultante |
| --- | --- | --- |
| `Released` | `planned_start_date <= data` e sem pausa vigente | `InProgress` |
| `Released` | `planned_start_date <= data` e com pausa vigente | `Paused` |
| `InProgress` | há uma pausa ativa na data | `Paused` |
| `Paused` | não há pausa ativa na data | `InProgress` |
| `PendingFormalization`, `AwaitingSignatures`, `PendingCorrection`, `Completed` ou `Cancelled` | qualquer condição | sem alteração |

Uma pausa nova só pode ser cadastrada enquanto o estágio está em andamento; ela exige início, fim e motivo e não pode começar antes de `planned_start_date`. Períodos já cadastrados podem ser ajustados enquanto o estágio está em andamento ou pausado. O início de uma pausa planejada pode coincidir com o primeiro dia: nesse caso o sincronizador registra a entrada em andamento e a pausa, e envia ao discente uma notificação consolidada de início em pausa.

`Completed` continua uma decisão de negócio, não uma consequência do calendário. Mesmo que a previsão de término tenha chegado, o estágio só é concluído quando a carga horária integral é confirmada. A previsão não é recalculada por este schedule: ela é refeita e persistida ao salvar alterações relevantes do estágio ou mudanças de pausa.

## Auditoria, concorrência e idempotência

Cada estágio é processado em transação curta, com `lockForUpdate()` no campus e no estágio. A consulta externa usa `eachById`; o estado e as condições são lidos novamente dentro do lock. As transições registram no `activity_log`:

- `source: scheduled`, nome do comando, `run_id` e data de referência; e
- status anterior e resultante e `internship_pause_id`, quando houver pausa executada associada.

O `causer` da transição agendada é o sistema, nunca o Setor ou outro usuário sem ação humana. Falhas em um estágio não interrompem os demais; são registradas e fazem o comando terminar com falha.

O lock distribuído de `onOneServer()` depende do cache compartilhado já previsto. `withoutOverlapping()` deve ter TTL acima da duração observada do comando, com alerta se o lock ficar retido. A operação de produção monitora falha do scheduler, comandos atrasados, duração anormal e quantidade de estágios processados; não deve corrigir registros diretamente no banco.

## Notificações das transições implementadas

A Action cria a notificação interna na mesma transação da mudança de status e registra a entrega de e-mail para o discente. O Job é despachado após o commit; uma falha de e-mail não remove a notificação interna. A fila trata tentativas, backoff e falhas conforme [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas). O Setor não recebe um aviso por estágio nesse fluxo.

| Evento | Discente | Setor de Estágio |
| --- | --- | --- |
| entrada automática em andamento | notificação interna e e-mail | sem resumo operacional de estágio implementado. |
| início ou término de pausa | notificação interna e e-mail | sem resumo operacional de estágio implementado. |

O aviso de término previsto e o resumo diário dos estágios continuam pendentes de definição e implementação. O critério de sete dias descrito em versões anteriores não foi adotado.

Uma execução repetida não duplica o aviso de uma transição já aplicada: o estado é relido dentro do lock e a Action não envia notificação quando não há mudança.

## Relações

- [Ciclos de status](doc:ciclos-de-status)
- [Enum de status do estágio](doc:enum-internshipstatus)
- [Pausas de estágio](doc:migration-17-internship-pauses)
- [Fase de estágio em andamento](doc:fase-08-estagio-em-andamento)
- [Configuração e bootstrap](doc:configuracao-e-bootstrap)

## Preparação anual do calendário — implementada

`holidays:prepare` roda diariamente às 03h no fuso institucional, com `onOneServer()` e `withoutOverlapping(180)`. Mantém o ano atual e os dois seguintes, consultando somente nacionais e estaduais ainda não concluídos. Não recalcula estágios. O processo gera municipais por recorrência, recupera falhas e usa dados locais em qualquer consulta posterior. A cobertura é a dos dados retornados pela fonte, não uma certificação legal. Importações extraordinárias usam `holidays:import`, executado sequencialmente.

Para executar a rotina em produção, configure o cron do Laravel para chamar `php artisan schedule:run` a cada minuto, na pasta da aplicação. No desenvolvimento com Sail, use `./vendor/bin/sail artisan schedule:work`. O comando `holidays:prepare` também pode ser executado manualmente e não possui opção `--date`. O registro em `routes/console.php` não inicia o scheduler por conta própria.
