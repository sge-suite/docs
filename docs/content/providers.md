---
id: providers
title: Providers
description: Índice dos Service Providers que configuram autenticação, locale, moeda e comportamento Eloquent.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/providers, sge/checklist
related: provider-appserviceprovider, provider-fortifyserviceprovider, componentes-tecnicos, fase-02-conta-e-contexto
source_refs:
---
## Inventário

- [`AppServiceProvider`](doc:provider-appserviceprovider) — comportamento Eloquent, locale, timezone e moeda.
- [`FortifyServiceProvider`](doc:provider-fortifyserviceprovider) — Actions, views e rate limit do Fortify.

## Checklist comum

- [ ] Registrar somente configuração global apropriada para um Provider.
- [ ] Documentar impacto em desenvolvimento, testes e produção.
- [ ] Evitar consultas, mutações ou trabalho pesado no `boot()`.
- [ ] Testar configuração efetiva por ambiente.
- [ ] Atualizar a nota ao adicionar binding, listener, rate limiter ou Action.

## Navegação

- [Componentes técnicos](doc:componentes-tecnicos)
- [Fase de conta e contexto](doc:fase-02-conta-e-contexto)
