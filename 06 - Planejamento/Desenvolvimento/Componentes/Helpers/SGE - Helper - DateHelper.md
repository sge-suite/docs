---
title: SGE — Helper — DateHelper
description: Formatação de datas e horários com timezone configurado na aplicação.
type: technical-reference
status: implemented
code_path: app/Helpers/DateHelper.php
test_path: tests/Unit/Helpers/FormattingHelpersTest.php
tags:
  - sge/helpers
  - sge/formatacao
  - sge/data
aliases:
  - Helper de data
---
## Responsabilidade

Classe final para apresentação de `string|DateTimeInterface|null`. Toda data não nula passa por `Carbon::parse()` e é convertida para `config('app.timezone')`.

| Método                  | Formato/resultado                                         |
| ----------------------- | --------------------------------------------------------- |
| `format()`              | `D de MMMM de YYYY`, por exemplo `10 de janeiro de 2024`. |
| `formatShort()`         | `DD/MM/YYYY`.                                             |
| `formatRelative()`      | `diffForHumans()`, relativo ao momento atual.             |
| `formatDateTime()`      | `d/m/Y às H:i`.                                           |
| `formatMonthYear()`     | `MM/YYYY`.                                                |
| `formatMonthYearFull()` | `MMMM YYYY` com título em português.                      |
| entrada `null`          | `-` em todos os métodos.                                  |

## Cuidados

- `formatRelative()` depende do relógio atual; testes devem congelar o tempo quando necessário.
- O timezone é o da configuração da aplicação, não necessariamente o timezone da string de entrada.
- `formatMonthYearFull()` usa `Str::title()` após `isoFormat()`.
- Não usar o helper para cálculos de prazo do domínio; usar Carbon/serviço de regra e formatar apenas na saída.

## Checklist

- [x] Implementar os seis formatos.
- [x] Tratar `null` com placeholder `-`.
- [x] Aplicar timezone configurado.
- [x] Expor funções correspondentes em `app/helpers.php`.
- [x] Testar `DateTimeImmutable` e conversão de UTC para `America/Sao_Paulo`.
- [ ] Adicionar testes para mês por extenso, relativo, entrada inválida e mudança de timezone.
- [ ] Confirmar locale de `Carbon` em todos os ambientes.

## Relacionamentos

- [[SGE - Helper - Global helpers|Funções globais]]
- [[SGE - Providers|Providers]]
