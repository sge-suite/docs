---
id: provider-appserviceprovider
title: Provider — AppServiceProvider
description: Configuração global atual de Eloquent, locale, timezone e moeda.
type: technical-reference
status: implemented
visibility: public
tags: sge/providers, sge/operacao, sge/formatacao
related: helper-datehelper, helper-currencyhelper
source_refs: ../../sge/app/Providers/AppServiceProvider.php
---
## Boot atual

- `Model::preventLazyLoading(! app()->isProduction())`: denuncia lazy loading em desenvolvimento/testes e deixa produção sem essa proteção.
- `setlocale(LC_ALL, config('app.locale').'.UTF-8')`: define locale do processo.
- `date_default_timezone_set(config('app.timezone'))`: define timezone padrão do PHP.
- `Number::useCurrency(config('app.currency'))`: define moeda padrão para `Number`.
- `Number::useLocale(config('app.locale'))`: define locale padrão para formatação numérica.

O [`DateHelper`](doc:helper-datehelper) depende do timezone da configuração; o [`CurrencyHelper`](doc:helper-currencyhelper) usa defaults compatíveis, mas aceita sobrescrita.

## Checklist

- [x] Ativar proteção contra N+1 fora de produção.
- [x] Configurar locale, timezone, moeda e números.
- [ ] Testar comportamento com locale/timezone usados no CI e produção.
- [ ] Confirmar que todos os ambientes possuem `app.currency` definido.
- [ ] Documentar exceções de performance antes de desativar `preventLazyLoading`.
- [ ] Não adicionar inicialização de domínio pesado neste Provider.
