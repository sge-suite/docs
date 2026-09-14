---
id: helper-braziliandocumenthelper
title: Helper — BrazilianDocumentHelper
description: Formatação de CPF e CNPJ brasileiros a partir de valores normalizados.
type: technical-reference
status: implemented
visibility: public
tags: sge/helpers, sge/documentos, sge/formatacao
related: cast-cpfcast, helper-digitshelper, helper-funcoes-globais
source_refs: ../../sge/app/Helpers/BrazilianDocumentHelper.php, ../../sge/tests/Unit/Helpers/FormattingHelpersTest.php
---
## Responsabilidade

Formata CPF, CNPJ e valores cuja natureza depende da quantidade de dígitos. Não valida dígitos verificadores: validação de CPF na fronteira de persistência continua em [`CpfCast`](doc:cast-cpfcast) ou no validator apropriado.

| Método | Comportamento |
| --- | --- |
| `formatCpf()` | Formata 11 dígitos como `000.000.000-00`; entrada inválida é preservada. |
| `formatCnpj()` | Formata 14 dígitos como `00.000.000/0000-00`; entrada inválida é preservada. |
| `formatCpfCnpj()` | Escolhe CPF/CNPJ pelo tamanho; entrada vazia vira `-`. |

## Checklist

- [x] Implementar CPF, CNPJ e escolha automática por tamanho.
- [x] Reutilizar [DigitsHelper](doc:helper-digitshelper).
- [x] Expor fachadas globais equivalentes.
- [ ] Cobrir valores mascarados e tamanhos inválidos em testes unitários diretos.

## Relacionamentos

- [Helper — DigitsHelper](doc:helper-digitshelper)
- [Funções globais](doc:helper-funcoes-globais)
- [CpfCast](doc:cast-cpfcast)
