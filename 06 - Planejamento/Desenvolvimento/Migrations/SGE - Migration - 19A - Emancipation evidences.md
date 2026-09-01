---
title: SGE — Migration 19A — emancipation_evidences
description: Histórico privado das provas de emancipação e sua análise manual.
type: migration-reference
status: planned
order: 19.1
table: emancipation_evidences
tags:
  - sge/migrations
  - sge/emancipacao
  - sge/privacidade
---
| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `internship_request_id` | FK obrigatória para a solicitação do discente. |
| `submitted_by_affiliation_id` / `submitted_at` | vínculo discente e instante do envio. |
| `status` | `EmancipationEvidenceStatus`, inicial `submitted`. |
| `reviewed_by_affiliation_id` / `reviewed_at` | análise manual pelo Setor. |
| `return_reason` | obrigatório em `Returned`; não contém o arquivo. |
| timestamps | auditoria técnica. |

Cada linha possui exatamente uma mídia privada na coleção `emancipation_evidence`. Novo envio cria nova linha; não substitui o binário anterior. A prova só é visível ao discente proprietário e ao Setor autorizado, nunca ao supervisor, orientador, e-mail, documento gerado ou Activity Log. A solicitação só pode ser aceita como `emancipated_minor` quando houver evidência `Approved` vigente.

## Envio, registro e acesso

O discente anexa o comprovante diretamente no formulário do SGE; e-mail, link externo e envio fora do sistema não substituem esse registro. No mesmo caso de uso, o sistema cria a linha de `emancipation_evidences`, associa a mídia privada, registra vínculo e instante de envio e inicia o status `Submitted`. Assim, o Setor enxerga que há uma prova a analisar e o discente acompanha o estado do próprio envio, sem expor o binário ou seus metadados fora desse acesso restrito.

O upload deve usar armazenamento privado, validação de tipo/tamanho e autorização por solicitação. O Activity Log pode registrar apenas o fato técnico de que uma evidência foi enviada ou analisada, com o identificador do registro e seu estado; nunca nome de arquivo, conteúdo, imagem, metadados do arquivo ou cópia do documento.
