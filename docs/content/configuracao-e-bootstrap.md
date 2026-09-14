---
id: configuracao-e-bootstrap
title: Configuração e bootstrap
description: Mapa dos arquivos que inicializam a aplicação e configuram autenticação, locale, filas, cache e rotas.
type: technical-reference
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/configuracao, sge/autenticacao, sge/operacao
related: schedules, provider-appserviceprovider, provider-fortifyserviceprovider, migration-base-02-cache, migration-base-03-jobs, geracao-de-documentos-docx-e-variaveis, helper-numbertowordshelper, ambiente-de-desenvolvimento, componentes-tecnicos, providers, testes-existentes, fase-00-preparacao
source_refs: ../../sge/bootstrap/app.php, ../../sge/bootstrap/providers.php, ../../sge/routes/console.php, ../../sge/routes/web.php, ../../sge/routes/settings.php, ../../sge/config/auth.php, ../../sge/config/fortify.php, ../../sge/config/app.php, ../../sge/config/cache.php, ../../sge/config/session.php, ../../sge/config/queue.php
---
Este mapa descreve os pontos de entrada que não são Models, Helpers ou migrations, mas alteram o comportamento global do projeto.

## Bootstrap

### `bootstrap/app.php`

- Define a raiz da aplicação.
- Registra rotas web em `routes/web.php` e comandos em `routes/console.php`.
- Registra o endpoint de health check `/up`.
- Mantém middleware padrão no estado atual.
- Renderiza exceções como JSON quando a rota é `api/*` ou quando a requisição espera JSON.

### `routes/console.php`

Atualmente registra apenas o comando padrão `inspire`. Os comandos de domínio `internships:sync-execution-status` e `internships:notify-projected-end` estão planejados em [Schedules](doc:schedules); quando implementados, deverão rodar no `APP_TIMEZONE`, com `onOneServer()` e `withoutOverlapping()`, e serão acionados por `php artisan schedule:run`.

### `bootstrap/providers.php`

Registra exatamente:

- [`AppServiceProvider`](doc:provider-appserviceprovider);
- [`FortifyServiceProvider`](doc:provider-fortifyserviceprovider).

## Autenticação

### `config/auth.php`

| Configuração       | Estado atual                                         |
| ------------------ | ---------------------------------------------------- |
| guard padrão       | `web`, driver `session`.                             |
| provider           | `users`, driver `eloquent`, Model `App\Models\User`. |
| password broker    | `users`.                                             |
| reset table        | `password_reset_tokens`.                             |
| expiração/throttle | 60 minutos/60 segundos.                              |
| confirmação        | timeout de 10800 segundos.                           |

### `config/fortify.php`

- Guard `web`, broker `users` e username/e-mail `email`.
- Lowercase de username ativado.
- Redirecionamento pós-autenticação para `/dashboard`.
- Views de login, confirmação, reset e solicitação de reset habilitadas.
- Única feature habilitada atualmente: `Features::resetPasswords()`.
- Limiter de login aponta para `FortifyServiceProvider`.

## Locale, data e moeda

### `config/app.php`

Os defaults atuais do arquivo são `UTC`, `USD`, locale `en`, fallback `en` e Faker `en_US`. [`AppServiceProvider`](doc:provider-appserviceprovider) aplica esses valores no processo.

> [!warning] Divergência de produto
> O SGE é uma aplicação brasileira e os helpers assumem formatos `pt_BR`. Antes da primeira tela institucional, confirmar e configurar `APP_TIMEZONE`, `APP_CURRENCY`, `APP_LOCALE`, `APP_FALLBACK_LOCALE` e `APP_FAKER_LOCALE` no ambiente e nos testes.

## Cache, sessão e filas

- `config/cache.php`: default `database`, usando `cache`/`cache_locks` da [migration base de cache](doc:migration-base-02-cache).
- `config/session.php`: default `database`, tabela `sessions`, lifetime padrão de 120 minutos, serialização JSON.
- `config/queue.php`: default `database`, tabela `jobs`, `retry_after` padrão de 90 segundos, `after_commit = false`.
- [Migration base de Jobs](doc:migration-base-03-jobs) é a infraestrutura; tentativas de e-mail do domínio ficam em `email_delivery_attempts`.

## Rotas existentes

`routes/web.php` possui:

- `/` → view `welcome`, nome `home`;
- `/dashboard` → view `dashboard`, protegida por `auth`, nome `dashboard`;
- inclusão de `routes/settings.php`.

O Fortify registra as rotas de autenticação. As views atuais ficam em `resources/views/pages/auth/`.

## Composer e autoload

`composer.json`:

- PSR-4 `App\` → `app/`;
- factories e seeders com namespaces próprios;
- testes em `autoload-dev`;
- `app/helpers.php` carregado como arquivo global;
- scripts `lint:check`, `types:check`, `test`, `dev` e `setup`.

Dependências de domínio ainda não adicionadas ao projeto novo:

- `phpoffice/phpword` para [geração DOCX](doc:geracao-de-documentos-docx-e-variaveis);
- `brick/math` como dependência direta, pois [Helper — NumberToWordsHelper](doc:helper-numbertowordshelper) importa suas classes;
- extensões PHP `zip`, `xml`, `dom`, `mbstring` e `intl` na imagem/CI.

## Checklist

- [x] Registrar Providers no bootstrap.
- [x] Configurar guard, provider, broker e views do Fortify.
- [x] Configurar cache, sessão e filas em banco.
- [x] Carregar funções globais pelo Composer.
- [ ] Alinhar defaults de locale/moeda/timezone ao contexto brasileiro.
- [ ] Definir `after_commit` dos Jobs antes de publicar eventos que dependam de transação.
- [ ] Definir retry/backoff por tipo de Job.
- [ ] Configurar e monitorar `schedule:run` por minuto em produção; validar lock compartilhado de `onOneServer`.
- [ ] Confirmar rotas e middleware de cada módulo do SGE.
- [ ] Criar testes de configuração crítica por ambiente.
- [ ] Adicionar PHPWord/Brick Math e validar extensões PHP no setup, CI e produção.
- [ ] Atualizar [Ambiente de desenvolvimento](doc:ambiente-de-desenvolvimento) com qualquer variável nova.

## Relacionamentos

- [Componentes técnicos](doc:componentes-tecnicos)
- [Providers](doc:providers)
- [Testes existentes](doc:testes-existentes)
- [Fase de preparação](doc:fase-00-preparacao)
