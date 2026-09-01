---
title: SGE — Actions
description: Índice das Actions de aplicação que encapsulam operações de negócio.
type: technical-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/actions
  - sge/checklist
aliases:
  - Índice de Actions do SGE
---
## Inventário

- [[SGE - Action - ResetUserPassword|`ResetUserPassword`]] — valida e grava a nova senha no fluxo Fortify.

## Checklist comum

- [ ] Documentar entrada, saída, exceções, transação e efeitos colaterais.
- [ ] Manter autorização no fluxo/Policy apropriado, sem confiar apenas na Action.
- [ ] Usar os [[SGE - Concerns|concerns]] compartilhados para validações comuns.
- [ ] Criar testes unitários e de feature do fluxo completo.
- [ ] Avaliar Activity Log, notificações, Jobs e idempotência.

## Navegação

- [[SGE - Componentes técnicos]]
- [[SGE - Fase 04 - Conta e contexto|Fase de conta e contexto]]
