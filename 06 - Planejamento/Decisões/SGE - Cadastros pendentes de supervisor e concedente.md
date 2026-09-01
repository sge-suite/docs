---
title: SGE — Cadastros pendentes de supervisor e concedente
description: Contrato de dados e análise dos cadastros solicitados durante a abertura de estágio.
type: domain-contract
status: planned
tags:
  - sge/estagio
  - sge/cadastro
  - sge/pendencias
---
> [!todo] Implementação
> São duas tabelas próprias a criar antes de `internship_requests`: [[SGE - Migration - 12A - Supervisor registration requests|`supervisor_registration_requests`]] e [[SGE - Migration - 12B - Granting party registration requests|`granting_party_registration_requests`]]. A solicitação de estágio mantém as FKs para elas; não haverá FK inversa redundante, evitando dependência circular.

## Regras comuns

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `submitted_by_affiliation_id` | FK obrigatória para o vínculo discente que informou os dados. |
| `status` | `draft`, `submitted`, `under_review`, `approved`, `rejected` ou `cancelled`; enum próprio a criar. |
| `raw_submission` | JSONB obrigatório no envio, com os valores recebidos e, quando houver, resposta/sugestão da BrasilAPI. Não substitui as colunas abaixo. |
| `reviewed_by_affiliation_id` / `reviewed_at` | nulos até análise; identificam o Setor de Estágio. |
| `decision_reason` | obrigatório em recusa ou cancelamento; opcional em aprovação. |
| timestamps | auditoria técnica; alterações e decisões relevantes também entram no `activity_log`. |

Em `draft`, campos de negócio podem ser nulos. Em todos os demais estados, as colunas obrigatórias do respectivo cadastro devem ser válidas. Aprovação não cria automaticamente conta ou concedente sem uma ação de análise explícita do Setor.

## `supervisor_registration_requests`

| Campo | Regra |
| --- | --- |
| `name` | obrigatório fora de rascunho. |
| `phone` / `email` | obrigatórios fora de rascunho e normalizados. |
| `job_role` | obrigatório fora de rascunho. |
| `qualification` | obrigatório fora de rascunho. |
| `training` | nullable; formação declarada. |
| `professional_experience` | texto nullable; experiência profissional declarada. |
| `supervisor_affiliation_id` | FK nullable para o vínculo criado ou selecionado na aprovação; obrigatório quando `status = approved`. |

Após a aprovação, a solicitação de estágio aponta para o vínculo selecionado; no aceite, seus valores são copiados para `internships.supervisor_snapshot`.

## `granting_party_registration_requests`

| Campo | Regra |
| --- | --- |
| `document_type` / `document_number` | tipo CPF/CNPJ e número normalizado; obrigatórios fora de rascunho. |
| `name` | nome ou razão social, obrigatório fora de rascunho. |
| `street`, `number`, `neighborhood`, `city`, `uf`, `zip_code` | endereço proposto, obrigatório fora de rascunho. |
| `representative_name` / `representative_role` | obrigatórios fora de rascunho. |
| `phone` / `email` | nullable e normalizados. |
| `field_of_activity` | obrigatório fora de rascunho. |
| `professional_council` / `council_registration_number` | nullable. |
| `credentialing_process_number` | nullable. |
| `granting_party_id` | FK nullable para o cadastro criado ou selecionado; obrigatório quando `status = approved`. |

Na aprovação, o Setor cria ou seleciona `granting_parties` e `addresses`; CNPJ repetido não impede uma unidade distinta. A solicitação pendente mantém o envio original, a decisão e o vínculo resultante, enquanto a tabela de concedentes guarda somente o cadastro atual.

## Integridade e interface

- A solicitação de estágio referencia uma concedente **ou** uma solicitação pendente, e um supervisor **ou** uma solicitação pendente; cada par é exclusivo.
- O discente pode continuar preenchendo o formulário principal enquanto o cadastro estiver em análise, mas não pode enviar a abertura para aceite até as duas referências exigidas estarem aprovadas.
- Só o Setor visualiza e decide as solicitações pendentes; elas não são logs expostos ao discente ou ao supervisor.
- Recusar ou cancelar não apaga o registro. O discente pode escolher um cadastro existente ou criar nova solicitação, preservando o histórico da anterior.

## Referências

- [[SGE - Backlog e decisões#D-011 — Solicitações pendentes são registros próprios]]
- [[SGE - Migration - 12 - Granting parties]]
- [[SGE - Migration - 19 - Internship requests]]
