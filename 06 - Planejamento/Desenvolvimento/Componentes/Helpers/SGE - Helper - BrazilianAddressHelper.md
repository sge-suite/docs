---
title: SGE — Helper — BrazilianAddressHelper
description: Formatação de CEP brasileiro para apresentação.
type: technical-reference
status: implemented
code_path: app/Helpers/BrazilianAddressHelper.php
test_path: tests/Unit/Helpers/FormattingHelpersTest.php
tags:
  - sge/helpers
  - sge/endereco
  - sge/formatacao
aliases:
  - Helper de CEP
---
## Responsabilidade

`formatCep()` converte oito dígitos para o formato `00000-000`. Entrada vazia retorna `-`; um valor que não possua oito dígitos retorna como foi informado. O helper apenas apresenta o CEP e não consulta serviços externos.

## Checklist

- [x] Implementar formatação de CEP com oito dígitos.
- [x] Reutilizar [[SGE - Helper - DigitsHelper|DigitsHelper]].
- [x] Expor `formatCep()` como fachada global.
- [ ] Cobrir CEP mascarado, vazio e inválido em teste unitário direto.

## Relacionamentos

- [[SGE - Helper - DigitsHelper]]
- [[SGE - Helper - Global helpers|Funções globais]]
