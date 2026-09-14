---
id: helper-funcoes-globais
title: Helper — Funções globais
description: Funções globais carregadas pelo Composer que delegam a helpers de domínio.
type: technical-reference
status: implemented
visibility: public
tags: sge/helpers, sge/formatacao
related: helpers, helper-datehelper, helper-currencyhelper, helper-numbertowordshelper, helper-digitshelper, helper-braziliandocumenthelper, helper-braziliancontacthelper, helper-brazilianaddresshelper, componentes-tecnicos
source_refs: https://github.com/sge-suite/sge/blob/master/app/helpers.php
---
## Como são carregadas

O arquivo é registrado em `composer.json` no autoload `files`, portanto as funções ficam disponíveis sem `use` após o autoload do Composer. Cada função verifica `function_exists()` antes de declarar e delega para uma classe final em `App\Helpers`.

## Catálogo

| Função                  | Delegação                                  |
| ----------------------- | ------------------------------------------ |
| `formatDate()`          | `DateHelper::format()`                     |
| `formatShort()`         | `DateHelper::formatShort()`                |
| `formatDateTime()`      | `DateHelper::formatDateTime()`             |
| `formatRelative()`      | `DateHelper::formatRelative()`             |
| `formatMonthYear()`     | `DateHelper::formatMonthYear()`            |
| `formatMonthYearFull()` | `DateHelper::formatMonthYearFull()`        |
| `formatCurrency()`      | `CurrencyHelper::format()`                 |
| `numberToWords()`       | `NumberToWordsHelper::cardinal()`          |
| `brlToWords()`          | `NumberToWordsHelper::brl()`               |
| `unmask()`              | `DigitsHelper::only()`                     |
| `formatCpf()`           | `BrazilianDocumentHelper::formatCpf()`     |
| `formatCnpj()`          | `BrazilianDocumentHelper::formatCnpj()`    |
| `formatCpfCnpj()`       | `BrazilianDocumentHelper::formatCpfCnpj()` |
| `formatPhone()`         | `BrazilianContactHelper::formatPhone()`    |
| `formatCep()`           | `BrazilianAddressHelper::formatCep()`      |

## Regra de uso

- Use funções globais em Blade/Livewire quando a chamada ficar mais legível.
- Use classes diretamente em PHP de domínio, testes ou quando a origem da regra precisar ser explícita.
- Não adicionar regra nova somente na função global; implemente na classe e delegue.
- Não usar helpers para autorização, consulta ao banco, mutação ou efeitos colaterais.

## Checklist

- [x] Registrar o arquivo no autoload do Composer.
- [x] Criar guardas `function_exists()`.
- [x] Manter delegação um-para-um para as classes de helper.
- [x] Expor `numberToWords()` e `brlToWords()` como fachada do `NumberToWordsHelper`.
- [ ] Criar teste de contrato para cada função global; `numberToWords()` e `brlToWords()` já são cobertos em `NumberToWordsHelperTest`.
- [ ] Documentar colisões de nomes com pacotes/framework antes de adicionar função.
- [x] Executar `composer dump-autoload` após criar/renomear função.
- [x] Atualizar [Helpers](doc:helpers) ao alterar o catálogo.

## Relacionamentos

- [DateHelper](doc:helper-datehelper)
- [CurrencyHelper](doc:helper-currencyhelper)
- [NumberToWordsHelper](doc:helper-numbertowordshelper)
- [DigitsHelper](doc:helper-digitshelper)
- [BrazilianDocumentHelper](doc:helper-braziliandocumenthelper)
- [BrazilianContactHelper](doc:helper-braziliancontacthelper)
- [BrazilianAddressHelper](doc:helper-brazilianaddresshelper)
- [Componentes técnicos](doc:componentes-tecnicos)
