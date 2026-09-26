---
id: migrations
title: Migrations
description: Índice executável das migrations do domínio do SGE, em ordem de dependência.
type: reference-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/migrations, sge/banco-de-dados
related: migration-base-01-users, migration-base-02-cache, migration-base-03-jobs, migration-base-04-activity-log, migration-base-05-media, migration-01a-cities, migration-01-addresses, migration-02-user-personal-data, migration-03-campuses, migration-04-affiliations, enum-affiliationtype, migration-05-notifications, migration-06-email-messages, enum-emailmessagepurpose, migration-07-email-delivery-attempts, enum-emaildeliveryattemptstatus, migration-09-courses, migration-10-course-id-em-affiliations, migration-11-internship-types, migration-12-granting-parties, enum-partydocumenttype, migration-12a-supervisor-registration-requests, enum-registrationrequeststatus, migration-12b-granting-party-registration-requests, migration-13-document-templates, migration-14-template-versions, migration-15-internships, enum-internshipstatus, migration-16-generated-documents, migration-17-internship-pauses, migration-18-supervisor-evaluations, enum-evaluationstatus, migration-19-internship-requests, enum-internshiprequeststatus, migration-19a-emancipation-evidences, enum-emancipationevidencestatus, migration-20-internship-request-corrections, enum-internshiprequestcorrectionstatus, migration-21-internship-cancellation-requests, enum-internshipcancellationrequeststatus, migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules, dominio-e-modelo-de-dados, enums, enums-e-migrations
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

Todas as migrations listadas abaixo estão implementadas. As sete últimas também tiveram aplicação, rollback e reaplicação verificados no PostgreSQL de testes. Os fluxos de geração documental, recálculo, análise e autorização ainda têm etapas pendentes descritas nas notas individuais.

> [!info] Fonte dos contratos
> A implementação segue os contratos desta pasta e as decisões aprovadas no planejamento.

> [!note] Numeração
> A ordem salta da migration 07 para a 09 porque não existe uma migration 08 no modelo atual. `01A` é um catálogo de referência que deve ser carregado antes de `01`, mesmo mantendo a identificação auxiliar para não renumerar o restante do domínio.

## Ordem de execução

A tabela segue a ordem dos nomes dos arquivos em `database/migrations`. Os números identificam as notas de domínio e não determinam a execução. Por isso, `22` vem antes de `01`, e `16`/`17` aparecem depois de `19`.

| Número | Migration | Tabela/alteração | Dependências principais |
| --- | --- | --- | --- |
| Base 01 | [Users](doc:migration-base-01-users) | contas, reset e sessões | — |
| Base 02 | [Cache](doc:migration-base-02-cache) | cache e locks | — |
| Base 03 | [Jobs](doc:migration-base-03-jobs) | filas | — |
| Base 04 | [Activity Log](doc:migration-base-04-activity-log) | auditoria | `users` |
| Base 05 | [Media](doc:migration-base-05-media) | arquivos polimórficos | — |
|  01A | [Migration 01A — cities](doc:migration-01a-cities)                           | catálogo local de cidades  | código IBGE                                                                                               |
|    22 | [Migration 22 — holidays](doc:migration-22-holidays)                       | feriados persistidos       | `cities`, [Enum — HolidayScope](doc:enum-holidayscope), [Enum — BrazilianState](doc:enum-brazilianstate) |
|    01 | [Migration 01 — addresses](doc:migration-01-addresses)                     | endereços atuais           | `cities`                                                                                                  |
|    02 | [Migration 02 — user_personal_data](doc:migration-02-user-personal-data)            | dados pessoais e profissionais por usuário | `users`, `addresses`                                                                                 |
|    03 | [Migration 03 — campuses](doc:migration-03-campuses)                      | campi                      | `addresses`                                                                                                |
|    04 | [Migration 04 — affiliations](doc:migration-04-affiliations) | vínculos base, sem `course_id` | `users`, `campuses`, [Enum — AffiliationType](doc:enum-affiliationtype) |
|    05 | [Migration 05 — notifications](doc:migration-05-notifications)                 | notificações internas nativas | `users`, `affiliations`                                                                                  |
|    06 | [Migration 06 — email_messages](doc:migration-06-email-messages)                | mensagens preparadas       | `notifications`, `users`, `affiliations`, [Enum — EmailMessagePurpose](doc:enum-emailmessagepurpose)                             |
|    07 | [Migration 07 — email_delivery_attempts](doc:migration-07-email-delivery-attempts)       | tentativas de transporte   | `email_messages`, [Enum — EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus)                                              |
|    09 | [Migration 09 — courses](doc:migration-09-courses)                       | cursos                     | `campuses`, `affiliations`                                                                                 |
|    10 | [Migration 10 — course_id em affiliations](doc:migration-10-course-id-em-affiliations)            | vínculo discente por curso | `courses`, `affiliations`                                                                                  |
|    11 | [Migration 11 — internship_types](doc:migration-11-internship-types)              | tipos e regras             | `courses`                                                                                                  |
|    12 | [Migration 12 — granting_parties](doc:migration-12-granting-parties)              | partes concedentes         | `addresses`, [Enum — PartyDocumentType](doc:enum-partydocumenttype)                                                            |
|   12A | [Migration 12A — supervisor_registration_requests](doc:migration-12a-supervisor-registration-requests) | pedidos de supervisor | `affiliations`, [Enum — RegistrationRequestStatus](doc:enum-registrationrequeststatus) |
|   12B | [Migration 12B — granting_party_registration_requests](doc:migration-12b-granting-party-registration-requests) | pedidos de concedente | `granting_parties`, [Enum — RegistrationRequestStatus](doc:enum-registrationrequeststatus), [Enum — PartyDocumentType](doc:enum-partydocumenttype), [Enum — BrazilianState](doc:enum-brazilianstate) |
|    13 | [Migration 13 — document_templates](doc:migration-13-document-templates)            | templates                  | `campuses`, [Enum — GeneratedDocumentType](doc:enum-generateddocumenttype)                               |
|    14 | [Migration 14 — template_versions](doc:migration-14-template-versions)             | versões de templates       | `document_templates`, `affiliations`, `media`                                                             |
|    15 | [Migration 15 — internships](doc:migration-15-internships)                   | estágios e snapshots       | `users`, `addresses`, `affiliations`, `courses`, `internship_types`, `granting_parties`, [Enum — InternshipStatus](doc:enum-internshipstatus) |
|    18 | [Migration 18 — supervisor_evaluations](doc:migration-18-supervisor-evaluations)                   | avaliações e referência vigente | `internships`, `affiliations`, [Enum — EvaluationStatus](doc:enum-evaluationstatus)                                      |
|    19 | [Migration 19 — internship_requests](doc:migration-19-internship-requests)           | solicitações de estágio    | `affiliations`, `courses`, `internship_types`, `granting_parties`, `supervisor_registration_requests`, `granting_party_registration_requests`, `internships`, [Enum — InternshipRequestStatus](doc:enum-internshiprequeststatus) |
|    16 | [Migration 16 — generated_documents](doc:migration-16-generated-documents)           | documentos gerados         | `internships`, `template_versions`, enums documentais                                      |
|    17 | [Migration 17 — internship_pauses](doc:migration-17-internship-pauses)             | pausas                     | `internships`                                                                                              |
|   19A | [Migration 19A — emancipation_evidences](doc:migration-19a-emancipation-evidences)        | provas de emancipação | `internship_requests`, `media`, [Enum — EmancipationEvidenceStatus](doc:enum-emancipationevidencestatus) |
|    20 | [Migration 20 — internship_request_corrections](doc:migration-20-internship-request-corrections) | correções de solicitações | `internship_requests`, [Enum — InternshipRequestCorrectionStatus](doc:enum-internshiprequestcorrectionstatus)                  |
|    21 | [Migration 21 — internship_cancellation_requests](doc:migration-21-internship-cancellation-requests) | pedidos de cancelamento | `internships`, [Enum — InternshipCancellationRequestStatus](doc:enum-internshipcancellationrequeststatus) |
|   22A | [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides) | exceções por estágio      | `internships`                                                                             |
|    23 | [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules)      | jornada e aditivos         | `internships`, `generated_documents`, calendário e exceções                              |

## Dependências críticas

{{diagram:migrations-ordem}}

> [!warning] Não inverter 04, 09 e 10
> `affiliations` precisa existir para que `courses` possa referenciar os coordenadores. `courses` precisa existir antes de adicionar `course_id` aos vínculos. Essa é a razão da separação da ordem.

> [!info] Ordem física e fluxo do produto
> A Migration 15 cria `internships` antes da 19 porque a solicitação guarda a FK única `internship_id`, evitando uma FK circular. No fluxo do produto, a pessoa cria a solicitação primeiro; o estágio só recebe uma linha após o aceite, na mesma transação que grava essa FK na solicitação.

## Prontidão para implementação

- As Migrations 05–07 estão implementadas. `notifications` usa a base nativa do Laravel 13 com ID UUID e `data` em `jsonb`; as duas tabelas de e-mail usam IDs `bigint` autoincrementais, FKs históricas, Models, casts e testes PostgreSQL. O fluxo de envio permanece planejado.
- As Migrations 09 e 10 estão implementadas. A 09 usa `primary_coordinator_affiliation_id` e `secondary_coordinator_affiliation_id`, ambas nullable para cadastro inicial sem coordenadores; o Model valida tipo, atividade e campus na atribuição. A 10 vincula cada discente a um curso do mesmo campus e preserva o histórico com `ON DELETE RESTRICT`.
- A Migration 12 usa `name` para o nome completo da concedente/unidade, permite documentos compartilhados entre unidades e deixa índices secundários e telas de cadastro para etapas futuras.
- A Migration 12A implementa pedidos de cadastro de supervisor com CPF e estados validados no Model, dados profissionais, associação ao vínculo resultante e bloqueio da exclusão pelo Model. O Model participa do Activity Log Eloquent, que identifica a conta e o vínculo ativo como autoria; o fluxo transacional de aprovação e sua Policy permanecem pendentes.
- A Migration 12B implementa pedidos de cadastro de concedente com CPF/CNPJ, endereço proposto, estados validados, relação com a concedente resultante e bloqueio da exclusão pelo Model. O Activity Log Eloquent registra autoria por contexto; o fluxo transacional de aprovação e sua Policy permanecem pendentes.
- A Migration 13 implementa o catálogo lógico de templates globais ou por campus, sem chave textual, com categoria por enum, desativação e Activity Log.
- A Migration 14 implementa versões DOCX por template, mídia privada no Media Library, hash único por template e seleção da versão validada mais recente. Uma geração referencia a versão usada; não cria outra versão. A FK da Migration 16 restringe a exclusão física da versão usada.
- A Migration 15 implementa o estágio com FKs para vínculos, curso, tipo e concedente, snapshots históricos, jornada inicial e data projetada; o cálculo automático e a criação pelo aceite da solicitação ficam para o fluxo funcional.
- A Migration 18 cria as avaliações do supervisor e as referências de liberação e avaliação vigente em `internships`, com validações do formulário no Model. Liberação, autorização, aprovação transacional e cálculo de nota permanecem no fluxo funcional.
- A Migration 19 implementa a solicitação com FKs para curso, tipo, concedente, supervisor e estágio, jornada em JSONB, estados, validações condicionais no Model, Activity Log e data do aceite dos termos. Checkbox, cálculo da data projetada e aprovação transacional permanecem para o fluxo; a Migration 19A já exige evidência no caminho emancipado.
- As Migrations 16, 17, 19A, 20, 21, 22A e 23 agora têm schema, Models, factories, relações e validações do registro. Geração/assinatura, upload/autorização, decisões, recálculo e concorrência transacional permanecem para os fluxos funcionais. Ainda faltam testes Pest específicos desses sete contratos.

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
