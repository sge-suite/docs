---
title: SGE — Schedules
description: Contrato dos comandos agendados que reconciliam a execução do estágio e vencimentos documentais.
type: technical-reference
status: planned
tags:
  - sge/desenvolvimento
  - sge/schedules
  - sge/estagio
  - sge/notificacoes
aliases:
  - Agendamentos do SGE
---
## Objetivo e limite

Os schedules tratam somente fatos que passam a valer com o tempo, mesmo sem alguém abrir o sistema. Eles reconciliam o estado persistido com a data institucional, sempre por Actions e regras de transição já usadas pela interface. Não podem fazer `update` em massa, pular Policies quando houver um ator humano nem inventar um usuário como autor da alteração.

O horário de referência será o `APP_TIMEZONE` institucional, configurado como `America/Sao_Paulo` antes da produção. Não haverá fuso por campus nesta primeira versão: todos os campi atendidos estão no mesmo fuso nacional. Cada comando aceita `--date=AAAA-MM-DD` para testes, reprocessamento controlado e investigação; sem a opção, usa a data corrente nesse fuso.

> [!important] Ações imediatas e reconciliação
> Criar, alterar ou remover uma pausa chama a mesma Action de sincronização imediatamente. O schedule diário é a rede de segurança para datas que viram sem interação humana e para recuperar uma execução eventualmente interrompida.

## Comandos iniciais

| Comando | Horário | Seleção e efeito | Não faz |
| --- | --- | --- | --- |
| `internships:sync-execution-status` | diariamente, 00:05 | Move `Released` para `InProgress` quando a data planejada de início chegou; move `InProgress` para `Paused` se houver pausa ativa; move `Paused` para `InProgress` quando não houver mais pausa ativa. | Não conclui, cancela, recalcula a previsão nem altera estágios finais. |
| `internships:notify-projected-end` | diariamente, 08:00 | Para estágio `InProgress` com `projected_end_date = data + 7 dias`, avisa o discente e monta o resumo interno do Setor de Estágio. | Não conclui o estágio, não altera a previsão nem envia e-mail ao Setor. |

Os horários são deliberadamente separados: o aviso de término roda depois da sincronização de início, pausa e retomada. Em produção, os dois comandos serão registrados em `routes/console.php` com `dailyAt`, `onOneServer()` e `withoutOverlapping()`. O servidor executará `php artisan schedule:run` a cada minuto; `schedule:work` é apenas a alternativa de desenvolvimento local.

## Regra de sincronização de execução

A Action `SynchronizeInternshipExecutionStatus` recebe um estágio bloqueado e uma data de referência. Ela consulta a pausa cujo intervalo inclusivo contém a data (`starts_at <= data <= ends_at`) e aplica somente uma das regras abaixo, nesta ordem de elegibilidade.

| Estado atual | Condição | Estado resultante |
| --- | --- | --- |
| `Released` | `planned_start_date <= data` | `InProgress` |
| `InProgress` | há uma pausa ativa na data | `Paused` |
| `Paused` | não há pausa ativa na data | `InProgress` |
| `PendingFormalization`, `AwaitingSignatures`, `PendingCorrection`, `Completed` ou `Cancelled` | qualquer condição | sem alteração |

Uma pausa pertence à execução: só pode ser cadastrada para estágio já `InProgress`, tem `starts_at`, `ends_at` e `reason` obrigatórios e não pode começar antes de `planned_start_date`. Assim, não existe transição direta de `Released` para `Paused` nem uma pausa prévia que oculte a entrada em andamento.

`Completed` continua uma decisão de negócio, não uma consequência do calendário. Mesmo que a previsão de término tenha chegado, o estágio só é concluído quando a carga horária integral é confirmada; avaliações e notas permanecem em trilha acadêmica separada. O cálculo da previsão também não é agendado: ele é refeito na Action que muda data de início, jornada, calendário ou pausa e persiste sua base reproduzível.

## Auditoria, concorrência e idempotência

Cada transição de status feita por schedule é processada individualmente, em transação curta, com `lockForUpdate()` no estágio. A consulta externa usa `chunkById`; o estado e as condições sempre são lidos novamente dentro do lock. Nessas transições, as propriedades do `activity_log` registram ao menos:

- `source: scheduled`, nome do comando e data de referência;
- status anterior e resultante, ou motivo de não haver alteração;
- `internship_pause_id`, quando aplicável; e
- identificador técnico da execução para correlação operacional.

O `causer` é nulo ou representa explicitamente o sistema, nunca o Setor de Estágio ou outro usuário sem ação humana. O lembrete de término previsto não cria Activity Log: a notificação deduplicada, os snapshots de e-mail e a telemetria do command são sua trilha operacional. Cancelamento, correção e alteração de estado continuam exclusivamente manuais e registrados no Activity Log. Falhas de uma unidade não interrompem as demais; elas são registradas e tornam o comando inelegível como sucesso para o monitoramento.

O lock distribuído de `onOneServer()` depende do cache compartilhado já previsto. `withoutOverlapping()` deve ter TTL acima da duração observada do comando, com alerta se o lock ficar retido. A operação de produção monitora falha do scheduler, comandos atrasados, duração anormal e quantidade de estágios processados; não deve corrigir registros diretamente no banco.

## Notificações dos eventos temporais

A própria Action cria a notificação interna na mesma transação da transição. Para o discente, o Job de e-mail é despachado após o commit; a falha desse Job nunca remove o aviso dentro do sistema. O Setor de Estágio não recebe um e-mail nem uma notificação por estágio: às 08:00 recebe uma única notificação interna por campus e destinatário, com contagens e links filtrados. A fila trata tentativas, backoff e falhas conforme [[SGE - E-mails, notificações e entregas]].

| Evento | Discente | Setor de Estágio |
| --- | --- | --- |
| entrada automática em andamento | notificação interna e e-mail | entra no resumo diário. |
| início ou término de pausa | notificação interna e e-mail | entra no resumo diário. |
| previsão de término a sete dias | notificação interna e e-mail, uma única vez | entra no resumo diário. |

O lembrete de término usa exclusivamente a `projected_end_date` vigente, porque ela já incorpora jornada, calendário e pausas. A chave estável do aviso inclui estágio, versão/resultado atual do cálculo, limiar de sete dias e destinatário. Assim, a rotina diária só envia uma vez para a mesma previsão; se um evento autorizado alterar a data, a mudança relevante da previsão é comunicada pelo próprio fluxo de alteração, não por uma sequência de lembretes.

O resumo do Setor agrega, no mínimo, estágios iniciados, pausados ou retomados no dia, estágios com término previsto em sete dias e estágios cuja previsão já passou sem conclusão. Sua `deduplication_key` combina campus, data e destinatário do Setor; ele é somente interno e não expõe dados sensíveis na listagem resumida.

Cada destinatário recebe no máximo uma notificação por fato temporal. `notifications` terá `deduplication_key` opcional e única quando preenchida; a Action usa uma chave estável que combina evento, estágio, data efetiva e destinatário. A mesma chave é usada para recuperar a notificação já criada em caso de reexecução. A `email_message` derivada preserva sua própria chave de idempotência e histórico de tentativas.

## Testes obrigatórios

- congelar a data institucional e testar início, pausa ativa, término de pausa e todos os estados que devem permanecer imutáveis;
- executar cada comando duas vezes para provar idempotência de status, Activity Log, correção, notificação e e-mail;
- testar concorrência entre alteração manual de pausa e schedule, incluindo releitura sob lock;
- garantir que `Completed` nunca seja produzido pelo command e que a previsão só seja recalculada pelos gatilhos de domínio;
- testar lembrete exatamente a sete dias, nova previsão após mudança autorizada e ausência de aviso fora do limiar;
- testar resumo único interno por campus/destinatário, sem `email_message` para o Setor;
- testar despacho de e-mail do discente somente após commit, destinatário sem canal de e-mail e a unicidade de `deduplication_key`; e
- executar em ambiente com cache compartilhado e validar `onOneServer`, `withoutOverlapping` e os alertas operacionais.

## Relações

- [[SGE - Ciclos de status|Ciclos de status]]
- [[SGE - Enum - InternshipStatus|Enum de status do estágio]]
- [[SGE - Migration - 17 - Internship pauses|Pausas de estágio]]
- [[SGE - Fase 08 - Estágio em andamento|Fase de estágio em andamento]]
- [[SGE - Configuração e bootstrap|Configuração e bootstrap]]
