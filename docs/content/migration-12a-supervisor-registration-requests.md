---
id: migration-12a-supervisor-registration-requests
title: Migration 12A — supervisor_registration_requests
description: Solicitações tipadas de cadastro de supervisor feitas durante a abertura.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/cadastro
related: migration-02-user-personal-data, migration-04-affiliations, migration-12-granting-parties, enum-registrationrequeststatus, migration-19-internship-requests
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_162229_create_supervisor_registration_requests_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/database/factories/SupervisorRegistrationRequestFactory.php
---
> [!success] Estado
> Migration, Model, factory, relação com o vínculo resultante, casts e validação implementados. O fluxo transacional de aprovação e a Migration 12B permanecem fora desta etapa. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

## Finalidade

Esta tabela guarda o pedido de cadastro quando o discente não seleciona um vínculo de supervisor já existente na abertura. Ela preserva os dados informados e a decisão do Setor como histórico da proposta. `users` guarda a identidade, e `user_personal_data` guarda os dados pessoais e profissionais atuais compartilhados pela conta.

Na Migration 19, a solicitação de estágio aponta diretamente para um vínculo de supervisor existente ou para este pedido pendente. Após a análise, a aprovação deve associar um vínculo existente ou criar/associar `User` e `Affiliation` do tipo `Supervisor` na mesma transação, gravar `supervisor_affiliation_id` e marcar o pedido como `Approved`. Antes do aceite do estágio, a solicitação de estágio troca a referência pendente pela FK do vínculo resultante. Recusa e cancelamento preservam o pedido e seu motivo.

## Schema PostgreSQL

| Campo | Tipo e regra |
| --- | --- |
| `id` | `bigint`, chave primária. |
| `cpf` | `varchar(255)` nullable no banco; obrigatório fora de `Draft`, validado e normalizado pelo `CpfCast`. O banco não limita o comprimento. |
| `name`, `phone`, `email`, `job_role` | `varchar(255)` nullable no banco; no Model são obrigatórios e validados fora de `Draft`. |
| `has_academic_background` | `boolean` nullable em `Draft`; obrigatório nos demais estados, relativo à área do estagiário. |
| `training_course`, `education_level` | `varchar(255)` nullable; obrigatórios fora de `Draft` no ramo de formação. Nível usa `EducationLevel`, com as cinco opções do formulário. |
| `experience_time` | `varchar(255)` nullable; tempo de experiência em texto livre, obrigatório fora de `Draft` no ramo de experiência. |
| `status` | `varchar(255)` obrigatório, convertido pelo cast PHP `RegistrationRequestStatus`. |
| `supervisor_affiliation_id` | `bigint` nullable, única FK para `affiliations`, com `ON DELETE RESTRICT`; deve ser vínculo do tipo `Supervisor` e é obrigatório em `Approved`. |
| `reviewed_at` | `timestamp(0)` nullable, convertido para datetime. |
| `decision_reason` | `text` nullable; obrigatório em `Rejected` e `Cancelled`. |
| `created_at`, `updated_at` | timestamps nativos do Laravel. |

O schema cria somente a chave primária e a FK do vínculo resultante. Não há FKs de autoria ou de revisor nesta tabela, índices secundários, unicidade ou constraints `CHECK`. A solicitação de estágio da Migration 19 identifica o vínculo discente responsável pelo envio. O Model participa do Activity Log Eloquent e registra a autoria conforme o contexto da requisição; as Actions e Policies da análise ainda estão pendentes. O Model bloqueia a exclusão pelo Eloquent; não existe coluna `deleted_at`.

## Model, relação e validação

`SupervisorRegistrationRequest` relaciona-se com a `Affiliation` do supervisor resultante; `Affiliation` expõe a relação inversa. O Model usa os casts de `RegistrationRequestStatus`, `EducationLevel`, boolean, `CpfCast`, `PhoneCast` e datetime.

No evento `saving`, nome, CPF, telefone, e-mail e cargo/função podem ficar nulos somente em `Draft`; nos demais status exigem conteúdo válido. O `CpfCast` valida CPF brasileiro e o persiste apenas com dígitos; o telefone usa o `PhoneCast` existente e também é persistido apenas com dígitos. A escolha `has_academic_background` é obrigatória fora de `Draft`: formação na área exige curso e nível, deixando tempo de experiência vazio; experiência nas atividades exige tempo de experiência, deixando curso e nível vazios. Mesmo em rascunho, não se misturam os dois ramos quando a escolha já foi informada. A validação é compartilhada com o Model da avaliação. Aprovação exige uma FK para vínculo do tipo `Supervisor`; recusa e cancelamento exigem motivo. Não há transições de status ou fluxo de análise nesta migration.

A identidade da conta fica em `users`, que possui CPF único, nome e e-mail. O pedido guarda o CPF informado pelo discente, sem unicidade própria; na criação da conta, a unicidade de `users.cpf` continua sendo a regra final. A associação a uma conta ou vínculo existente e a criação transacional pertencem ao fluxo futuro. Os campos profissionais atuais pertencem a `user_personal_data`; o usuário supervisor pode mantê-los em Configurações → Dados pessoais, após a criação da conta e do vínculo. Esses dados são apenas referência para cópia e confirmação em cada avaliação. A composição do snapshot do estágio e o fluxo de análise permanecem planejados.

## Auditoria

A tabela não duplica os campos de negócio em JSONB. O Activity Log registra os campos configurados no Model e a autoria disponível no contexto; respostas de consultas externas não são persistidas nesta tabela.

## Validação antes da produção

Na preparação para produção, validar estados, relações e integridade transacional conforme [Testes automatizados](doc:testes-existentes).
