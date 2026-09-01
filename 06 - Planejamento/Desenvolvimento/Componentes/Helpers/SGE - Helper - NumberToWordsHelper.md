---
title: SGE — Helper — NumberToWordsHelper
description: Conversão determinística de números e valores em reais para texto por extenso.
type: technical-reference
status: implemented
code_path: app/Helpers/NumberToWordsHelper.php
test_path: tests/Unit/Helpers/NumberToWordsHelperTest.php
tags:
  - sge/helpers
  - sge/documentos
  - sge/formatacao
aliases:
  - Helper de números por extenso
---
## Responsabilidade

Centralizar a escrita em português de números usados nos documentos. A implementação usa `Brick\Math\BigDecimal` para o valor monetário e `Illuminate\Support\Number` para escrever números. Não decide cláusulas, não consulta banco e não formata valores para persistência.

| Método | Entrada | Saída |
| --- | --- | --- |
| `cardinal()` | inteiro não negativo | número por extenso em português, como `cento e vinte`. |
| `brl()` | `string`, `int` ou `Brick\Math\BigDecimal` não negativo | valor completo, como `mil e duzentos reais e cinquenta centavos`. |

`brl()` será usado por `RemunerationParagraphFormatter`, que monta o §1º de remuneração em `${PARAGRAFO_REMUNERACAO}`, junto a [[SGE - Helper - CurrencyHelper|`CurrencyHelper`]] para o valor `R$ 1.200,50`.

## Implementação atual

- `cardinal()` rejeita inteiros negativos e delega a escrita para `Number::spell()`; se a conversão falhar, lança `RuntimeException`.
- `brl()` normaliza a entrada com `BigDecimal::of()` e `toScale(2)`, sem arredondar valores que tenham fração menor que um centavo.
- o locale de `Number::spell()` é o locale global configurado em `AppServiceProvider` por `Number::useLocale(config('app.locale'))`; o ambiente atual utiliza `pt_BR`.
- valores monetários negativos, inválidos ou com mais de duas casas decimais são rejeitados com `InvalidArgumentException`.
- `currencyPart()` aplica singular/plural de `real` e `centavo`; `brl()` omite a parcela igual a zero, exceto para o total `zero reais`.

## Regras

- usar `Number::spell()` com o locale global configurado no `AppServiceProvider` — atualmente `pt_BR` — e tratamento explícito de reais e centavos;
- receber valores monetários como `string`, `int` ou `BigDecimal`, nunca como `float`;
- normalizar valores com escala exata de duas casas, rejeitando entradas que exigiriam arredondamento;
- omitir a parcela igual a zero quando houver apenas reais ou apenas centavos; o valor total zero é `zero reais`;
- lançar `InvalidArgumentException` para negativos e entradas inválidas;
- tratar zero, um real, um centavo, negativos e valores sem centavos nos testes;
- não criar texto jurídico: o §1º é responsabilidade do serviço de documentos.

## Checklist

- [x] Definir uso no §1º de remuneração.
- [x] Implementar `cardinal()` e `brl()`.
- [x] Expor `numberToWords()` e `brlToWords()` em `app/helpers.php` para leitura em Blade.
- [x] Cobrir plurais, zeros, centavos e entradas inválidas com testes unitários.
- [x] Confirmar disponibilidade da extensão `intl` no ambiente de desenvolvimento.
- [ ] Confirmar disponibilidade da extensão `intl` na imagem/ambiente de produção.

## Relacionamentos

- [[SGE - Helper - CurrencyHelper|CurrencyHelper]]
- [[SGE - Migration - 16 - Generated documents|Documentos gerados]]
