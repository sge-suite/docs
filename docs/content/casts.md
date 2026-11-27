---
id: casts
title: Casts
description: Índice dos casts Eloquent que transformam dados entre entrada, domínio e banco.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/casts, sge/checklist
related: cast-cpfcast, cast-phonecast, componentes-tecnicos, helpers, migration-02-user-personal-data
source_refs:
---
## Inventário

- [`CpfCast`](doc:cast-cpfcast) — valida e persiste CPF somente com dígitos (normalizando valores em branco para `null`).
- [`PhoneCast`](doc:cast-phonecast) — valida telefone fixo ou celular com DDD e persiste somente os dígitos.
- `CnpjCast` — valida e normaliza CNPJ (numérico ou alfanumérico) sem máscara antes da persistência.
- `AffiliationTypeCast` — converte o tipo de vínculo para `AffiliationType`, mapeando o valor legado `campus_administrator` para `internship_office` em leitura e escrita.

## Checklist comum

- [ ] Definir comportamento de `null`, vazio, formato inválido e valor já normalizado.
- [ ] Separar normalização de apresentação: banco guarda formato canônico, tela formata.
- [ ] Definir a exceção lançada e a camada que a converte em erro de validação.
- [ ] Garantir que serialização não exponha dados além do necessário.
- [ ] Criar testes para `get()`, `set()`, nulo, formato mascarado, formato limpo e inválido.
- [ ] Registrar o Model que usa o cast e a migration da coluna.

## Navegação

- [Componentes técnicos](doc:componentes-tecnicos)
- [Helpers](doc:helpers)
- [Migration de dados pessoais](doc:migration-02-user-personal-data)
