---
id: actions
title: Actions
description: Índice das Actions de aplicação que encapsulam operações de negócio.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/actions, sge/checklist
related: action-resetuserpassword, migration-01-addresses, concerns, componentes-tecnicos, fase-02-conta-e-contexto
source_refs:
---
## Inventário

- [`ResetUserPassword`](doc:action-resetuserpassword) — valida e grava a nova senha no fluxo Fortify.
- [`CopyAddress`](doc:migration-01-addresses) — relê um endereço persistido em transação e cria uma linha independente, sem modificar a origem ou copiar alterações ainda não salvas.

## Checklist comum

- [ ] Documentar entrada, saída, exceções, transação e efeitos colaterais.
- [ ] Manter autorização no fluxo/Policy apropriado, sem confiar apenas na Action.
- [ ] Usar os [concerns](doc:concerns) compartilhados para validações comuns.
- [ ] Criar testes unitários e de feature do fluxo completo.
- [ ] Avaliar Activity Log, notificações, Jobs e idempotência.

## Navegação

- [Componentes técnicos](doc:componentes-tecnicos)
- [Fase de conta e contexto](doc:fase-02-conta-e-contexto)
