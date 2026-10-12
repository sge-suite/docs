---
id: fase-00-preparacao
title: Fase 00 — Preparação
description: Checklist do ambiente, qualidade e fluxo de trabalho do projeto novo.
type: development-phase
status: completed
visibility: public
tags: sge/desenvolvimento, sge/checklist
related: fase-01-fundacao-de-dados
source_refs:
---
> [!success] Estado
> Concluída conforme o estado registrado no planejamento anterior. Se o ambiente mudar, reabra os itens afetados.

## Checklist

- [x] Confirmar o projeto Laravel irmão desta documentação em `../sge`.
- [x] Instalar dependências PHP e iniciar o Sail.
- [x] Criar `.env`, gerar a chave e validar PostgreSQL.
- [x] Executar `./vendor/bin/sail npm install` e validar o build do Vite.
- [x] Confirmar Mailpit e Meilisearch.
- [x] Executar a suíte que existia no ambiente antes de sua remoção.
- [x] Definir branches, commits e revisão.

## Critério de saída

- [x] O ambiente executa os comandos documentados.
- [x] Configuração do ambiente validada antes do início do domínio novo.

## Próxima fase

[Fase 01 — Fundação de dados](doc:fase-01-fundacao-de-dados)
