---
id: enum-generateddocumentstatus
title: Enum — GeneratedDocumentStatus
description: Ciclo de vida de cada documento gerado ou registrado no estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/documentos
related: migration-16-generated-documents, fluxos-principais
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/GeneratedDocumentStatus.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/GeneratedDocumentStatusTest.php
---
> [!success] Estado
> Implementado em `app/Enums/GeneratedDocumentStatus.php`. O cast em `GeneratedDocument` e a Migration 16 já existem; as guardas de transição do fluxo ainda estão pendentes.

## Contrato

| Case                | Valor persistido     | Rótulo                |
| ------------------- | -------------------- | --------------------- |
| `Generated`         | `generated`          | Gerado                |
| `AwaitingSignature` | `awaiting_signature` | Aguardando assinatura |
| `Signed`            | `signed`             | Assinado              |
| `Cancelled`         | `cancelled`          | Cancelado             |

O status pertence ao documento, não ao estágio. `Cancelled` encerra o ciclo do documento e não cancela automaticamente o estágio. O cancelamento exige motivo e data; a autoria fica no Activity Log. O arquivo final não é armazenado pelo SGE.

A transição de um documento assinável para `AwaitingSignature` exige que o Setor informe o local de disponibilização para assinatura em campo textual genérico e, se optar por disparar o aviso, selecione ao menos um interessado elegível. A plataforma é somente um valor informado no registro; não é case do enum nem constante do sistema.

Quando a data de início vencer antes da assinatura, o documento continua `AwaitingSignature`: não há schedule para esse fato. Cancelamento, pendência documental e correção são decisões manuais do Setor, sempre com motivo e Activity Log. Uma reemissão só inicia novo ciclo documental depois de eventual correção ser aprovada, preservando o cancelado no histórico.

`OrientationCertificate` usa `Generated` e não passa por assinatura. Não existem os status `Registered` ou `Released` para documentos; `Released` pertence ao ciclo do estágio. Falhas técnicas de Job não viram status persistente sem decisão explícita.

## Checklist de implementação

- [x] Criar enum string e rótulos no código.
- [x] Implementar `options()` e `values()`.
- [x] Cobrir cases, valores, rótulos e opções com teste unitário.
- [x] Adicionar cast em `GeneratedDocument`.
- [x] Usar o valor inicial do enum na [migration de generated_documents](doc:migration-16-generated-documents).
- [ ] Implementar guardas para transições e documentos já assinados.
- [ ] Exigir local de disponibilização e validar os interessados selecionados na transição para `AwaitingSignature`.
- [ ] Testar geração, assinatura, cancelamento, reemissão e documento externo na integração documental.
- [ ] Atualizar [fluxo de documentos](doc:fluxos-principais#3-analise-e-formalizacao).
