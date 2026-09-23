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
| `cpf` | `varchar(255)` nullable no banco; obrigatório fora de `Draft`, validado e normalizado pelo `CpfCast`. O banco não limita o comprimento. |
| `name`, `phone`, `email`, `job_role`, `qualification` | `varchar(255)` nullable no banco; no Model são obrigatórios e validados fora de `Draft`. |
| `training`, `professional_experience` | `text` nullable e opcionais. |
| `status` | `varchar(255)` obrigatório, convertido pelo cast PHP `RegistrationRequestStatus`. |
| `supervisor_affiliation_id` | `bigint` nullable, única FK para `affiliations`, com `ON DELETE RESTRICT`; deve ser vínculo do tipo `Supervisor` e é obrigatório em `Approved`. |
| `reviewed_at` | `timestamp(0)` nullable, convertido para datetime. |
| `decision_reason` | `text` nullable; obrigatório em `Rejected` e `Cancelled`. |
| `created_at`, `updated_at` | timestamps nativos do Laravel. |

O schema cria somente a chave primária e a FK do vínculo resultante. Não há FKs de autoria ou de revisor nesta tabela, índices secundários, unicidade ou constraints `CHECK`. A solicitação de estágio planejada na Migration 19 identifica o vínculo discente responsável pelo envio; o Activity Log será configurado depois para registrar atores e alterações do pedido. O Model bloqueia a exclusão pelo Eloquent; não existe coluna `deleted_at`.

## Model, relação e validação

`SupervisorRegistrationRequest` relaciona-se com a `Affiliation` do supervisor resultante; `Affiliation` expõe a relação inversa. O Model usa os casts de `RegistrationRequestStatus`, `CpfCast`, `PhoneCast` e datetime.

No evento `saving`, nome, CPF, telefone, e-mail, cargo e qualificação podem ficar nulos somente em `Draft`; nos demais status exigem conteúdo válido. O `CpfCast` valida CPF brasileiro e o persiste apenas com dígitos; o telefone usa o `PhoneCast` existente e também é persistido apenas com dígitos. Treinamento e experiência profissional são opcionais. Aprovação exige uma FK para vínculo do tipo `Supervisor`; recusa e cancelamento exigem motivo. Não há transições de status ou fluxo de análise nesta migration.

A identidade da conta fica em `users`, que possui CPF único, nome e e-mail. O pedido guarda o CPF informado pelo discente, sem unicidade própria; na criação da conta, a unicidade de `users.cpf` continua sendo a regra final. A associação a uma conta ou vínculo existente e a criação transacional pertencem ao fluxo futuro. Os campos profissionais atuais pertencem a `user_personal_data`; o usuário supervisor poderá preenchê-los ou confirmá-los no futuro formulário, após a criação da conta e do vínculo. A autorização de edição por tipo de vínculo e a composição do snapshot do estágio serão implementadas no fluxo funcional.

## Auditoria

A tabela não duplica os campos de negócio em JSONB. O Activity Log será configurado depois para registrar autoria e alterações do pedido. Respostas de consultas externas não são persistidas nesta tabela.

## Testes verificados

`tests/Feature/SupervisorRegistrationRequestTest.php` cobre tipos do schema PostgreSQL, a FK resultante e exclusões, casts e relação, estados `Draft` e não-`Draft`, obrigatoriedade e validação dos campos, CPF normalizado, motivos de decisão, associação de supervisor em `Approved` e rollback/reaplicação da migration. Os testes afetados são executados por Sail.
