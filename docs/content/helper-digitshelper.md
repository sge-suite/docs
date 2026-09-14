---
id: helper-digitshelper
title: Helper — DigitsHelper
description: Normalização de valores para uma sequência de dígitos.
type: technical-reference
status: implemented
visibility: public
tags: sge/helpers, sge/formatacao
related: helper-braziliandocumenthelper, helper-braziliancontacthelper, helper-brazilianaddresshelper, helper-funcoes-globais
source_refs: ../../sge/app/Helpers/DigitsHelper.php, ../../sge/tests/Unit/Helpers/FormattingHelpersTest.php
---
## Responsabilidade

`DigitsHelper::only()` remove todo caractere não numérico de um valor. `null` retorna uma string vazia. É a base de normalização compartilhada pelos formatadores de CPF/CNPJ, telefone e CEP; não valida documento nem decide formato de apresentação.

## Checklist

- [x] Implementar extração de dígitos e tratamento de `null`.
- [x] Reutilizar a regra em helpers brasileiros.
- [x] Expor `unmask()` como fachada global.
- [ ] Cobrir entradas vazias, máscaras e caracteres não numéricos em teste unitário direto.

## Relacionamentos

- [Helper — BrazilianDocumentHelper](doc:helper-braziliandocumenthelper)
- [Helper — BrazilianContactHelper](doc:helper-braziliancontacthelper)
- [Helper — BrazilianAddressHelper](doc:helper-brazilianaddresshelper)
- [Funções globais](doc:helper-funcoes-globais)
