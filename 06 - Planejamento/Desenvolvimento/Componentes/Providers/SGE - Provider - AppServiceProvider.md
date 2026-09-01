---
title: SGE — Provider — AppServiceProvider
description: Configuração global atual de Eloquent, locale, timezone e moeda.
type: technical-reference
status: implemented
code_path: app/Providers/AppServiceProvider.php
tags:
  - sge/providers
  - sge/operacao
  - sge/formatacao
aliases:
  - Provider principal do SGE
---
## Boot atual

- `Model::preventLazyLoading(! app()->isProduction())`: denuncia lazy loading em desenvolvimento/testes e deixa produção sem essa proteção.
- `setlocale(LC_ALL, config('app.locale').'.UTF-8')`: define locale do processo.
- `date_default_timezone_set(config('app.timezone'))`: define timezone padrão do PHP.
- `Number::useCurrency(config('app.currency'))`: define moeda padrão para `Number`.
- `Number::useLocale(config('app.locale'))`: define locale padrão para formatação numérica.

O [[SGE - Helper - DateHelper|`DateHelper`]] depende do timezone da configuração; o [[SGE - Helper - CurrencyHelper|`CurrencyHelper`]] usa defaults compatíveis, mas aceita sobrescrita.

## Checklist

- [x] Ativar proteção contra N+1 fora de produção.
- [x] Configurar locale, timezone, moeda e números.
- [ ] Testar comportamento com locale/timezone usados no CI e produção.
- [ ] Confirmar que todos os ambientes possuem `app.currency` definido.
- [ ] Documentar exceções de performance antes de desativar `preventLazyLoading`.
- [ ] Não adicionar inicialização de domínio pesado neste Provider.
