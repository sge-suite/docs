---
id: componentes-tecnicos
title: Componentes técnicos
description: Índice dos componentes de aplicação já existentes e dos seus checklists de manutenção.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/arquitetura, sge/checklist
related: casts, helpers, concerns, actions, services, model-user, providers, schedules, testes-existentes, configuracao-e-bootstrap, migrations, enums, arquitetura-atual
source_refs:
---
Esta nota é o inventário do código transversal do projeto novo. Cada componente tem uma nota própria com responsabilidade, contrato, uso atual, testes e pendências.

## Inventário

| Área                   | Estado    | Detalhamento                       |
| ---------------------- | --------- | ---------------------------------- |
| Casts                  | 🟡 Em uso | [Casts](doc:casts)                    |
| Helpers                | 🟡 Em uso | [Helpers](doc:helpers)                  |
| Concerns               | 🟡 Em uso | [Concerns](doc:concerns)                 |
| Actions                | 🟡 Em uso | [Actions](doc:actions)                  |
| Services               | 🟡 Planejado | [Services](doc:services)              |
| Models                 | 🟡 Em uso | [Model — User](doc:model-user)             |
| Providers              | 🟡 Em uso | [Providers](doc:providers)                |
| Schedules              | 🟡 Planejado | [Schedules](doc:schedules)              |
| Seeders                | 🟢 Implementado | [Migration 01A — cities](doc:migration-01a-cities) |
| Testes                 | 🟡 Em uso | [Testes existentes](doc:testes-existentes)        |
| Bootstrap/configuração | 🟡 Em uso | [Configuração e bootstrap](doc:configuracao-e-bootstrap) |

## Regra de manutenção

- [ ] Toda classe nova deve ter uma nota se representar decisão transversal ou contrato reutilizado.
- [ ] Toda alteração em cast/helper/concern deve atualizar sua nota e o teste correspondente.
- [ ] Toda função pública deve registrar entrada, saída, fallback e exceções.
- [ ] Não duplicar regra de normalização ou formatação em Livewire, Blade, Model e helper.
- [ ] Preferir serviços/Actions para efeitos colaterais; manter helpers puros quando possível.
- [ ] Rodar a suíte do projeto depois de alterar um componente compartilhado.

## Navegação

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Migrations](doc:migrations)
- [Enums](doc:enums)
- [Services](doc:services)
- [Arquitetura atual](doc:arquitetura-atual)
