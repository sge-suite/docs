---
title: SGE — Helper — CurrencyHelper
description: Formatação de valores monetários usando locale e moeda configurados.
type: technical-reference
status: implemented
code_path: app/Helpers/CurrencyHelper.php
tags:
  - sge/helpers
  - sge/formatacao
aliases:
  - Helper de moeda
---
## Responsabilidade

Classe final com um método estático para formatar moeda usando `Illuminate\Support\Number::currency`.

| Método      | Entrada | Saída                                                              |
| ----------- | ------- | ------------------------------------------------------------------ |
| `format(int | float   | null $value, string $currency = 'BRL', ?string $locale = 'pt_BR')` | número, `null`, código ISO e locale | string formatada; `null` vira zero e falha do formatter vira string vazia. |

Exemplo esperado em `pt_BR`: `formatCurrency(1234.5)` → `R$ 1.234,50`, conforme o formatter do Laravel.

## Decisões

- O padrão é BRL/`pt_BR`.
- O locale pode ser sobrescrito por chamada.
- O `AppServiceProvider` também configura locale e moeda globais.
- O helper é apenas de apresentação; não deve converter valor para centavos nem persistir dinheiro.

## Checklist

- [x] Implementar `format()` com `Number::currency`.
- [x] Tratar `null` como zero.
- [x] Expor `formatCurrency()` em `app/helpers.php`.
- [ ] Cobrir o helper diretamente com testes de BRL, locale alternativo, zero, negativo e `null`.
- [ ] Confirmar se falha deve retornar `''` ou gerar erro observável.
- [ ] Documentar o formato monetário adotado no domínio quando valores forem adicionados.

## Relacionamentos

- [[SGE - Helper - Global helpers|Funções globais]]
- [[SGE - Providers|Providers]]
- [[SGE - Helpers]]
