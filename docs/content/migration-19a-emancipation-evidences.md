---
id: migration-19a-emancipation-evidences
title: Migration 19A — emancipation_evidences
description: Histórico privado das provas de emancipação e sua análise manual.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/emancipacao, sge/privacidade
related: enum-emancipationevidencestatus, migration-02-user-personal-data, migration-04-affiliations, migration-19-internship-requests, migration-base-05-media, migration-base-04-activity-log
source_refs:
---
| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `internship_request_id` | FK obrigatória para a solicitação do discente. |
| `created_at` | instante do envio; o vínculo discente vem de `internship_requests.affiliation_id`. |
| `status` | [`EmancipationEvidenceStatus`](doc:enum-emancipationevidencestatus), inicial `submitted`. |
| `reviewed_at` | instante da análise manual; a autoria fica no Activity Log. |
| `return_reason` | obrigatório em `Returned`; não contém o arquivo. |
| timestamps | auditoria técnica. |

Cada linha possui exatamente uma mídia privada na coleção `emancipation_evidence`. Novo envio cria nova linha; não substitui o binário anterior. A prova só é visível ao discente proprietário e ao Setor autorizado, nunca ao supervisor, orientador, e-mail, documento gerado ou Activity Log. A solicitação só pode ser aceita como `emancipated_minor` quando houver evidência `Approved` vigente.

A confirmação atual continua em `user_personal_data.emancipation_verified_at`. A autoria da decisão é registrada no Activity Log; não há FK de revisor nem nova coluna no perfil. A evidência permanece como histórico e fonte da análise.

## Envio, registro e acesso

O discente anexa o comprovante diretamente no formulário do SGE; e-mail, link externo e envio fora do sistema não substituem esse registro. No mesmo caso de uso, o sistema cria a linha de `emancipation_evidences`, associa a mídia privada, usa o vínculo proprietário da solicitação e registra o instante em `created_at` e inicia o status `Submitted`. Assim, o Setor enxerga que há uma prova a analisar e o discente acompanha o estado do próprio envio, sem expor o binário ou seus metadados fora desse acesso restrito.

O upload deve usar armazenamento privado, validação de tipo/tamanho e autorização por solicitação. O Activity Log pode registrar apenas o fato técnico de que uma evidência foi enviada ou analisada, com o identificador do registro e seu estado; nunca nome de arquivo, conteúdo, imagem, metadados do arquivo ou cópia do documento.

## Estado da implementação

Migration, Model, factory, coleção privada `emancipation_evidence` e validação da evidência no envio e no aceite da solicitação estão implementados. Upload HTTP, autorização por vínculo, análise manual e atualização transacional de `emancipation_verified_at` ficam para o fluxo funcional.
