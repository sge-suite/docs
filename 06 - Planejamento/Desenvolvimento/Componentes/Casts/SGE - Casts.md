---
title: SGE — Casts
description: Índice dos casts Eloquent que transformam dados entre entrada, domínio e banco.
type: technical-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/casts
  - sge/checklist
aliases:
  - Índice de casts do SGE
---
## Inventário

- [[SGE - Cast - CpfCast|`CpfCast`]] — valida e persiste CPF somente com dígitos.

## Checklist comum

- [ ] Definir comportamento de `null`, vazio, formato inválido e valor já normalizado.
- [ ] Separar normalização de apresentação: banco guarda formato canônico, tela formata.
- [ ] Definir a exceção lançada e a camada que a converte em erro de validação.
- [ ] Garantir que serialização não exponha dados além do necessário.
- [ ] Criar testes para `get()`, `set()`, nulo, formato mascarado, formato limpo e inválido.
- [ ] Registrar o Model que usa o cast e a migration da coluna.

## Navegação

- [[SGE - Componentes técnicos]]
- [[SGE - Helpers]]
- [[SGE - Migration - 02 - User personal data|Migration de dados pessoais]]
