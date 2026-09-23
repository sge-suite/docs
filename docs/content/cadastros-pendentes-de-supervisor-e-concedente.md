---
id: cadastros-pendentes-de-supervisor-e-concedente
title: Cadastros pendentes de supervisor e concedente
description: Contrato de dados e análise dos cadastros solicitados durante a abertura de estágio.
type: domain-contract
status: planned
visibility: public
tags: sge/estagio, sge/cadastro, sge/pendencias
related: migration-12a-supervisor-registration-requests, migration-12b-granting-party-registration-requests, backlog-e-decisoes, migration-12-granting-parties, migration-19-internship-requests
source_refs:
---
> [!info] Implementação
> A Migration 12A (`supervisor_registration_requests`) está implementada. A Migration 12B e os fluxos de envio, análise e aprovação continuam planejados. A solicitação de estágio mantém as FKs para os pedidos pendentes; não há FK inversa redundante.

## Regras comuns

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `status` | `draft`, `submitted`, `under_review`, `approved`, `rejected` ou `cancelled`; enum existente `RegistrationRequestStatus`. |
| `submission_snapshot` | previsto para a 12B; não existe na 12A, que guarda seus dados em colunas próprias. |
| `reviewed_at` | nullable até a análise; registra o instante da revisão. A identificação do revisor segue o contrato de cada tabela. |
| `decision_reason` | obrigatório em recusa ou cancelamento; opcional em aprovação. |
| timestamps | auditoria técnica; alterações e decisões relevantes também entram no `activity_log`. |

Em `draft`, campos de negócio podem ser nulos. Em todos os demais estados, as colunas obrigatórias do respectivo cadastro devem ser válidas. Na Migration 19, a solicitação de estágio identifica o vínculo discente responsável pelo envio. A 12A não duplica FKs de autoria ou revisão; seus eventos e atores serão registrados pelo Activity Log quando ele for configurado e o contexto por vínculo estiver definido. O contrato planejado da 12B ainda prevê FKs próprias de autoria e revisão. Aprovação não cria automaticamente conta ou concedente sem uma ação de análise explícita do Setor.

## `supervisor_registration_requests`

| Campo | Regra |
| --- | --- |
| `name` | obrigatório fora de rascunho. |
| `cpf` | informado pelo discente, válido e normalizado; obrigatório fora de rascunho. |
| `phone` / `email` | obrigatórios fora de rascunho e normalizados. |
| `job_role` | obrigatório fora de rascunho. |
| `qualification` | obrigatório fora de rascunho. |
| `training` | nullable; formação declarada. |
| `professional_experience` | texto nullable; experiência profissional declarada. |
| `supervisor_affiliation_id` | FK nullable para o vínculo criado ou selecionado na aprovação; obrigatório quando `status = approved`. |

Este pedido registra a proposta do discente e a análise do Setor. Os dados profissionais atuais ficam em `user_personal_data`, compartilhados pelos vínculos da mesma conta. Se já houver um vínculo de supervisor selecionável, a solicitação de estágio pode referenciá-lo diretamente e não precisa criar este pedido. Quando houver pendência, o registro mantém os dados profissionais enviados; após aprovação, associa um vínculo de supervisor existente ou criado em transação. No aceite, os dados necessários são copiados para `internships.supervisor_snapshot`.

A Migration 12A guarda o CPF informado pelo discente em coluna própria, validado e normalizado pelo `CpfCast`; `users.cpf` continua único na conta. A associação a uma conta existente ou a criação da conta e do vínculo será feita no futuro fluxo de aprovação. Cargo, qualificação, formação e experiência atuais ficam em `user_personal_data`. O supervisor preenche ou confirma esses dados no futuro formulário, e cada estágio conserva seu próprio snapshot histórico.

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

- [Backlog e decisões](doc:backlog-e-decisoes#d-011-solicitacoes-pendentes-sao-registros-proprios)
- [Migration 12 — granting_parties](doc:migration-12-granting-parties)
- [Migration 19 — internship_requests](doc:migration-19-internship-requests)
