---
title: SGE — Migration 12A — supervisor_registration_requests
description: Solicitações tipadas de cadastro de supervisor feitas durante a abertura.
type: migration-reference
status: planned
order: 12.1
table: supervisor_registration_requests
tags:
  - sge/migrations
  - sge/cadastro
---
| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `submitted_by_affiliation_id` | vínculo discente autor. |
| `name`, `phone`, `email`, `job_role`, `qualification` | nullable em `Draft`, obrigatórios nos demais estados. |
| `training`, `professional_experience` | opcionais. |
| `submission_snapshot` | JSONB dos valores normalizados enviados e respostas de consulta externa quando houver. |
| `status` | `RegistrationRequestStatus`. |
| `supervisor_affiliation_id` | FK resultante, obrigatória em `Approved`. |
| `reviewed_by_affiliation_id`, `reviewed_at`, `decision_reason` | análise pelo Setor; motivo obrigatório em recusa/cancelamento. |
| timestamps | auditoria. |

A aprovação associa um vínculo de supervisor existente ou cria pessoa/vínculo em transação, sem duplicar por e-mail/CPF quando identificável. A solicitação de estágio mantém a FK para este registro até a decisão e troca para `supervisor_affiliation_id` antes do aceite.
