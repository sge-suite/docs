---
title: SGE — Helper — DigitsHelper
description: Normalização de valores para uma sequência de dígitos.
type: technical-reference
status: implemented
code_path: app/Helpers/DigitsHelper.php
test_path: tests/Unit/Helpers/FormattingHelpersTest.php
tags:
  - sge/helpers
  - sge/formatacao
aliases:
  - Helper de dígitos
---
## Responsabilidade

`DigitsHelper::only()` remove todo caractere não numérico de um valor. `null` retorna uma string vazia. É a base de normalização compartilhada pelos formatadores de CPF/CNPJ, telefone e CEP; não valida documento nem decide formato de apresentação.

## Checklist

- [x] Implementar extração de dígitos e tratamento de `null`.
- [x] Reutilizar a regra em helpers brasileiros.
- [x] Expor `unmask()` como fachada global.
- [ ] Cobrir entradas vazias, máscaras e caracteres não numéricos em teste unitário direto.

## Relacionamentos

- [[SGE - Helper - BrazilianDocumentHelper]]
- [[SGE - Helper - BrazilianContactHelper]]
- [[SGE - Helper - BrazilianAddressHelper]]
- [[SGE - Helper - Global helpers|Funções globais]]
