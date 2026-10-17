---
id: migration-12a-supervisor-registration-requests
title: Migration 12A — supervisor_registration_requests
description: Propostas tipadas de cadastro de supervisor e qualificação enviadas durante a abertura.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/cadastro
related: migration-02-user-personal-data, migration-04-affiliations, migration-12-granting-parties, enum-registrationrequeststatus, migration-19-internship-requests
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_162229_create_supervisor_registration_requests_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorRegistrationRequest.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorQualification.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRegistration.php, https://github.com/sge-suite/sge/blob/master/database/factories/SupervisorRegistrationRequestFactory.php
---
> [!success] Estado
> Migration, Model, factory, relação com o vínculo resultante, casts, validação e análise do Setor implementados. A abertura pode ser enviada com a proposta completa; o cadastro do vínculo e sua associação são operações explícitas do Setor. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

## Finalidade

Esta tabela guarda o pedido de cadastro quando o discente não seleciona um vínculo de supervisor já existente na abertura. Ela preserva os dados informados e a decisão do Setor como histórico da proposta. `users` guarda a identidade. `user_personal_data` mantém os dados pessoais e o cargo/função atuais; qualificações acadêmicas e profissionais ficam em várias linhas de `supervisor_qualifications`.

Na Migration 19, a solicitação aponta para um vínculo de supervisor existente ou para este pedido. O Setor cria ou escolhe o vínculo pela gestão existente e decide a associação; a Action registra o vínculo resultante no pedido e na solicitação, ou recusa com motivo. O aceite do estágio fica bloqueado enquanto a proposta não tiver sido aprovada e associada. A proposta e sua decisão permanecem no histórico.

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

O schema cria somente a chave primária e a FK do vínculo resultante. Não há FKs de autoria ou de revisor nesta tabela, índices secundários, unicidade ou constraints `CHECK`. A solicitação de estágio da Migration 19 identifica o vínculo discente responsável pelo envio. O Model participa do Activity Log Eloquent e registra a autoria conforme o contexto da requisição; Actions e Policies limitam a análise ao Setor do campus. O Model bloqueia a exclusão pelo Eloquent; não existe coluna `deleted_at`.

## Model, relação e validação

`SupervisorRegistrationRequest` relaciona-se com a `Affiliation` do supervisor resultante; `Affiliation` expõe a relação inversa. O Model usa os casts de `RegistrationRequestStatus`, `EducationLevel`, boolean, `CpfCast`, `PhoneCast` e datetime.

No evento `saving`, nome, CPF, telefone, e-mail e cargo/função podem ficar nulos somente em `Draft`; nos demais status exigem conteúdo válido. O `CpfCast` valida CPF brasileiro e o persiste apenas com dígitos; o telefone usa o `PhoneCast` existente e também é persistido apenas com dígitos. A escolha `has_academic_background` é obrigatória fora de `Draft`: formação na área exige curso e nível, deixando tempo de experiência vazio; experiência nas atividades exige tempo de experiência, deixando curso e nível vazios. Mesmo em rascunho, não se misturam os dois ramos quando a escolha já foi informada. A validação é compartilhada com o Model da avaliação. O fluxo de envio e análise é coordenado por `ReviewInternshipRegistration`: o Setor associa um vínculo ativo de Supervisor do mesmo campus, ou recusa com motivo. A conta e o vínculo são criados ou localizados explicitamente pela gestão de usuários; não há criação automática durante a análise.

A identidade da conta fica em `users`, com CPF único, nome e e-mail. O pedido guarda o CPF informado pelo Discente, sem unicidade própria. O Setor cria ou localiza explicitamente a conta e o vínculo, preservando a proposta e associando um vínculo ativo do mesmo campus. O pedido contém uma única qualificação; o perfil mantém cargo/função em `user_personal_data` e múltiplas qualificações em `supervisor_qualifications`. A qualificação adequada é escolhida no aceite e copiada para o snapshot do estágio.

## Auditoria

A tabela não duplica os campos de negócio em JSONB. O Activity Log registra os campos configurados no Model e a autoria disponível no contexto; respostas de consultas externas não são persistidas nesta tabela.

## Validação antes da produção

Na preparação para produção, validar estados, relações e integridade transacional conforme [Testes automatizados](doc:testes-existentes).

## Integração com a abertura — 16/10/2026

O Discente preenche uma proposta tipada no rascunho; o envio valida o CPF e o ramo acadêmico ou profissional e marca o pedido Submitted, sem criar conta ou vínculo automaticamente. O Setor usa a gestão de usuários/vínculos para criar ou localizar o supervisor e `ReviewInternshipRegistration` para associar o vínculo ativo do mesmo campus ou recusar com motivo. A decisão não reescreve a proposta, e o snapshot da abertura conserva a referência histórica ao pedido após a associação.
