---
id: configuracao-e-bootstrap
title: Configuração e bootstrap
description: Mapa dos arquivos que inicializam a aplicação e configuram autenticação, locale, filas, cache e rotas.
type: technical-reference
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/configuracao, sge/autenticacao, sge/operacao
related: schedules, provider-appserviceprovider, provider-fortifyserviceprovider, migration-base-02-cache, migration-base-03-jobs, geracao-de-documentos-docx-e-variaveis, helper-numbertowordshelper, ambiente-de-desenvolvimento, componentes-tecnicos, providers, testes-existentes, fase-00-preparacao
source_refs: https://github.com/sge-suite/sge/blob/master/bootstrap/app.php, https://github.com/sge-suite/sge/blob/master/bootstrap/providers.php, https://github.com/sge-suite/sge/blob/master/routes/console.php, https://github.com/sge-suite/sge/blob/master/routes/web.php, https://github.com/sge-suite/sge/blob/master/routes/settings.php, https://github.com/sge-suite/sge/blob/master/config/auth.php, https://github.com/sge-suite/sge/blob/master/config/fortify.php, https://github.com/sge-suite/sge/blob/master/config/app.php, https://github.com/sge-suite/sge/blob/master/config/cache.php, https://github.com/sge-suite/sge/blob/master/config/session.php, https://github.com/sge-suite/sge/blob/master/config/queue.php
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

Registra `documents:prune-temporary` a cada hora e três rotinas diárias no fuso de `app.timezone`: `internships:sync-execution-status` às 00:05, `holidays:prepare` às 03:00 e `internship-requests:notify-office` às 08:00. O aviso de término previsto e o resumo diário dos eventos de execução do estágio ainda estão pendentes; veja [Schedules](doc:schedules). Em produção, `php artisan schedule:run` deve ser chamado a cada minuto pelo cron.

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

Os fallbacks de `config/app.php` são `UTC`, `USD`, locale `en`, fallback `en` e Faker `en_US`; o arquivo `.env.example` do projeto define `America/Sao_Paulo`, `BRL`, `pt_BR`, `en` e `pt_BR`, respectivamente. [`AppServiceProvider`](doc:provider-appserviceprovider) aplica os valores resolvidos pela configuração. Ambientes de implantação devem manter essas variáveis alinhadas ao ambiente institucional.

> [!warning] Valores de fallback
> Se essas variáveis não forem configuradas no ambiente, Laravel usará os fallbacks internacionais de `config/app.php`. Preserve os valores brasileiros declarados em `.env.example` nos ambientes institucionais.

## Cache, sessão e filas

- `config/cache.php`: default `database`, usando `cache`/`cache_locks` da [migration base de cache](doc:migration-base-02-cache).
- `config/session.php`: default `database`, tabela `sessions`, lifetime padrão de 120 minutos, serialização JSON.
- `config/queue.php`: default `database`, tabela `jobs`, `retry_after` padrão de 90 segundos, `after_commit = false`. Os envios operacionais que dependem de uma transação despacham seus Jobs explicitamente com `afterCommit()`; isso não altera o default global.
- [Migration base de Jobs](doc:migration-base-03-jobs) é a infraestrutura; tentativas de e-mail do domínio ficam em `email_delivery_attempts`.

## Rotas existentes

`routes/web.php` registra a página pública, dashboard, configurações e rotas autenticadas para avaliações, solicitações e estágios, documentos/templates, feriados e recorrências, campus, cursos, tipos de estágio, concedentes e importações, usuários/vínculos, auditoria e consulta de e-mails. Os grupos usam Policies e o vínculo ativo selecionado para limitar campus, curso e registro. A definição completa e os nomes são mantidos no próprio arquivo; não se trata apenas das rotas de configuração.

O Fortify registra as rotas de autenticação. As views atuais ficam em `resources/views/pages/auth/`.

## Composer e autoload

`composer.json`:

- PSR-4 `App\` → `app/`;
- factories e seeders com namespaces próprios;
- testes em `autoload-dev`;
- `app/helpers.php` carregado como arquivo global;
- scripts `lint:check`, `types:check`, `test`, `dev` e `setup`.

Dependências de domínio:

- `phpoffice/phpword` está em `composer.json` (`^1.4`), com 1.4.0 no lock, para a [geração DOCX](doc:geracao-de-documentos-docx-e-variaveis);
- `brick/math` está instalado como dependência transitiva, usado por [NumberToWordsHelper](doc:helper-numbertowordshelper) e `CurrencyHelper::formatDecimal()`; sua declaração direta continua pendente;
- `config/documents.php` define o conversor por `DOCUMENT_PDF_CONVERTER_URL` (padrão `http://gotenberg:3000`) e timeout de 100 segundos. O Compose inclui Gotenberg 8.38.1/LibreOffice sem porta publicada, em rede interna com a aplicação. O scheduler executa `documents:prune-temporary` a cada hora. Ver [Ambiente de desenvolvimento](doc:ambiente-de-desenvolvimento).

## Checklist

- [x] Registrar Providers no bootstrap.
- [x] Configurar guard, provider, broker e views do Fortify.
- [x] Configurar cache, sessão e filas em banco.
- [x] Carregar funções globais pelo Composer.
- [x] Fornecer no `.env.example` os valores de locale, moeda, timezone e Faker adequados ao contexto brasileiro; validar as variáveis em cada ambiente implantado.
- [x] Despachar explicitamente após commit os Jobs de e-mail e avisos operacionais que dependem de transação; manter documentado que o default global `after_commit` é `false`.
- [ ] Definir retry/backoff por tipo de Job.
- [ ] Configurar e monitorar `schedule:run` por minuto em produção; validar lock compartilhado de `onOneServer`.
- [x] Integrar as rotas dos módulos administrativos, documentais e de estágio com autenticação, contexto de vínculo e Policies.
- [ ] Criar testes de configuração crítica por ambiente.
- [x] Adicionar PHPWord e disponibilizar conversão PDF privada no Sail.
- [ ] Declarar Brick Math diretamente e validar extensões, conversor, fontes e permissões no CI/produção.
- [ ] Atualizar [Ambiente de desenvolvimento](doc:ambiente-de-desenvolvimento) com qualquer variável nova.

## Relacionamentos

- [Componentes técnicos](doc:componentes-tecnicos)
- [Providers](doc:providers)
- [Testes existentes](doc:testes-existentes)
- [Fase de preparação](doc:fase-00-preparacao)
