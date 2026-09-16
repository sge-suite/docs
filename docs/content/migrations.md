---
id: migrations
title: Migrations
description: Índice executável das migrations do domínio do SGE, em ordem de dependência.
type: reference-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/migrations, sge/banco-de-dados
related: migration-base-01-users, migration-base-02-cache, migration-base-03-jobs, migration-base-04-activity-log, migration-base-05-media, migration-01a-cities, migration-01-addresses, migration-02-user-personal-data, migration-03-campuses, migration-04-affiliations, enum-affiliationtype, migration-05-notifications, migration-06-email-messages, enum-emailmessagepurpose, migration-07-email-delivery-attempts, enum-emaildeliveryattemptstatus, migration-09-courses, migration-10-course-id-em-affiliations, migration-11-internship-types, migration-12-granting-parties, enum-partydocumenttype, migration-12a-supervisor-registration-requests, enum-registrationrequeststatus, migration-12b-granting-party-registration-requests, migration-13-document-templates, migration-14-template-versions, migration-15-internships, enum-internshipstatus, migration-16-generated-documents, migration-17-internship-pauses, migration-18-avaliacoes, enum-evaluationstatus, migration-19-internship-requests, enum-internshiprequeststatus, migration-19a-emancipation-evidences, enum-emancipationevidencestatus, migration-20-internship-request-corrections, enum-internshiprequestcorrectionstatus, migration-21-internship-cancellation-requests, enum-internshipcancellationrequeststatus, migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules, dominio-e-modelo-de-dados, enums, enums-e-migrations
source_refs:
diagram: migrations-ordem
---
> [!abstract] Regra
> Cada migration deve ser pequena, revisável e testada em banco limpo. A nota individual registra o contrato; o arquivo PHP implementa o contrato.

## Estado da fundação atual

Estas migrations já existem no projeto novo e não devem ser recriadas. Cada uma tem uma nota com o contrato real, o rollback atual e as pendências de integração:

- [`users`, `password_reset_tokens` e `sessions`](doc:migration-base-01-users) — autenticação;
- [`cache` e `cache_locks`](doc:migration-base-02-cache) — cache e locks;
- [`jobs`, `job_batches` e `failed_jobs`](doc:migration-base-03-jobs) — filas;
- [`activity_log`](doc:migration-base-04-activity-log) — auditoria;
- [`media`](doc:migration-base-05-media) — arquivos polimórficos;

Não há migration de permissões: as tabelas anteriormente previstas foram removidas e a autorização usa Gates e Policies com os vínculos.

As migrations de [`cities`](doc:migration-01a-cities), [`addresses`](doc:migration-01-addresses) e [`holidays`](doc:migration-22-holidays) já estão implementadas e testadas em PostgreSQL. As demais continuam no backlog até o código e os testes confirmarem seus contratos; as notas individuais distinguem a base disponível das integrações futuras.

> [!info] Fonte dos contratos
> A implementação segue os contratos desta pasta e as decisões aprovadas no planejamento.

> [!note] Numeração
> A ordem salta da migration 07 para a 09 porque não existe uma migration 08 no modelo atual. `01A` é um catálogo de referência que deve ser carregado antes de `01`, mesmo mantendo a identificação auxiliar para não renumerar o restante do domínio.

## Ordem de execução

| Ordem | Migration                                                | Tabela/alteração           | Dependências principais                                                                                    |
| ----: | -------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
|  01A | [Migration 01A — cities](doc:migration-01a-cities)                           | catálogo local de cidades  | código IBGE                                                                                               |
|    01 | [Migration 01 — addresses](doc:migration-01-addresses)                     | endereços atuais           | `cities`                                                                                                  |
|    02 | [Migration 02 — user_personal_data](doc:migration-02-user-personal-data)            | dados pessoais             | `users`, `addresses`                                                                                       |
|    03 | [Migration 03 — campuses](doc:migration-03-campuses)                      | campi                      | `addresses`                                                                                                |
|    04 | [Migration 04 — affiliations](doc:migration-04-affiliations)                  | vínculos base              | `users`, `campuses`, [Enum — AffiliationType](doc:enum-affiliationtype)                                                      |
|    05 | [Migration 05 — notifications](doc:migration-05-notifications)                 | notificações internas      | `users`, `affiliations`                                                                                    |
|    06 | [Migration 06 — email_messages](doc:migration-06-email-messages)                | mensagens preparadas       | `notifications`, `users`, `affiliations`, [Enum — EmailMessagePurpose](doc:enum-emailmessagepurpose)                             |
|    07 | [Migration 07 — email_delivery_attempts](doc:migration-07-email-delivery-attempts)       | tentativas de transporte   | `email_messages`, [Enum — EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus)                                              |
|    09 | [Migration 09 — courses](doc:migration-09-courses)                       | cursos                     | `campuses`, `affiliations`                                                                                 |
|    10 | [Migration 10 — course_id em affiliations](doc:migration-10-course-id-em-affiliations)            | vínculo discente por curso | `courses`, `affiliations`                                                                                  |
|    11 | [Migration 11 — internship_types](doc:migration-11-internship-types)              | tipos e regras             | `courses`                                                                                                  |
|    12 | [Migration 12 — granting_parties](doc:migration-12-granting-parties)              | partes concedentes         | `addresses`, [Enum — PartyDocumentType](doc:enum-partydocumenttype)                                                            |
|   12A | [Migration 12A — supervisor_registration_requests](doc:migration-12a-supervisor-registration-requests) | pedidos de supervisor | `affiliations`, [Enum — RegistrationRequestStatus](doc:enum-registrationrequeststatus) |
|   12B | [Migration 12B — granting_party_registration_requests](doc:migration-12b-granting-party-registration-requests) | pedidos de concedente | `affiliations`, [Enum — RegistrationRequestStatus](doc:enum-registrationrequeststatus), [Enum — PartyDocumentType](doc:enum-partydocumenttype) |
|    13 | [Migration 13 — document_templates](doc:migration-13-document-templates)            | templates                  | —                                                                                                          |
|    14 | [Migration 14 — template_versions](doc:migration-14-template-versions)             | versões de templates       | `document_templates`                                                                                       |
|    15 | [Migration 15 — internships](doc:migration-15-internships)                   | estágios e snapshots       | `users`, `addresses`, `courses`, `internship_types`, `granting_parties`, [Enum — InternshipStatus](doc:enum-internshipstatus) |
|    16 | [Migration 16 — generated_documents](doc:migration-16-generated-documents)           | documentos gerados         | `internships`, `template_versions`, enums documentais                                                      |
|    17 | [Migration 17 — internship_pauses](doc:migration-17-internship-pauses)             | pausas                     | `internships`                                                                                              |
|    18 | [Migration 18 — avaliações](doc:migration-18-avaliacoes)                   | avaliações do supervisor   | `internships`, `affiliations`, [Enum — EvaluationStatus](doc:enum-evaluationstatus)                                           |
|    19 | [Migration 19 — internship_requests](doc:migration-19-internship-requests)           | solicitações de estágio    | `affiliations`, `courses`, `internship_types`, `granting_parties`, `internships`, [Enum — InternshipRequestStatus](doc:enum-internshiprequeststatus) |
|   19A | [Migration 19A — emancipation_evidences](doc:migration-19a-emancipation-evidences)        | provas de emancipação      | `internship_requests`, `media`, [Enum — EmancipationEvidenceStatus](doc:enum-emancipationevidencestatus) |
|    20 | [Migration 20 — internship_request_corrections](doc:migration-20-internship-request-corrections) | correções de solicitações | `internship_requests`, `affiliations`, [Enum — InternshipRequestCorrectionStatus](doc:enum-internshiprequestcorrectionstatus)                  |
|    21 | [Migration 21 — internship_cancellation_requests](doc:migration-21-internship-cancellation-requests) | pedidos de cancelamento | `internships`, `affiliations`, [Enum — InternshipCancellationRequestStatus](doc:enum-internshipcancellationrequeststatus) |
|    22 | [Migration 22 — holidays](doc:migration-22-holidays)                       | feriados persistidos       | `cities`, [Enum — HolidayScope](doc:enum-holidayscope), [Enum — BrazilianState](doc:enum-brazilianstate) |
|   22A | [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides) | exceções por estágio      | `internships`, `affiliations`                                                                             |
|    23 | [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules)      | jornada e aditivos         | `internships`, `generated_documents`, `affiliations`, calendário e exceções                              |

## Dependências críticas

{{diagram:migrations-ordem}}

> [!warning] Não inverter 04, 09 e 10
> `affiliations` precisa existir para que `courses` possa referenciar os coordenadores. `courses` precisa existir antes de adicionar `course_id` aos vínculos. Essa é a razão da separação da ordem.

## Checklist comum

Cada nota individual deve terminar com todos estes pontos marcados:

- [ ] contrato revisado contra [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados);
- [ ] FKs, índices, nulabilidade e unicidade definidos;
- [ ] `cascade`, `restrict` ou `nullOnDelete` escolhidos conscientemente;
- [ ] migration criada e nomeada conforme a tabela/alteração;
- [ ] Model, relações, casts de enum e casts de JSONB atualizados;
- [ ] factory/seed mínima criada quando aplicável;
- [ ] `migrate` executado em banco limpo;
- [ ] `migrate:rollback` testado quando a reversão for segura;
- [ ] testes de restrições e casos inválidos criados;
- [ ] [fase](doc:painel-de-desenvolvimento) e modelo de dados atualizados.

## Navegação

- [Índice de enums](doc:enums)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados)
- [Portal antigo de enums e migrations](doc:enums-e-migrations)
