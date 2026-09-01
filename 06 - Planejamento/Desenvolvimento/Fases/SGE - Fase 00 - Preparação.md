---
title: SGE — Fase 00 — Preparação
description: Checklist do ambiente, qualidade e fluxo de trabalho do projeto novo.
type: development-phase
status: completed
order: 0
tags:
  - sge/desenvolvimento
  - sge/checklist
---
> [!success] Estado
> Concluída conforme o estado registrado no guia anterior. Se o ambiente mudar, reabra os itens afetados.

## Checklist

- [x] Confirmar o projeto Laravel irmão deste vault em `../sge`.
- [x] Instalar dependências PHP e iniciar o Sail.
- [x] Criar `.env`, gerar a chave e validar PostgreSQL.
- [x] Executar `./vendor/bin/sail npm install` e validar o build do Vite.
- [x] Confirmar Mailpit e Meilisearch.
- [x] Executar `./vendor/bin/sail composer run test`.
- [x] Confirmar lint, análise estática e testes antes de novas migrations.
- [x] Definir branches, commits e revisão.

## Critério de saída

- [x] O ambiente executa os comandos documentados.
- [x] A suíte existente passa antes de iniciar o domínio novo.

## Próxima fase

[[SGE - Fase 01 - Contratos de e-mail|Fase 01 — Contratos de e-mail e notificações]]
