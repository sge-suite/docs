---
title: SGE — Migration 16 — generated_documents
description: Contrato dos documentos gerados ou registrados no estágio.
type: migration-reference
status: planned
order: 16
table: generated_documents
tags:
  - sge/migrations
  - sge/documentos
  - sge/historico
---
> [!todo] Estado
> Planejada. Depende de [[SGE - Migration - 15 - Internships|`internships`]], [[SGE - Migration - 14 - Template versions|`template_versions`]] e dos enums documentais.

## Contrato

| Campo                 | Regra                                                                 |
| --------------------- | --------------------------------------------------------------------- |
| `id`                  | bigint, chave primária.                                               |
| `internship_id`       | FK obrigatória.                                                       |
| `template_version_id` | nullable; obrigatório para origem `sge` e nulo para `granting_party`. |
| `origin`              | `sge` ou `granting_party`, conforme `GeneratedDocumentOrigin`.        |
| `type`                | [[SGE - Enum - GeneratedDocumentType]] (`GeneratedDocumentType`).     |
| `status`              | [[SGE - Enum - GeneratedDocumentStatus]] (`GeneratedDocumentStatus`). |
| `signature_availability_location` | texto curto nullable; obrigatório ao mover documento assinável para `awaiting_signature`, com o local informado pelo Setor. |
| `snapshot`            | JSONB dos dados usados na geração; obrigatório para `sge` e nulo para `granting_party`. |
| `generation_token`    | UUID idempotente, único para impedir duplicação por retry da mesma ação.        |
| `output_filename` / `template_sha256` | nome entregue e hash do template usado; não são caminho de arquivo final. |
| `generated_by_affiliation_id` / `generated_at` | autoria e instante da geração bem-sucedida. |
| `cancelled_at`        | timestamp nullable, obrigatório quando o documento for cancelado.     |
| `cancellation_reason` | texto nullable, obrigatório quando o documento for cancelado.         |
| `cancelled_by_affiliation_id` | FK nullable para o vínculo que efetuou ou confirmou o cancelamento. |
| timestamps            | auditoria.                                                            |

O SGE registra a geração ou a existência, mas não armazena PDF, DOCX de saída ou documentos assinados. Armazena apenas templates, versões e snapshots. Para documento de origem `sge`, a `snapshot` preserva o catálogo/valores resolvidos, os valores monetários e o texto do §1º de remuneração efetivamente inserido no marcador `${PARAGRAFO_REMUNERACAO}`. Nunca inclui prova de emancipação, token, senha ou log. O status de assinatura é do documento; cancelar o documento não cancela automaticamente o estágio.

O arquivo é produzido em diretório privado temporário, transmitido e removido em `finally`. Geração em lote futura poderá manter temporário com expiração curta, sem convertê-lo em acervo. O contrato operacional completo está em [[SGE - Geração de documentos DOCX e variáveis]].

Ao mudar um documento assinável para `awaiting_signature`, o Setor informa o campo **Local de disponibilização para assinatura**. Ele é texto livre de até 500 caracteres, por exemplo “SIPAC” ou “portal institucional de assinaturas”; o nome de uma plataforma não é constante, enum nem regra do código. O valor permanece como contexto histórico da disponibilização, inclusive depois de assinado ou cancelado.

Na mesma tela, o Setor pode marcar os interessados que receberão o aviso imediatamente. As opções são calculadas a partir das partes atuais do estágio e do tipo documental — discente, orientador, supervisor e, quando houver e-mail cadastrado, contato da concedente — e não aceitam digitação livre de destinatário. Ao confirmar o envio, pelo menos um interessado deve estar selecionado. O Activity Log registra a transição, o local e a quantidade/categorias escolhidas, sem copiar endereços de e-mail; os snapshots de destinatário e conteúdo pertencem às estruturas de comunicação.

Um aditivo é um `generated_documents` com `type = addendum`, versão de template e snapshot próprios.

## Regras de combinação

- `origin = sge` exige template e snapshot da geração.
- `origin = granting_party` registra somente a existência do documento, exige `template_version_id = null`, não usa snapshot de geração e não aceita upload ou armazenamento do arquivo externo.
- `OrientationCertificate` usa `generated` e não passa por assinatura.
- Os únicos status documentais são `generated`, `awaiting_signature`, `signed` e `cancelled`; `registered` e `released` não existem para documentos.
- `awaiting_signature` exige `signature_availability_location` para documento que requer assinatura; `generated`, `signed` e `cancelled` podem preservar o valor histórico sem torná-lo uma nova obrigação de preenchimento.
- Quando a data de início vencer antes da assinatura, não há ação agendada. O documento continua `awaiting_signature` e o estágio continua aguardando assinaturas até que o Setor decida manualmente registrar a assinatura, cancelar o documento com motivo ou abrir uma correção. Somente após decisão, eventual correção e aprovação o término é recalculado e uma nova versão documental pode ser gerada para assinatura.
- Falha de Job não cria status persistente novo sem decisão explícita.

## Checklist

- [x] Confirmar catálogo de tipos e transições de status atuais.
- [ ] Criar migration com FKs, índices por estágio/status e nulabilidade condicional.
- [ ] Criar Model com casts dos três enums e JSONB.
- [ ] Validar combinações de origem, tipo, template e status.
- [ ] Implementar snapshot imutável e Activity Log.
- [ ] Exigir local de disponibilização genérico ao marcar `awaiting_signature`, sem nome de plataforma hardcoded.
- [ ] Exibir interessados elegíveis como checkboxes e enviar o aviso selecionado após o commit da transição.
- [ ] Implementar acompanhamento manual de assinatura externa quando aplicável.
- [ ] Testar geração, assinatura, cancelamento, aditivo e documento da concedente.
- [ ] Testar que nenhum arquivo final seja armazenado.
- [ ] Testar migrate/rollback na ordem completa.

## Enums relacionados

- [[SGE - Enum - GeneratedDocumentType|GeneratedDocumentType]]
- [[SGE - Enum - GeneratedDocumentStatus|GeneratedDocumentStatus]]
- [[SGE - Enum - GeneratedDocumentOrigin|GeneratedDocumentOrigin]]
