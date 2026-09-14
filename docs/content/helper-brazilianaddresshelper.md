---
id: helper-brazilianaddresshelper
title: Helper — BrazilianAddressHelper
description: Formatação de CEP brasileiro para apresentação.
type: technical-reference
status: implemented
visibility: public
tags: sge/helpers, sge/endereco, sge/formatacao
related: helper-digitshelper, helper-funcoes-globais
source_refs: https://github.com/sge-suite/sge/blob/master/app/Helpers/BrazilianAddressHelper.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/FormattingHelpersTest.php
---
## Responsabilidade

`formatCep()` converte oito dígitos para o formato `00000-000`. Entrada vazia retorna `-`; um valor que não possua oito dígitos retorna como foi informado. O helper apenas apresenta o CEP e não consulta serviços externos.

## Checklist

- [x] Implementar formatação de CEP com oito dígitos.
- [x] Reutilizar [DigitsHelper](doc:helper-digitshelper).
- [x] Expor `formatCep()` como fachada global.
- [ ] Cobrir CEP mascarado, vazio e inválido em teste unitário direto.

## Relacionamentos

- [Helper — DigitsHelper](doc:helper-digitshelper)
- [Funções globais](doc:helper-funcoes-globais)
