---
id: enum-legalcapacitydeclaration
title: Enum — LegalCapacityDeclaration
description: Capacidade civil do discente determinada pela data de nascimento ou declarada quando menor.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/estagio, sge/formularios
related: migration-19-internship-requests
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/LegalCapacityDeclaration.php
---
> [!info] Escopo
> A classe, o cast no Model e a coluna da Migration 19 já existem. A data de nascimento define automaticamente a maioridade; o enum registra uma declaração somente para menores. Envio privado, análise manual e conferência da evidência no aceite estão implementados. O enum não substitui a data de nascimento nem aprova automaticamente uma emancipação.

## Contrato

| Case | Valor persistido | Rótulo | Regra no envio |
| --- | --- | --- | --- |
| `Adult` | `adult` | Maior de idade | Definido automaticamente quando a data de nascimento indicar 18 anos completos; não é opção manual. |
| `Minor` | `minor` | Menor de idade | Exige nome, CPF, parentesco e e-mail do responsável legal. |
| `EmancipatedMinor` | `emancipated_minor` | Menor emancipado | Exige anexo privado do comprovante e dispensa os dados do responsável até a análise do Setor. |

Em `Draft`, a opção pode ser nula enquanto os dados pessoais estiverem incompletos. Quando a data indica maioridade, o sistema grava `adult`; menores precisam escolher uma das outras duas opções. Para `emancipated_minor`, a solicitação pode ser enviada e segue para análise manual; a escolha não altera os dados pessoais nem vale como aprovação. Se o Setor devolver o comprovante como inválido, a correção indica a seção de capacidade civil: o discente pode enviar novo comprovante ou mudar a opção para `minor`, caso em que informa o responsável legal.

## Checklist

- [x] Criar enum string com `values()` e `options()`.
- [x] Usar na [solicitação de estágio](doc:migration-19-internship-requests).
- [ ] Testar cases, valores, rótulos e opções.
- [ ] Testar divergência da opção `adult` com a data de nascimento e os campos obrigatórios de `minor`.
- [ ] Testar anexo ausente e devolução do comprovante após a Migration 19A.
- [x] Calcular maioridade a partir da data de nascimento e exigir declaração somente de menores.
