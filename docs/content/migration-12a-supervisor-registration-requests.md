---
id: migration-12a-supervisor-registration-requests
title: Migration 12A — supervisor_registration_requests
description: Solicitações tipadas de cadastro de supervisor feitas durante a abertura.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/cadastro
related: migration-02-user-personal-data, migration-04-affiliations, migration-12-granting-parties, enum-registrationrequeststatus, migration-19-internship-requests
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_162229_create_supervisor_registration_requests_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/database/factories/SupervisorRegistrationRequestFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/SupervisorRegistrationRequestTest.php
---
> [!success] Estado
> Migration, Model, factory, relação com o vínculo resultante, casts, validação e testes PostgreSQL implementados. O fluxo transacional de aprovação e a Migration 12B permanecem fora desta etapa.

## Finalidade

Esta tabela guarda o pedido de cadastro quando o discente não seleciona um vínculo de supervisor já existente na abertura. Ela preserva os dados informados e a decisão do Setor como histórico da proposta. `users` guarda a identidade, e `user_personal_data` guarda os dados pessoais e profissionais atuais compartilhados pela conta.

Na Migration 19, a solicitação de estágio aponta diretamente para um vínculo de supervisor existente ou para este pedido pendente. Após a análise, a aprovação deve associar um vínculo existente ou criar/associar `User` e `Affiliation` do tipo `Supervisor` na mesma transação, gravar `supervisor_affiliation_id` e marcar o pedido como `Approved`. Antes do aceite do estágio, a solicitação de estágio troca a referência pendente pela FK do vínculo resultante. Recusa e cancelamento preservam o pedido e seu motivo.

## Schema PostgreSQL

| Campo | Tipo e regra |
| --- | --- |
| `id` | `bigint`, chave primária. |
| `name`, `phone`, `email`, `job_role`, `qualification` | `varchar(255)` nullable no banco; no Model são obrigatórios e validados fora de `Draft`. |
| `training`, `professional_experience` | `text` nullable e opcionais. |
| `submission_snapshot` | `jsonb` nullable, convertido para array PHP; preserva valores normalizados e respostas externas enviados pela aplicação. |
| `status` | `varchar(255)` obrigatório, convertido pelo cast PHP `RegistrationRequestStatus`. |
| `supervisor_affiliation_id` | `bigint` nullable, única FK para `affiliations`, com `ON DELETE RESTRICT`; deve ser vínculo do tipo `Supervisor` e é obrigatório em `Approved`. |
| `reviewed_at` | `timestamp(0)` nullable, convertido para datetime. |
| `decision_reason` | `text` nullable; obrigatório em `Rejected` e `Cancelled`. |
| `created_at`, `updated_at` | timestamps nativos do Laravel. |

O schema cria somente a chave primária e a FK do vínculo resultante. Não há FKs de autoria ou de revisor nesta tabela, índices secundários, unicidade ou constraints `CHECK`. A solicitação de estágio planejada na Migration 19 identifica o vínculo discente responsável pelo envio; os eventos de envio e análise também terão seus atores no Activity Log quando o contexto por vínculo for definido. A aplicação bloqueia a exclusão pelo Model e a migration instala triggers PostgreSQL para impedir `DELETE` e `TRUNCATE`; não existe coluna `deleted_at`.

## Model, relação e validação

`SupervisorRegistrationRequest` relaciona-se com a `Affiliation` do supervisor resultante; `Affiliation` expõe a relação inversa. O Model usa os casts de `RegistrationRequestStatus`, `PhoneCast`, JSONB e datetime.

No evento `saving`, os cinco campos cadastrais podem ficar nulos somente em `Draft`; nos demais status exigem conteúdo válido. O telefone usa o `PhoneCast` existente e é persistido apenas com dígitos. Treinamento e experiência profissional são opcionais. Aprovação exige uma FK para vínculo do tipo `Supervisor`; recusa e cancelamento exigem motivo. Não há transições de status ou fluxo de análise nesta migration.

A identidade da conta fica em `users`, que possui CPF único, nome e e-mail. Nome e e-mail no pedido preservam o que o discente informou; não há coluna CPF no pedido. Para deduplicar por CPF durante a aprovação, ainda será necessário definir se e como o CPF normalizado vem de uma consulta externa e qual chave do snapshot o contém. A associação por e-mail/CPF e a criação transacional pertencem ao fluxo futuro. Os campos profissionais atuais pertencem a `user_personal_data`; o usuário supervisor poderá preenchê-los ou confirmá-los no futuro formulário, após a criação da conta e do vínculo. A autorização de edição por tipo de vínculo e a composição do snapshot do estágio serão implementadas no fluxo funcional.

## Snapshot e decisão pendente

O contrato exige JSONB com os dados normalizados enviados e eventuais respostas externas, mas não define a estrutura interna nem se o snapshot é obrigatório fora de `Draft`. A coluna é nullable e o Model não impõe chaves ou obrigatoriedade por status. Antes de implementar o fluxo de envio/aprovação, é necessário decidir se todo pedido submetido precisa de snapshot e padronizar suas chaves, inclusive eventual CPF de consulta externa.

## Testes verificados

`tests/Feature/SupervisorRegistrationRequestTest.php` cobre tipos do schema PostgreSQL, a FK resultante e exclusões, casts e relação, estados `Draft` e não-`Draft`, obrigatoriedade e validação dos campos, snapshot JSONB, motivos de decisão, associação de supervisor em `Approved` e rollback/reaplicação da migration. Os testes afetados são executados por Sail.
