---
title: SGE — Fase 09 — Avaliação e conclusão
description: Checklist de avaliações, notas, requisitos de encerramento e conclusão do estágio.
type: development-phase
status: planned
order: 9
tags:
  - sge/desenvolvimento
  - sge/avaliacao
  - sge/checklist
---
Base: [[SGE - Fluxos principais#6 Acompanhamento acadêmico e conclusão|avaliação e conclusão]]. O ciclo de resposta, a origem dos pesos e o contrato do formulário fixo estão definidos na [[SGE - Migration - 18 - Evaluations|modelagem final da avaliação]].

## Decisão antes do código

- [ ] Definir quando a avaliação do supervisor será liberada.
- [x] Mapear critérios, escala e regras condicionais do formulário fixo de avaliação.
- [x] Definir os pesos e valores dos conceitos por tipo de estágio, com congelamento no snapshot do estágio.
- [x] Reabrir o mesmo formulário quando devolvido e usar como vigente o aprovado mais recente.
- [x] Definir que o Setor de Estágio aprova ou devolve sem editar a resposta do supervisor.
- [x] Definir que o Orientador lança as notas de relatório e apresentação.
- [x] Definir que as três notas já são contribuições na escala dos pesos e que a nota final é sua soma.
- [x] Registrar a decisão em [[SGE - Backlog e decisões#D-009 — Ciclo e validade da avaliação do supervisor|D-009]].

## Implementação

- [ ] Registrar a liberação no estágio e notificar o supervisor pelo vínculo e canal permitido.
- [ ] Permitir autosave Livewire em `Draft`, com campos nulos até o preenchimento completo.
- [ ] Validar campos obrigatórios e condicionais antes do envio e em estados não `Draft`.
- [ ] Exibir ao supervisor sua lista de avaliações por estágio, sem exclusão física ou acesso ao Activity Log.
- [ ] Congelar a resposta após o envio e reabrir o mesmo registro quando houver devolução.
- [ ] Permitir aprovar ou devolver pelo Setor de Estágio, sem alterar respostas.
- [ ] Devolver a resposta com motivo quando a carga horária não estiver cumprida e permitir cancelamento auditável pelo supervisor.
- [ ] Selecionar em transação a avaliação aprovada mais recente.
- [ ] Calcular nota do supervisor usando snapshot do tipo.
- [ ] Implementar o lançamento, pelo Orientador, das notas de relatório e apresentação.
- [ ] Calcular nota consolidada conforme pesos congelados.
- [ ] Verificar carga horária e requisitos de encerramento.
- [ ] Manter estágio em andamento enquanto a carga horária integral não estiver confirmada, sem bloqueá-lo por avaliações ou notas pendentes.
- [ ] Concluir preservando notas, documentos, snapshots e histórico.
- [ ] Notificar envolvidos sobre a conclusão.

> [!warning] Nota mínima
> Não há nota mínima de aprovação configurada. Não criar corte acadêmico enquanto essa regra não for informada no tipo de estágio.

## Próxima fase

[[SGE - Fase 10 - Serviços transversais|Fase 10 — Serviços transversais]]
