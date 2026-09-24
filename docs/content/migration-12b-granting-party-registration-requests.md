---
id: migration-12b-granting-party-registration-requests
title: Migration 12B — granting_party_registration_requests
description: Solicitações tipadas de cadastro de parte concedente feitas durante a abertura.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/cadastro
related: migration-12-granting-parties, enum-partydocumenttype, enum-registrationrequeststatus, cadastros-pendentes-de-supervisor-e-concedente
source_refs: https://github.com/sge-suite/sge/blob/master/app/Models/GrantingPartyRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/GrantingPartyRegistrationRequestTest.php
---
> [!success] Estado
> Migration, Model, factory, relação com a concedente resultante, casts, validação e testes PostgreSQL implementados. O fluxo transacional de aprovação e a abertura de estágio permanecem planejados.

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária Laravel. |
| `document_type` / `document_number` | tipo CPF/CNPJ e número validado pelo cast correspondente, normalizado sem pontuação; nulos em `Draft`, obrigatórios nos demais estados. |
| `name` | nome ou razão social, obrigatório fora de `Draft`. |
| `street`, `number`, `neighborhood`, `city`, `uf`, `zip_code` | endereço proposto em colunas próprias; obrigatórios fora de `Draft`. UF usa `BrazilianState`; CEP guarda oito dígitos. |
| `representative_name` / `representative_role` | representante e cargo, obrigatórios fora de `Draft`. |
| `phone` / `email` | opcionais; telefone validado e normalizado por `PhoneCast`, e-mail validado. |
| `field_of_activity` | obrigatório fora de `Draft`. |
| `professional_council`, `council_registration_number`, `credentialing_process_number` | opcionais. |
| `status` | `RegistrationRequestStatus`, obrigatório. |
| `granting_party_id` | FK nullable com exclusão restrita para `granting_parties`; obrigatória em `Approved`. |
| `reviewed_at` | instante opcional da análise. |
| `decision_reason` | motivo obrigatório em `Rejected` e `Cancelled`; opcional nos demais estados. |
| timestamps | `created_at` e `updated_at` nativos. |

A tabela registra a proposta enviada e sua decisão; `granting_parties` e `addresses` guardam o cadastro atual. Não há `submitted_by_affiliation_id`, `reviewed_by_affiliation_id` nem `submission_snapshot`. Os atores e alterações serão associados pelo Activity Log quando o fluxo for configurado. A exclusão física pelo Model é bloqueada; não há `deleted_at`. Não foram criados índices secundários, unicidade de documento ou constraints `CHECK`.

A aprovação futura selecionará ou criará `granting_parties` em transação e associará a concedente resultante ao pedido. Ao criar uma concedente, criará também uma nova linha de `addresses` exclusiva dela; não reutilizará o endereço de outro cadastro, mesmo que seja idêntico. O pedido mantém o endereço proposto em colunas próprias para aceitar rascunhos incompletos e preservar o que foi enviado. CNPJ repetido não impede unidades distintas. A solicitação de estágio só poderá ser aceita após substituir a referência pendente pela concedente aprovada.
