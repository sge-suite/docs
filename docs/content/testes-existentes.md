---
id: testes-existentes
title: Testes automatizados
description: Estado atual da suíte e decisão sobre validação automatizada antes da produção.
type: technical-reference
status: maintained
visibility: public
tags: sge/desenvolvimento, sge/testes, sge/checklist
related: desenvolvimento-checklist-de-funcionalidade, fases-de-desenvolvimento
---

## Estado atual

A suíte de testes foi removida por decisão explícita do projeto. Não há arquivos de testes de calendário ou das demais funcionalidades no repositório atual. As dependências existentes não significam que haja uma suíte implementada.

A instrução explícita do responsável é não criar nem executar testes nesta etapa; ela prevalece sobre a orientação geral do `AGENTS.md` para testes de cada alteração.

## Conferências atuais

Usar formatação com Pint, conferência de sintaxe PHP, compilação de views Blade e build do frontend, conforme os arquivos alterados. Essas conferências não comprovam regras funcionais ou autorização em execução.

Não aplicar migrations nem recriar bancos por iniciativa do agente. Uma futura retomada de testes exige nova decisão do responsável.
