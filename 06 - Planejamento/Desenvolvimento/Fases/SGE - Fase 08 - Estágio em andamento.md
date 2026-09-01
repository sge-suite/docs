---
title: SGE — Fase 08 — Estágio em andamento
description: Checklist de pausas, substituições, aditivos, cancelamento e histórico do estágio.
type: development-phase
status: planned
order: 8
tags:
  - sge/desenvolvimento
  - sge/estagio
  - sge/checklist
---
Base: [[SGE - Fluxos principais#4 Estágio em andamento|acompanhamento do estágio]].

## Checklist

- [ ] Liberar o estágio pelo Setor de Estágio somente após requisitos documentais e assinaturas.
- [ ] Criar `internships:sync-execution-status`, diário e idempotente, para iniciar estágio liberado, pausar execução e retomar pausa encerrada.
- [ ] Permitir que o Setor decida manualmente se registra a assinatura, cancela o documento ou abre correção da nova data após analisar o vencimento documental.
- [ ] Registrar os schedules em `routes/console.php` com `onOneServer`, `withoutOverlapping` e a operação de `schedule:run` em produção.
- [ ] Implementar pausas com início/fim em data, motivo, estado `InProgress` de origem e validação de sobreposição.
- [ ] Sincronizar o status imediatamente ao criar/alterar/remover pausa, além da reconciliação diária.
- [ ] Criar calendário `non_working_dates` nacional/estadual/municipal/campus sem dependência de rede no cálculo.
- [ ] Criar a jornada inicial pactuada e impedir sua edição ordinária durante o estágio.
- [ ] Permitir nova vigência de jornada somente após aditivo com assinaturas conferidas; impedir sobreposição/lacuna e reescrita de dias passados.
- [ ] Recalcular término com carga horária, jornada pactuada ou aditivo formalizado, calendário, pausas e margem congelada.
- [ ] Persistir versão, entradas e resultado em `projected_end_date_calculation`.
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

- [[SGE - Migration - 17 - Internship pauses|Migration de pausas]].
- [[SGE - Enum - InternshipStatus|Status do estágio]].
- [[SGE - Enum - GeneratedDocumentType|Tipo de documento]].
- [[SGE - Schedules|Schedules]].

## Próxima fase

[[SGE - Fase 09 - Avaliação e conclusão|Fase 09 — Avaliação e conclusão]]
