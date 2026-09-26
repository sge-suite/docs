---
id: provider-appserviceprovider
title: Provider — AppServiceProvider
description: Bootstrap global de Eloquent, Activity Log, migrations, locale, timezone e moeda.
type: technical-reference
status: implemented
visibility: public
tags: sge/providers, sge/operacao, sge/formatacao
related: helper-datehelper, helper-currencyhelper
source_refs: https://github.com/sge-suite/sge/blob/master/app/Providers/AppServiceProvider.php, https://github.com/sge-suite/sge/blob/master/app/Support/AuditInfrastructureModel.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/DatabaseAuditTest.php
---
## Boot atual

- Associa `Activity` a `ActivityPolicy`, instala observers Eloquent para `DatabaseNotification` e `Media` e acrescenta ator, conta e vínculo às propriedades de cada evento. O ator vem do vínculo ativo, da conta, de `terminal` ou de `system` conforme o contexto.
- Bloqueia atualização e exclusão de `Activity` pelo Model e impede `activitylog:clean` para preservar o histórico sem recursão. A proteção não cobre SQL direto.
- Guarda de comandos `migrate*`: bloqueia migrations, rollback, refresh, reset e instalação fora de PostgreSQL.
- `Model::preventLazyLoading(! app()->isProduction())`: denuncia lazy loading em desenvolvimento/testes e deixa produção sem essa proteção.
- `setlocale(LC_ALL, config('app.locale').'.UTF-8')`: define locale do processo.
- `date_default_timezone_set(config('app.timezone'))`: define timezone padrão do PHP.
- `Number::useCurrency(config('app.currency'))`: define moeda padrão para `Number`.
- `Number::useLocale(config('app.locale'))`: define locale padrão para formatação numérica.

O [`DateHelper`](doc:helper-datehelper) depende do timezone da configuração; o [`CurrencyHelper`](doc:helper-currencyhelper) usa defaults compatíveis, mas aceita sobrescrita.

## Checklist

- [x] Configurar autoria e metadados de conta/vínculo/sistema para eventos do Activity Log.
- [x] Proteger o histórico contra alteração/exclusão Eloquent e desabilitar a limpeza do pacote.
- [x] Auditar notificações e mídia por allowlist, sem copiar payloads privados.
- [x] Ativar proteção contra N+1 fora de produção.
- [x] Exigir PostgreSQL para comandos de migration.
- [x] Configurar locale, timezone, moeda e números.
- [ ] Testar comportamento com locale/timezone usados no CI e produção.
- [ ] Confirmar que todos os ambientes possuem `app.currency` definido.
- [ ] Documentar exceções de performance antes de desativar `preventLazyLoading`.
- [ ] Não adicionar inicialização de domínio pesado neste Provider.
