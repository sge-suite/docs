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

Cada linha possui exatamente uma mídia privada na coleção `emancipation_evidence`. Novo envio cria nova linha; não substitui o binário anterior. A prova só é visível ao discente proprietário e ao Setor autorizado, nunca ao supervisor, orientador, e-mail, documento gerado ou Activity Log. A solicitação só pode ser aceita como `emancipated_minor` quando houver evidência `Approved` do último envio.

A confirmação atual continua em `user_personal_data.emancipation_verified_at`. A autoria da decisão é registrada no Activity Log; não há FK de revisor nem nova coluna no perfil. A evidência permanece como histórico e fonte da análise.

## Envio, registro e acesso

O discente anexa o comprovante diretamente no formulário do SGE; e-mail, link externo e envio fora do sistema não substituem esse registro. No mesmo caso de uso, o sistema cria a linha de `emancipation_evidences`, associa a mídia privada, usa o vínculo proprietário da solicitação e registra o instante em `created_at` e inicia o status `Submitted`. Assim, o Setor enxerga que há uma prova a analisar e o discente acompanha o estado do próprio envio, sem expor o binário ou seus metadados fora desse acesso restrito.

O upload deve usar armazenamento privado, validação de tipo/tamanho e autorização por solicitação. O Activity Log pode registrar apenas o fato técnico de que uma evidência foi enviada ou analisada, com o identificador do registro e seu estado; nunca nome de arquivo, conteúdo, imagem, metadados do arquivo ou cópia do documento.

## Estado da implementação

Migration, Model, factory, coleção privada `emancipation_evidence`, upload HTTP, autorização por vínculo, análise manual e validação da evidência no envio e aceite estão implementados.

## Fluxo implementado — 16/10/2026

`StoreEmancipationEvidence` autoriza a solicitação e o vínculo selecionado novamente sob bloqueio, valida PDF/JPEG/PNG até 10 MB e cria registro/mídia privados em transação. Cada envio usa nome interno gerado e preserva os anteriores. A rota autenticada exige `EmancipationEvidencePolicy`, devolve conteúdo sem cache e não divulga URL de armazenamento. O observador de infraestrutura omite integralmente os metadados desta coleção do Activity Log.

`ReviewEmancipationEvidence` restringe a decisão ao Setor do mesmo campus e ao último envio Submitted. Aprovação registra `emancipation_verified_at`; devolução exige motivo e libera a seção `legal_capacity` da mesma solicitação, ou acrescenta essa seção à correção aberta. O aceite exige o último envio aprovado. Um arquivo anterior aprovado não substitui a análise de um novo comprovante.

O estado PendingCorrection admite o último comprovante Returned para permitir sua substituição. Novo envio da solicitação exige novamente comprovante vigente anexado e não devolvido; o aceite exige aprovação do último envio. O motivo detalhado permanece no registro privado da evidência, sem cópia automática para auditoria ou e-mail.
