---
title: SGE — Migration 12B — granting_party_registration_requests
description: Solicitações tipadas de cadastro de parte concedente feitas durante a abertura.
type: migration-reference
status: planned
order: 12.2
table: granting_party_registration_requests
tags:
  - sge/migrations
  - sge/cadastro
---
| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `submitted_by_affiliation_id` | vínculo discente autor. |
| documento | `document_type` e `document_number` normalizado; nullable em `Draft`, obrigatório depois. |
| identificação | `name`, representante e cargo; nullable em `Draft`, obrigatório depois. |
| endereço | logradouro, número, bairro, cidade, UF e CEP tipados. |
| contatos/atividade | telefone e e-mail opcionais; área de atuação obrigatória depois de `Draft`. |
| dados adicionais | conselho, registro e processo de credenciamento opcionais. |
| `submission_snapshot` | JSONB dos valores normalizados e resposta BrasilAPI quando consultada. |
| `status` | `RegistrationRequestStatus`. |
| `granting_party_id` | FK resultante, obrigatória em `Approved`. |
| `reviewed_by_affiliation_id`, `reviewed_at`, `decision_reason` | decisão pelo Setor. |
| timestamps | auditoria. |

A aprovação seleciona ou cria `granting_parties` e `addresses` em transação. CNPJ repetido não impede uma unidade distinta. A solicitação de estágio só pode ser aceita após substituir esta referência pela concedente aprovada.
