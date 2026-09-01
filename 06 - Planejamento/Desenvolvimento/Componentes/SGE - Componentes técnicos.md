---
title: SGE — Componentes técnicos
description: Índice dos componentes de aplicação já existentes e dos seus checklists de manutenção.
type: technical-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/arquitetura
  - sge/checklist
aliases:
  - Componentes técnicos do SGE
---
Esta nota é o inventário do código transversal do projeto novo. Cada componente tem uma nota própria com responsabilidade, contrato, uso atual, testes e pendências.

## Inventário

| Área                   | Estado    | Detalhamento                       |
| ---------------------- | --------- | ---------------------------------- |
| Casts                  | 🟡 Em uso | [[SGE - Casts]]                    |
| Helpers                | 🟡 Em uso | [[SGE - Helpers]]                  |
| Concerns               | 🟡 Em uso | [[SGE - Concerns]]                 |
| Actions                | 🟡 Em uso | [[SGE - Actions]]                  |
| Services               | 🟡 Planejado | [[SGE - Services]]              |
| Models                 | 🟡 Em uso | [[SGE - Model - User]]             |
| Providers              | 🟡 Em uso | [[SGE - Providers]]                |
| Schedules              | 🟡 Planejado | [[SGE - Schedules]]              |
| Testes                 | 🟡 Em uso | [[SGE - Testes existentes]]        |
| Bootstrap/configuração | 🟡 Em uso | [[SGE - Configuração e bootstrap]] |

## Regra de manutenção

- [ ] Toda classe nova deve ter uma nota se representar decisão transversal ou contrato reutilizado.
- [ ] Toda alteração em cast/helper/concern deve atualizar sua nota e o teste correspondente.
- [ ] Toda função pública deve registrar entrada, saída, fallback e exceções.
- [ ] Não duplicar regra de normalização ou formatação em Livewire, Blade, Model e helper.
- [ ] Preferir serviços/Actions para efeitos colaterais; manter helpers puros quando possível.
- [ ] Rodar a suíte do projeto depois de alterar um componente compartilhado.

## Navegação

- [[SGE - Guia de desenvolvimento]]
- [[SGE - Migrations|Migrations]]
- [[SGE - Enums|Enums]]
- [[SGE - Services|Services]]
- [[SGE - Arquitetura atual]]
