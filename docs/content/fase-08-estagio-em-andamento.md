---
id: fase-08-estagio-em-andamento
title: Fase 08 — Estágio em andamento
description: Checklist de pausas, substituições, aditivos, cancelamento e histórico do estágio.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/estagio, sge/checklist
related: fluxos-principais, migration-17-internship-pauses, migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules, enum-internshipstatus, enum-generateddocumenttype, schedules, fase-09-avaliacao-e-conclusao
source_refs: https://github.com/sge-suite/sge/blob/master/routes/console.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ProjectInternshipEndDate.php, https://github.com/sge-suite/sge/blob/master/app/Actions/UpdateInternshipData.php, https://github.com/sge-suite/sge/blob/master/app/Console/Commands/SyncInternshipExecutionStatuses.php
---
Base: [acompanhamento do estágio](doc:fluxos-principais#4-estagio-em-andamento).

As telas do Setor para editar o estágio, consultar a previsão e manter exceções de calendário estão disponíveis. O cálculo considera as regras copiadas para o estágio, pausas, calendário e exceções, e a previsão é atualizada ao salvar mudanças relevantes. Liberação, execução, cancelamento, avaliação e conclusão também estão implementados. A vigência de jornada por aditivo assinado e a reprodução de novos cálculos salvos estão implementadas. Permanecem pendentes os avisos/resumos adicionais.

## Checklist

- [x] Liberar o estágio pelo Setor de Estágio somente após requisitos documentais e assinaturas.
- [x] Criar `internships:sync-execution-status`, diário e idempotente, para iniciar estágio liberado, pausar execução e retomar pausa encerrada.
- [x] Permitir que o Setor decida manualmente se registra a assinatura, cancela o documento ou abre correção da nova data após analisar o vencimento documental.
- [x] Registrar `internships:sync-execution-status` em `routes/console.php` às 00:05 com `onOneServer` e `withoutOverlapping`.
- [x] Implementar pausas com início/fim em data, motivo e validação de sobreposição; novos períodos só podem ser criados em `InProgress`.
- [x] Sincronizar o status imediatamente ao criar/alterar/remover pausa, além da reconciliação diária.
- [x] Usar calendário nacional, estadual e municipal persistido conforme a cidade/UF do endereço histórico do local de trabalho, sem dependência de rede no cálculo.
- [x] Permitir ao Setor de Estágio liberar ou bloquear uma data específica em `internship_calendar_overrides`, com motivo e auditoria; recessos, folgas, pontes e fechamentos devem ser representados por pausas, não por `holidays`.
- [x] Gravar a jornada inicial em `internships.weekly_hours`; antes da liberação, a edição do estágio pode alterar a jornada e recalcular a previsão. Depois da liberação, a jornada pactuada fica protegida.
- [x] Permitir nova vigência de jornada somente após aditivo com assinaturas conferidas; impedir sobreposição/lacuna e reescrita de dias passados.
- [x] Recalcular a previsão a partir das regras salvas no estágio, jornada, calendário, exceções, pausas e margem.
- [x] Persistir `internships.projected_end_date` após alterações relevantes do estágio e pausas; novos cálculos salvos congelam as entradas efetivas, o calendário resolvido e o resultado em evento imutável.
- [x] Permitir ao Setor substituir orientador ou supervisor ao editar o estágio, validando tipo, campus e vínculo disponível; a operação exige motivo.
- [x] Preservar vínculo anterior, novo vínculo e motivo da substituição no Activity Log; não existe tabela de vigências de participantes.
- [x] Gerar aditivo pelo fluxo documental comum quando houver template de aditivo disponível; sua emissão não cria automaticamente uma nova vigência de jornada.
- [x] Dar ao aditivo ciclo próprio de assinatura.
- [x] Implementar cancelamento com permissão, motivo, Activity Log e notificações.
- [x] Notificar o discente, dentro do sistema e por e-mail após commit, quando o estágio inicia, pausa ou retoma.
- [ ] Definir e implementar o aviso de término previsto. O prazo anterior de sete dias foi adiado para revisão.
- [ ] Criar resumo diário interno, por campus e destinatário do Setor de Estágio, agrupando eventos temporais e pendências sem enviar e-mail ao Setor.
- [x] Disponibilizar telas do Setor para editar dados e regras congeladas do estágio, consultar o calendário projetado e registrar exceções em conjunto com as alterações salvas.
- [x] Permitir que o discente solicite cancelamento antes do início ou durante o andamento.
- [x] Definir a decisão do Setor de Estágio e os efeitos documentais da aprovação do cancelamento.
- [x] Registrar alterações do estágio e decisões no Activity Log; novos cálculos salvos possuem base versionada e reproduzível no evento específico do histórico.

## Referências

- [Migration de pausas](doc:migration-17-internship-pauses).
- [Status do estágio](doc:enum-internshipstatus).
- [Tipo de documento](doc:enum-generateddocumenttype).
- [Schedules](doc:schedules).

## Próxima fase

[Fase 09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao)

## Dependência de calendário

A base local, importação anual e gestão estão implementadas em [Calendário de feriados](doc:calendario-de-feriados). O cálculo da previsão considera feriados persistidos, exceções, pausas e regras copiadas para o estágio, sem chamada externa durante consultas. Alterar o tipo de estágio não muda o snapshot de regras já salvo no estágio. Alterações relevantes do próprio estágio recalculam a data prevista. O evento end_date_calculated agora congela explicitamente as entradas, as datas bloqueadas resolvidas, a versão do algoritmo, o fuso e o resultado. A reprodução usa somente esses dados, sem consultar o calendário atual. Eventos anteriores que não registraram essas entradas não são reconstruídos artificialmente.

## Liberação e cancelamento implementados

“Liberar estágio” exige todos os documentos principais vigentes assinados, grava data/vínculo e sincroniza imediatamente a execução conforme a data e as pausas. “Concluir estágio” exige confirmação da carga integral. O cancelamento pode partir do Discente ou ser iniciado pelo Setor; revisão, retirada e decisão são botões separados. A decisão exige motivo e data efetiva não futura. Cancela documentos não assinados e avaliações pendentes, preservando assinados, aprovadas, notas e histórico. Os envolvidos recebem avisos internos e e-mails personalizados por papel. A listagem do Setor identifica pedidos pendentes e permite filtrá-los. Pedidos de cancelamento pendentes entram no resumo diário interno do Setor, sem e-mail ao Setor. O resumo diário de eventos temporais, o aviso de término previsto e a geração automática de rescisão permanecem pendentes.

## Integrações de jornada e histórico — 23/10/2026

O Setor informa a nova jornada na emissão/registro do aditivo e a aplica pela conferência das assinaturas, sem reescrever dias passados. A proposta é congelada; divergência da previsão ou de outra vigência exige substituição do documento. O histórico de cálculos oferece reprodução das bases salvas a partir desta integração. As decisões sobre documento principal com data vencida usam a lista de documentos e o fluxo de correção existente. Veja os contratos de [vigências](doc:migration-23-internship-work-schedules), [documentos](doc:migration-16-generated-documents) e [cálculo](doc:service-internshipenddatecalculator). Avisos de término e resumos temporais não foram alterados.
