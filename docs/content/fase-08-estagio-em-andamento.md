---
id: fase-08-estagio-em-andamento
title: Fase 08 — Estágio em andamento
description: Checklist de pausas, substituições, aditivos, cancelamento e histórico do estágio.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/estagio, sge/checklist
related: fluxos-principais, migration-17-internship-pauses, migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules, enum-internshipstatus, enum-generateddocumenttype, schedules, fase-09-avaliacao-e-conclusao
source_refs:
---
Base: [acompanhamento do estágio](doc:fluxos-principais#4-estagio-em-andamento).

Priorize primeiro o cálculo puro da data final e as Actions transacionais de pausa, jornada, aditivo, substituição e cancelamento. Implemente Jobs/schedules idempotentes e testes antes das telas operacionais.

## Checklist

- [ ] Liberar o estágio pelo Setor de Estágio somente após requisitos documentais e assinaturas.
- [ ] Criar `internships:sync-execution-status`, diário e idempotente, para iniciar estágio liberado, pausar execução e retomar pausa encerrada.
- [ ] Permitir que o Setor decida manualmente se registra a assinatura, cancela o documento ou abre correção da nova data após analisar o vencimento documental.
- [ ] Registrar os schedules em `routes/console.php` com `onOneServer`, `withoutOverlapping` e a operação de `schedule:run` em produção.
- [ ] Implementar pausas com início/fim em data, motivo, estado `InProgress` de origem e validação de sobreposição.
- [ ] Sincronizar o status imediatamente ao criar/alterar/remover pausa, além da reconciliação diária.
- [ ] Usar calendário nacional, estadual e municipal versionado conforme a cidade/UF do endereço histórico do local de trabalho, sem dependência de rede no cálculo.
- [ ] Permitir ao Setor de Estágio liberar ou bloquear uma data específica em `internship_calendar_overrides`, com motivo e auditoria; recessos, folgas, pontes e fechamentos devem ser representados por pausas, não por `holidays`.
- [ ] Gravar a jornada inicial em `internships.weekly_hours` e impedir sua edição ordinária durante o estágio.
- [ ] Permitir nova vigência de jornada somente após aditivo com assinaturas conferidas; impedir sobreposição/lacuna e reescrita de dias passados.
- [ ] Recalcular término com carga horária, jornada pactuada ou aditivo formalizado, calendário, pausas e margem congelada.
- [ ] Recalcular e persistir `internships.projected_end_date` após pausas, feriados aplicáveis e aditivos formalizados, sem JSONB de fórmula.
- [ ] Implementar substituição autorizada de orientador/supervisor.
- [ ] Preservar pessoa anterior e motivo da substituição.
- [ ] Gerar aditivo pelo fluxo de documentos.
- [ ] Dar ao aditivo ciclo próprio de assinatura.
- [ ] Implementar cancelamento com permissão, motivo, Activity Log e notificações.
- [ ] Criar notificações deduplicadas e Jobs pós-commit para o discente em início, pausa, retomada, vencimento documental e lembrete único de término previsto a sete dias.
- [ ] Criar resumo diário interno, por campus e destinatário do Setor de Estágio, agrupando os eventos temporais e pendências sem enviar e-mail ao Setor.
- [x] Permitir que o discente solicite cancelamento antes do início ou durante o andamento.
- [x] Definir a decisão do Setor de Estágio e os efeitos documentais da aprovação do cancelamento.
- [ ] Preservar histórico de todas as alterações.

## Referências

- [Migration de pausas](doc:migration-17-internship-pauses).
- [Status do estágio](doc:enum-internshipstatus).
- [Tipo de documento](doc:enum-generateddocumenttype).
- [Schedules](doc:schedules).

## Próxima fase

[Fase 09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao)
