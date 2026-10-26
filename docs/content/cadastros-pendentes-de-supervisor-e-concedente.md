---
id: cadastros-pendentes-de-supervisor-e-concedente
title: Cadastros pendentes de supervisor e concedente
description: Contrato de dados e análise dos cadastros solicitados durante a abertura de estágio.
type: domain-contract
status: implemented
visibility: public
tags: sge/estagio, sge/cadastro, sge/pendencias
related: migration-12a-supervisor-registration-requests, migration-12b-granting-party-registration-requests, backlog-e-decisoes, migration-12-granting-parties, migration-19-internship-requests
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_162229_create_supervisor_registration_requests_table.php, https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_190320_create_granting_party_registration_requests_table.php, https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_24_152252_create_internship_requests_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/app/Models/GrantingPartyRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/app/Models/InternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRegistration.php
---
> [!info] Implementação
> As Migrations 12A (`supervisor_registration_requests`) e 12B (`granting_party_registration_requests`) e os fluxos de envio e análise estão implementados. O pedido e o cadastro resultante pertencem ao mesmo campus; o Setor associa explicitamente a concedente ou o vínculo criado/selecionado. O aceite do estágio só ocorre depois da resolução dos dois cadastros.

## Regras comuns

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `status` | `draft`, `submitted`, `under_review`, `approved`, `rejected` ou `cancelled`; enum existente `RegistrationRequestStatus`. |
| `reviewed_at` | nullable até a análise; registra o instante da revisão. |
| `decision_reason` | obrigatório em recusa ou cancelamento; opcional em aprovação. |
| timestamps | auditoria técnica; alterações e decisões relevantes também entram no `activity_log`. |

Em `draft`, campos de negócio podem ser nulos. Em todos os demais estados, as colunas obrigatórias do respectivo cadastro devem ser válidas. Na Migration 19, a solicitação de estágio identifica o vínculo discente responsável pelo envio. As Migrations 12A e 12B não duplicam FKs de autoria ou revisão nem guardam `submission_snapshot`; quando seus Models forem alterados por Eloquent, o Activity Log registra eventos e o contexto de autoria disponível. `ReviewInternshipRegistration` e as Policies implementam a análise explícita pelo Setor: a ação associa um cadastro existente, ativo e do mesmo campus, ou registra a recusa com motivo. Ela não cria conta, vínculo ou concedente automaticamente.

## `supervisor_registration_requests`

| Campo | Regra |
| --- | --- |
| `name` | obrigatório fora de rascunho. |
| `cpf` | informado pelo discente, válido e normalizado; obrigatório fora de rascunho. |
| `phone` / `email` | obrigatórios fora de rascunho e normalizados. |
| `job_role` | obrigatório fora de rascunho. |
| `has_academic_background` | escolha entre formação na área e experiência nas atividades do estagiário; obrigatória fora de rascunho. |
| `training_course` / `education_level` | obrigatórios fora de rascunho no ramo de formação; nível usa [`EducationLevel`](doc:enum-educationlevel). Vazios no ramo de experiência. |
| `experience_time` | tempo de experiência na área em texto livre; obrigatório fora de rascunho no ramo profissional, vazio no ramo acadêmico. |
| `supervisor_affiliation_id` | FK nullable para o vínculo criado ou selecionado na aprovação; obrigatório quando `status = approved`. |

Este pedido registra uma única proposta de qualificação e a análise do Setor. O cargo/função fica em `user_personal_data`; o perfil atual mantém várias qualificações em `supervisor_qualifications`. Se já houver um vínculo de supervisor selecionável, a solicitação referencia esse vínculo e não cria pedido. Para o supervisor existente, o Discente não envia qualificações: no aceite, o Setor seleciona uma delas (ou o sistema pré-seleciona quando há somente uma) e a copia para `internships.supervisor_snapshot`.

A Migration 12A guarda o CPF informado pelo Discente em coluna própria, validado e normalizado pelo `CpfCast`; `users.cpf` continua único na conta. O Setor cria ou localiza explicitamente a conta e o vínculo e associa o resultado à proposta. Cargo/função fica em `user_personal_data`; formações e experiências atuais ficam em várias linhas de `supervisor_qualifications`. O pedido de supervisor enviado é uma proposta histórica única. No aceite, o Setor escolhe a qualificação do perfil que corresponde ao estágio; snapshots e avaliações permanecem independentes do perfil atual.

## `granting_party_registration_requests`

| Campo | Regra |
| --- | --- |
| `campus_id` | FK obrigatória para o campus de origem, com exclusão restrita; não pode ser alterada após a criação. |
| `document_type` / `document_number` | tipo CPF/CNPJ e número normalizado; obrigatórios fora de rascunho. |
| `name` | nome ou razão social, obrigatório fora de rascunho. |
| `street`, `number`, `neighborhood`, `zip_code` | endereço completo obrigatório fora de rascunho para CPF; nulo para CNPJ. |
| `city`, `uf`, `city_id` | cidade obrigatória para CPF e CNPJ; FK para `cities`, validada pela UF informada. |
| `representative_name` / `representative_role` | obrigatórios fora de rascunho para CNPJ; nulos para CPF. |
| `phone` / `email` | obrigatórios fora de rascunho para ambos os documentos. |
| `field_of_activity`, `professional_council`, `council_registration_number`, `credentialing_process_number` | não são solicitados no formulário de abertura e ficam nulos na proposta. |
| `granting_party_id` | FK nullable para o cadastro criado ou selecionado; obrigatório quando `status = approved`. |

Antes da análise, o Setor cria ou localiza a concedente pela gestão existente. `ReviewInternshipRegistration` associa em transação uma concedente ativa do mesmo campus de origem e atualiza a solicitação; a decisão não cria o cadastro. Uma concedente nova recebe uma linha própria em `addresses`, mesmo que outro cadastro tenha endereço idêntico; o pedido preserva o endereço proposto quando CPF foi informado. O CNPJ da matriz pode aparecer em registros distintos para filiais ou escolas, e CPF/CNPJ não provocam compartilhamento automático entre campi. A solicitação pendente mantém o envio original, a decisão e o vínculo resultante, enquanto a tabela de concedentes guarda somente o cadastro atual. Tanto a concedente quanto a solicitação de concedente persistem `campus_id`, que não pode ser alterado após a criação.

## Integridade e interface

- A solicitação de estágio referencia uma concedente **ou** uma solicitação pendente, e um supervisor **ou** uma solicitação pendente; cada par é exclusivo.
- A interface começa pela busca. No preenchimento de uma proposta, um CPF/CNPJ válido já disponível no campus muda o fluxo para a seleção do cadastro existente, com aviso de conferência. Para Supervisor, é obrigatório haver vínculo ativo desse papel no campus; uma conta com o CPF ou um vínculo de outro tipo não provoca associação. Uma única concedente é selecionada automaticamente; várias unidades exigem escolha explícita. `InternshipRegistrationLookup` compartilha o escopo de elegibilidade entre interface e Action. O salvamento e o envio também impedem propor novamente um cadastro já disponível; pedidos históricos são preservados e apenas deixam de ser referenciados quando o Discente salva a escolha existente.
- O discente pode enviar a abertura para análise com as duas propostas completas; o aceite/formalização exige referências aprovadas e associadas pelo Setor.
- O Discente confere a própria proposta, e somente o Setor do campus decide os cadastros pendentes; eles não são logs nem ficam acessíveis a outros discentes ou supervisores.
- Recusar ou cancelar não apaga o registro. O discente pode escolher um cadastro existente ou criar nova solicitação, preservando o histórico da anterior.

## Referências

- [Backlog e decisões](doc:backlog-e-decisoes#d-011-solicitacoes-pendentes-sao-registros-proprios)
- [Migration 12 — granting_parties](doc:migration-12-granting-parties)
- [Migration 19 — internship_requests](doc:migration-19-internship-requests)

## Envio e análise implementados — 16/10/2026

A abertura pode ser enviada com propostas completas de concedente e supervisor. A aprovação de ambos é requisito do aceite/formalização, não do primeiro envio.

Os dados ficam nos registros tipados, nunca em uma notificação ou JSON genérico. O Discente confere a própria proposta; o Setor do campus cria ou localiza o cadastro pela gestão existente e, em ação separada, associa o resultado ativo. Não há criação automática de conta, vínculo ou concedente. A associação troca a FK pendente pela referência aprovada; os snapshots conservam a origem histórica do pedido e os registros propostos e suas decisões permanecem preservados. Se uma proposta já enviada precisar de correção, o formulário cria uma nova proposta tipada sem reescrever o pedido analisado, mantendo a mesma solicitação de estágio.


### Conferência da unidade pelo Setor

Na associação da concedente, as opções mostram nome, CPF/CNPJ, cidade/UF, endereço e número da unidade. O mesmo rótulo é usado na busca do Discente, com as relações de endereço/cidade carregadas antes da renderização. O Setor pode pesquisar por esses dados e confere um resumo da unidade selecionada antes de aprovar. Selecionar não grava nem aprova o pedido. Se a unidade não estiver disponível entre os cadastros ativos do campus, a tela informa a pendência e impede aprovar a associação até uma escolha disponível; a Action continua revalidando campus, vínculo e cadastro na transação. Propostas e associações históricas não são reescritas.
