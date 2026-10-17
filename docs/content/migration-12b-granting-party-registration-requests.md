---
id: migration-12b-granting-party-registration-requests
title: Migration 12B — granting_party_registration_requests
description: Solicitações tipadas de cadastro de parte concedente feitas durante a abertura.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/cadastro
related: migration-12-granting-parties, enum-partydocumenttype, enum-registrationrequeststatus, cadastros-pendentes-de-supervisor-e-concedente
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_190320_create_granting_party_registration_requests_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/GrantingPartyRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRegistration.php
---
> [!info] Estado
> O pedido conserva o campus de origem com FK obrigatória para `campuses`, e a validação exige que a concedente resultante pertença ao mesmo campus. Migration, Model, factory, casts, validação e associação pelo Setor estão implementados. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária Laravel. |
| `campus_id` | bigint obrigatório, FK para `campuses.id` com `RESTRICT` e índice; escopo imutável após criação. |
| `document_type` / `document_number` | tipo CPF/CNPJ e número validado pelo cast correspondente, normalizado sem pontuação; nulos em `Draft`, obrigatórios nos demais estados. |
| `name` | nome ou razão social, obrigatório fora de `Draft`. |
| `street`, `number`, `neighborhood`, `zip_code` | endereço proposto para CPF; obrigatórios fora de `Draft` para pessoa física e nulos para CNPJ. CEP é validado com `FormatoCep` e guarda oito dígitos em coluna textual. |
| `city`, `uf`, `city_id` | município e UF obrigatórios fora de `Draft` para ambos os documentos; `city_id` é FK nullable em Draft para `cities.id` com `RESTRICT`, validada contra a UF. |
| `representative_name` / `representative_role` | obrigatórios fora de `Draft` para CNPJ e nulos para CPF. |
| `phone` / `email` | obrigatórios fora de `Draft` para CPF e CNPJ; telefone e e-mail validados. |
| `field_of_activity` | nulo na proposta da abertura; não aparece no formulário do Discente. |
| `professional_council`, `council_registration_number`, `credentialing_process_number` | nulos na proposta da abertura; não aparecem no formulário do Discente. |
| `status` | `RegistrationRequestStatus`, obrigatório. |
| `granting_party_id` | FK nullable com exclusão restrita para `granting_parties`; obrigatória em `Approved`. |
| `reviewed_at` | instante opcional da análise. |
| `decision_reason` | motivo obrigatório em `Rejected` e `Cancelled`; opcional nos demais estados. |
| timestamps | `created_at` e `updated_at` nativos. |

A tabela registra a proposta enviada e sua decisão; `granting_parties` e `addresses` guardam o cadastro atual. Não há `submitted_by_affiliation_id`, `reviewed_by_affiliation_id` nem `submission_snapshot`. O Model participa do Activity Log Eloquent; `ReviewInternshipRegistration` e as Policies limitam a análise ao Setor do campus. A exclusão física pelo Model é bloqueada; não há `deleted_at`. Há índice secundário em `campus_id`, sem unicidade de documento ou constraints `CHECK`. O Model valida o campus e impede sua alteração após a criação.

O Setor cria ou localiza a concedente pela gestão existente antes da análise da proposta. `ReviewInternshipRegistration` associa em transação uma concedente ativa do mesmo campus ao pedido e à solicitação de estágio; não cria o cadastro automaticamente. O Model rejeita resultado de outro campus. CPF/CNPJ repetidos em outros campi não tornam o cadastro compartilhável. Ao cadastrar uma concedente, a gestão cria também uma linha própria de `addresses`; não reutiliza o endereço de outro cadastro, mesmo que seja idêntico. O pedido preserva os dados originalmente propostos, inclusive o endereço quando aplicável. CNPJ repetido não impede unidades distintas. O estágio só pode ser aceito depois de associar a concedente aprovada e resolver o pedido pendente.

O CEP pode ficar vazio em `Draft`, mas, quando informado, deve passar pela mesma validação de formato aplicada fora do rascunho. Aceita oito dígitos e as máscaras `00000-000` e `00.000-000`; caracteres arbitrários não são removidos antes de validar. A máscara é removida somente após validação bem-sucedida.

## Integração e identidade municipal — 16/10/2026

A migration original de criação inclui `city_id`, FK nullable no Draft para `cities` com RESTRICT. O formulário escolhe UF e cidade do catálogo; a Action valida a correspondência e persiste a FK, enquanto `city` e `uf` preservam o texto proposto. Fora de Draft a abertura exige a identidade municipal; não há associação automática por semelhança de nome.

O envio completo marca o pedido Submitted, sem criar ou aprovar concedente. O Setor usa a gestão existente para cadastrar e, depois, `ReviewInternshipRegistration` para associar uma concedente ativa do mesmo campus ou recusar com motivo. Campos originalmente propostos e decisão permanecem no registro. CPF/CNPJ iguais não autorizam associação entre campi. O formulário é condicional: CPF exige endereço completo, enquanto CNPJ exige dados do representante e somente município/UF; ambos exigem identificação, nome, telefone e e-mail. Área de atuação, conselho e credenciamento não são solicitados no formulário e ficam nulos na proposta enviada.
