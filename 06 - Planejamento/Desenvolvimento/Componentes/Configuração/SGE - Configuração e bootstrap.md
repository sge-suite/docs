---
title: SGE — Configuração e bootstrap
description: Mapa dos arquivos que inicializam a aplicação e configuram autenticação, locale, filas, cache e rotas.
type: technical-reference
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/configuracao
  - sge/autenticacao
  - sge/operacao
aliases:
  - Configuração técnica do SGE
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

Registra os comandos agendados de domínio. Em produção, `internships:sync-execution-status` roda às 00:05 e `internships:notify-projected-end` às 08:00, ambos no `APP_TIMEZONE`, com `onOneServer()` e `withoutOverlapping()`. O servidor chama `php artisan schedule:run` a cada minuto. Veja o contrato completo em [[SGE - Schedules]].

### `bootstrap/providers.php`

Registra exatamente:

- [[SGE - Provider - AppServiceProvider|`AppServiceProvider`]];
- [[SGE - Provider - FortifyServiceProvider|`FortifyServiceProvider`]].

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

Os defaults atuais do arquivo são `UTC`, `USD`, locale `en`, fallback `en` e Faker `en_US`. [[SGE - Provider - AppServiceProvider|`AppServiceProvider`]] aplica esses valores no processo.

> [!warning] Divergência de produto
> O SGE é uma aplicação brasileira e os helpers assumem formatos `pt_BR`. Antes da primeira tela institucional, confirmar e configurar `APP_TIMEZONE`, `APP_CURRENCY`, `APP_LOCALE`, `APP_FALLBACK_LOCALE` e `APP_FAKER_LOCALE` no ambiente e nos testes.

## Cache, sessão e filas

- `config/cache.php`: default `database`, usando `cache`/`cache_locks` da [[SGE - Migration - Base 02 - Cache|migration base de cache]].
- `config/session.php`: default `database`, tabela `sessions`, lifetime padrão de 120 minutos, serialização JSON.
- `config/queue.php`: default `database`, tabela `jobs`, `retry_after` padrão de 90 segundos, `after_commit = false`.
- [[SGE - Migration - Base 03 - Jobs|Migration base de Jobs]] é a infraestrutura; tentativas de e-mail do domínio ficam em `email_delivery_attempts`.

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

- `phpoffice/phpword` para [[SGE - Geração de documentos DOCX e variáveis|geração DOCX]];
- `brick/math` como dependência direta, pois [[SGE - Helper - NumberToWordsHelper]] importa suas classes;
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
- [ ] Atualizar [[SGE - Ambiente de desenvolvimento]] com qualquer variável nova.

## Relacionamentos

- [[SGE - Componentes técnicos]]
- [[SGE - Providers|Providers]]
- [[SGE - Testes existentes|Testes existentes]]
- [[SGE - Fase 00 - Preparação|Fase de preparação]]
