---
title: SGE — Helper — BrazilianDocumentHelper
description: Formatação de CPF e CNPJ brasileiros a partir de valores normalizados.
type: technical-reference
status: implemented
code_path: app/Helpers/BrazilianDocumentHelper.php
test_path: tests/Unit/Helpers/FormattingHelpersTest.php
tags:
  - sge/helpers
  - sge/documentos
  - sge/formatacao
aliases:
  - Helper de CPF e CNPJ
---
## Responsabilidade

Formata CPF, CNPJ e valores cuja natureza depende da quantidade de dígitos. Não valida dígitos verificadores: validação de CPF na fronteira de persistência continua em [[SGE - Cast - CpfCast|`CpfCast`]] ou no validator apropriado.

| Método | Comportamento |
| --- | --- |
| `formatCpf()` | Formata 11 dígitos como `000.000.000-00`; entrada inválida é preservada. |
| `formatCnpj()` | Formata 14 dígitos como `00.000.000/0000-00`; entrada inválida é preservada. |
| `formatCpfCnpj()` | Escolhe CPF/CNPJ pelo tamanho; entrada vazia vira `-`. |

## Checklist

- [x] Implementar CPF, CNPJ e escolha automática por tamanho.
- [x] Reutilizar [[SGE - Helper - DigitsHelper|DigitsHelper]].
- [x] Expor fachadas globais equivalentes.
- [ ] Cobrir valores mascarados e tamanhos inválidos em testes unitários diretos.

## Relacionamentos

- [[SGE - Helper - DigitsHelper]]
- [[SGE - Helper - Global helpers|Funções globais]]
- [[SGE - Cast - CpfCast|CpfCast]]
