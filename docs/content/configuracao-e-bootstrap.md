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

## Buscas Meilisearch

O ambiente inspecionado usa Laravel 13.24.0, Scout 11.5.0, Livewire 4.3.5, Flux 2.15.1 e Meilisearch PHP SDK 1.16.1. O binding original de Scout instancia o SDK sem cliente HTTP; a descoberta PSR-18 resolveu `GuzzleHttp\Client` 7.15.3, sem `timeout` nem `connect_timeout` explícitos. Opções adicionais em `config/scout.php` só têm efeito porque `AppServiceProvider::register()` substitui esse binding por um SDK que recebe `MeilisearchHttpClient`.

| Variável de ambiente | Configuração em `scout.meilisearch` | Padrão em segundos |
| --- | --- | --- |
| `MEILISEARCH_SEARCH_CONNECT_TIMEOUT` | `search_connect_timeout` | 1 |
| `MEILISEARCH_SEARCH_TIMEOUT` | `search_timeout` | 3 |
| `MEILISEARCH_OPERATIONS_CONNECT_TIMEOUT` | `operations_connect_timeout` | 10 |
| `MEILISEARCH_OPERATIONS_TIMEOUT` | `operations_timeout` | 300 |

O transporte implementa PSR-18 com Guzzle e seleciona os limites curtos para POST em `/indexes/{uid}/search`, `/indexes/{uid}/facet-search` e `/multi-search`, inclusive com prefixo de URL. As demais operações usam os limites maiores; importações, escrita de documentos e comandos não recebem o limite interativo. Valores menores que 0,1 segundo são ajustados para 0,1 para impedir timeout infinito por valor zero; valores não finitos usam o padrão da respectiva opção. Não há retry síncrono. Ao alterar essas variáveis, atualize o cache de configuração e reinicie workers persistentes conforme a rotina de implantação. Ajuste o limite operacional ao volume de importação e aos limites dos workers.

`SearchQuery::run()` delimita consultas de leitura e captura `ApiException`, `CommunicationException`, `TimeOutException`, `InvalidResponseBodyException`, `JsonDecodingException` e falhas do transporte PSR-18. Erros de encoding de requisição, programação, autorização e validação continuam propagando. As categorias técnicas separam timeout, comunicação/transporte, credenciais/permissões (401/403), servidor/limitação (5xx/429), resposta inválida, índice ausente e configuração da API (incluindo filtros, ordenação e atributos de pesquisa). O usuário recebe mensagem segura e ação de recuperação; detalhes do serviço não são exibidos.

O log `Meilisearch search unavailable` contém somente categoria, classe, status HTTP e códigos/tipos conhecidos por allowlist. Códigos desconhecidos ficam nulos. Não inclui exceção original, mensagem, stack trace, causa anterior, URL, índice, termos, documentos pessoais, e-mails, filtros, chaves nem corpos de resposta. A instância de `SearchQuery` é scoped e deduplica o mesmo diagnóstico dentro da requisição. A exceção interna `SearchUnavailable` não é reportada novamente. O seletor compartilhado usa esse mesmo caminho, substituindo o antigo `report($exception)`.

`HandlesSearchFailures` mantém falhas em memória apenas durante a requisição e oferece `retrySearch()` restrito a uma lista explícita de Computed. Resultados de busca são memorizados pelos Computed durante a renderização; não há polling nem repetição infinita. O seletor remoto mantém debounce e sequência contra respostas antigas. As consultas server-side preservam seus debounces e a ordenação de atualizações do Livewire. O botão de recuperação mantém os dados e invalida somente as dependências autorizadas. Fluxos de escrita/indexação não passam por essa recuperação; não há renderizador global que silencie suas falhas em `bootstrap/app.php`.

Os estados e a cobertura de telas estão descritos na [Fase 05 — Índices e integrações](doc:fase-05-administracao#indices-e-integracoes). Nesta tarefa não foram criados nem executados testes e não houve interrupção do serviço, alteração de credenciais ou índices para simular falhas. A confirmação visual dos estados de erro e recuperação depende de uma sessão autenticada e permanece pendente.

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
