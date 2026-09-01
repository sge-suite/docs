---
title: SGE — Enum — GeneratedDocumentStatus
description: Ciclo de vida de cada documento gerado ou registrado no estágio.
type: enum-reference
status: implemented
domain: documents
code_path: app/Enums/GeneratedDocumentStatus.php
tags:
  - sge/enums
  - sge/documentos
aliases:
  - Enum de status do documento gerado
---
> [!success] Estado
> Implementado em `app/Enums/GeneratedDocumentStatus.php`. A integração com `generated_documents` e as transições ainda está pendente.

## Contrato

| Case                | Valor persistido     | Rótulo                |
| ------------------- | -------------------- | --------------------- |
| `Generated`         | `generated`          | Gerado                |
| `AwaitingSignature` | `awaiting_signature` | Aguardando assinatura |
| `Signed`            | `signed`             | Assinado              |
| `Cancelled`         | `cancelled`          | Cancelado             |

O status pertence ao documento, não ao estágio. `Cancelled` encerra o ciclo do documento e não cancela automaticamente o estágio. O cancelamento exige motivo, data e o vínculo responsável. O arquivo final não é armazenado pelo SGE.

A transição de um documento assinável para `AwaitingSignature` exige que o Setor informe o local de disponibilização para assinatura em campo textual genérico e, se optar por disparar o aviso, selecione ao menos um interessado elegível. A plataforma é somente um valor informado no registro; não é case do enum nem constante do sistema.

Quando a data de início vencer antes da assinatura, o documento continua `AwaitingSignature`: não há schedule para esse fato. Cancelamento, pendência documental e correção são decisões manuais do Setor, sempre com motivo e Activity Log. Uma reemissão só inicia novo ciclo documental depois de eventual correção ser aprovada, preservando o cancelado no histórico.

`OrientationCertificate` usa `Generated` e não passa por assinatura. Não existem os status `Registered` ou `Released` para documentos; `Released` pertence ao ciclo do estágio. Falhas técnicas de Job não viram status persistente sem decisão explícita.

## Checklist de implementação

- [x] Criar enum string e rótulos no código.
- [x] Implementar `options()` e `values()`.
- [ ] Adicionar cast em `GeneratedDocument`.
- [ ] Usar o enum na [[SGE - Migration - 16 - Generated documents|migration de generated_documents]].
- [ ] Implementar guardas para transições e documentos já assinados.
- [ ] Exigir local de disponibilização e validar os interessados selecionados na transição para `AwaitingSignature`.
- [ ] Testar geração, assinatura, cancelamento, reemissão e documento externo.
- [ ] Atualizar [[SGE - Fluxos principais#3 Análise e formalização|fluxo de documentos]].
