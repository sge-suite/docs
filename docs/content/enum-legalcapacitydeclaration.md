---
id: enum-legalcapacitydeclaration
title: Enum — LegalCapacityDeclaration
description: Opção declarada pelo discente para a capacidade civil no formulário de abertura.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/estagio, sge/formularios
related: migration-19-internship-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/LegalCapacityDeclaration.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/LegalCapacityDeclarationTest.php
---
> [!info] Escopo
> A classe e os testes unitários já existem. A integração com o formulário, a migration e a análise do comprovante ainda está planejada. Este enum registra a opção escolhida no formulário; não substitui a data de nascimento nem aprova automaticamente uma emancipação.

## Contrato

| Case | Valor persistido | Rótulo | Regra no envio |
| --- | --- | --- | --- |
| `Adult` | `adult` | Maior de idade | Aceito somente se a data de nascimento indicar 18 anos completos. Não pede responsável legal. |
| `Minor` | `minor` | Menor de idade | Exige nome, CPF, parentesco e e-mail do responsável legal. |
| `EmancipatedMinor` | `emancipated_minor` | Menor emancipado | Exige anexo privado do comprovante e dispensa os dados do responsável até a análise do Setor. |

Em `Draft`, a opção pode ser nula. Fora de rascunho, ela é obrigatória. A escolha `adult` incompatível com a data de nascimento é recusada no servidor. Para `emancipated_minor`, a solicitação pode ser enviada e segue para análise manual; a escolha não altera os dados pessoais nem vale como aprovação. Se o Setor devolver o comprovante como inválido, a correção indica a seção de capacidade civil: o discente pode enviar novo comprovante ou mudar a opção para `minor`, caso em que informa o responsável legal.

## Checklist

- [x] Criar enum string com `values()` e `options()`.
- [ ] Usar na [solicitação de estágio](doc:migration-19-internship-requests).
- [x] Testar cases, valores, rótulos e opções.
- [ ] Testar divergência com a data de nascimento, anexo ausente e devolução do comprovante no fluxo de domínio.
- [ ] Exibir rótulos em português somente na interface.
