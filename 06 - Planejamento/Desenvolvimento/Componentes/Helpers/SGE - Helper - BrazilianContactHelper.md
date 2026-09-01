---
title: SGE — Helper — BrazilianContactHelper
description: Formatação de telefones brasileiros locais, com DDD e com DDI 55.
type: technical-reference
status: implemented
code_path: app/Helpers/BrazilianContactHelper.php
test_path: tests/Unit/Helpers/FormattingHelpersTest.php
tags:
  - sge/helpers
  - sge/contato
  - sge/formatacao
aliases:
  - Helper de telefone brasileiro
---
## Responsabilidade

Formata números brasileiros com 8 a 13 dígitos. Valores de 12 ou 13 dígitos que não começam em `55` são devolvidos sem máscara para não transformar telefones internacionais incorretamente.

| Tamanho | Formato |
| --- | --- |
| 8/9 | Número local |
| 10/11 | DDD brasileiro |
| 12/13 iniciando em `55` | DDI `+55` e DDD |

Entrada vazia retorna `-`; tamanho não reconhecido retorna o valor original.

## Checklist

- [x] Implementar formatos local, DDD e DDI 55.
- [x] Preservar números internacionais não brasileiros.
- [x] Expor `formatPhone()` como fachada global.
- [ ] Cobrir todos os tamanhos e casos inválidos em testes unitários diretos.

## Relacionamentos

- [[SGE - Helper - DigitsHelper]]
- [[SGE - Helper - Global helpers|Funções globais]]
