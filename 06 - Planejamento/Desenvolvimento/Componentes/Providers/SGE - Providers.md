---
title: SGE — Providers
description: Índice dos Service Providers que configuram autenticação, locale, moeda e comportamento Eloquent.
type: technical-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/providers
  - sge/checklist
aliases:
  - Índice de providers do SGE
---
## Inventário

- [[SGE - Provider - AppServiceProvider|`AppServiceProvider`]] — comportamento Eloquent, locale, timezone e moeda.
- [[SGE - Provider - FortifyServiceProvider|`FortifyServiceProvider`]] — Actions, views e rate limit do Fortify.

## Checklist comum

- [ ] Registrar somente configuração global apropriada para um Provider.
- [ ] Documentar impacto em desenvolvimento, testes e produção.
- [ ] Evitar consultas, mutações ou trabalho pesado no `boot()`.
- [ ] Testar configuração efetiva por ambiente.
- [ ] Atualizar a nota ao adicionar binding, listener, rate limiter ou Action.

## Navegação

- [[SGE - Componentes técnicos]]
- [[SGE - Fase 04 - Conta e contexto|Fase de conta e contexto]]
