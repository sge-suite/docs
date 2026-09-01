---
title: SGE — Ambiente de desenvolvimento
description: Requisitos e comandos para preparar e executar o ambiente local de desenvolvimento do SGE.
type: development-guide
status: maintained
tags:
  - sge/desenvolvimento
  - sge/operacao
aliases:
  - Ambiente de desenvolvimento do SGE
---
## Para quem esta página serve

Esta página é destinada a quem prepara o ambiente de desenvolvimento do SGE. Pessoas que apenas usam o sistema não precisam executar estes comandos: para entender o processo, devem começar em [[SGE - Visão geral]] ou [[SGE - Pessoas e responsabilidades]].

Os comandos abaixo criam uma cópia local do sistema para desenvolvimento e testes; eles não devem ser executados em um computador institucional de produção sem orientação da equipe técnica.

## Requisitos

- Docker Engine ou Docker Desktop com Docker Compose v2.
- Git.
- Composer e PHP 8.3+ apenas para o bootstrap local; a execução principal ocorre pelo Sail.

O `compose.yaml` utiliza Laravel Sail com runtime PHP 8.5, PostgreSQL 18, Meilisearch e Mailpit.

## Primeira configuração

```bash
cd /caminho/para/o/projeto/sge
composer install
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
```

Se o arquivo `.env` não existir, ele deve ser criado antes de iniciar os serviços. O Sail executa PHP, Artisan, Composer, NPM e os serviços definidos em `compose.yaml` dentro do ambiente Docker.

Para facilitar os comandos, pode-se criar um alias na sessão do terminal:

```bash
alias sail='./vendor/bin/sail'
```

Depois disso, `sail artisan ...` equivale a `./vendor/bin/sail artisan ...`.

## Comandos úteis

```bash
./vendor/bin/sail up -d
./vendor/bin/sail down
./vendor/bin/sail logs -f laravel.test
./vendor/bin/sail shell
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan test
./vendor/bin/sail composer run lint:check
./vendor/bin/sail composer run types:check
./vendor/bin/sail composer run test
./vendor/bin/sail npm run dev
```

Para o desenvolvimento contínuo, o projeto também possui o script Composer `dev`:

```bash
./vendor/bin/sail composer run dev
```

## Serviços locais

| Serviço     | Endereço padrão         | Uso                                           |
| ----------- | ----------------------- | --------------------------------------------- |
| Aplicação   | `http://localhost`      | Interface web.                                |
| Vite        | `http://localhost:5173` | Assets e hot reload.                          |
| Mailpit     | `http://localhost:8025` | Visualização dos e-mails enviados localmente. |
| Meilisearch | `http://localhost:7700` | Busca local.                                  |
| PostgreSQL  | `localhost:5432`        | Banco local, conforme as variáveis do `.env`. |

As portas podem ser alteradas no `.env` por `APP_PORT`, `VITE_PORT`, `FORWARD_DB_PORT`, `FORWARD_MAILPIT_DASHBOARD_PORT` e `FORWARD_MEILISEARCH_PORT`.

## Cuidados

> [!danger] Segredos e dados reais
> Nunca versionar `.env`, credenciais de provedores externos ou dados reais. Alterações de banco, fluxo ou regra devem atualizar também a documentação relacionada.

- Nunca registrar `.env` ou credenciais de provedores externos no Git.
- Não usar dados reais em testes locais.
- Não executar `php artisan` ou `npm` no host quando a intenção for usar o ambiente do projeto; prefira o prefixo `./vendor/bin/sail`.
- Para apagar volumes e dados locais, confirmar o alvo antes de usar comandos destrutivos do Docker.
- Toda migration deve ser revisável e reversível quando possível.
- Atualizar a documentação junto com alterações de fluxo ou banco.
