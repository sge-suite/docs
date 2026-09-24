---
id: painel-de-desenvolvimento
title: Painel de desenvolvimento
description: Índice estático das fases, enums, migrations, componentes, integrações e decisões do desenvolvimento do SGE.
type: reference-hub
status: maintained
visibility: public
tags: sge/desenvolvimento, sge/planejamento, sge/navegacao
related: fases-de-desenvolvimento, enums, migrations, componentes-tecnicos, backlog-e-decisoes
source_refs:
---

## Como ler

Este índice é uma fotografia editorial da documentação publicada. Os documentos vinculados continuam sendo a fonte de verdade; os status servem para navegação e acompanhamento, não substituem o contrato técnico.

**Como interpretar os status:** `implemented` indica que o artefato já existe no código; a integração com o domínio, as migrations, as Policies e os testes específicos podem continuar pendentes. `defined` indica contrato aprovado ainda não implementado; `planned` indica trabalho ainda não iniciado.

## Fases

Para a sequência de execução atual, incluindo a próxima fase transversal de auditoria, consulte [Fases de desenvolvimento](doc:fases-de-desenvolvimento).

- [Fase 00 — Preparação](doc:fase-00-preparacao) — **completed** — Checklist do ambiente, qualidade e fluxo de trabalho do projeto novo.
- [Fase 01 — Fundação de dados](doc:fase-01-fundacao-de-dados) — **completed** — Migrations, Models, factories e testes PostgreSQL da base de dados.
- [Fase 02 — Activity Log](doc:fase-02-activity-log) — **in-progress** — Próxima etapa: cobrir entidades de negócio e vincular autoria ao contexto ativo.
- [Fase 03 — Integração de e-mail](doc:fase-03-integracao-de-email) — **planned** — Backend comum para preparação, transporte, tentativas e reprocessamento de e-mails.
- [Fase 04 — Conta e contexto](doc:fase-04-conta-e-contexto) — **planned** — Checklist de autenticação, vínculos ativos e configurações próprias.
- [Fase 05 — Administração hierárquica](doc:fase-05-administracao) — **planned** — Backend e interfaces administrativas em ordem de escopo, do global ao local.
- [Fase 06 — Documentos](doc:fase-06-documentos) — **planned** — Checklist de templates DOCX, versões, geração e acompanhamento de assinatura.
- [Fase 07 — Abertura do estágio](doc:fase-07-abertura-do-estagio) — **planned** — Checklist de criação da solicitação, envio, análise e formalização inicial do estágio.
- [Fase 08 — Estágio em andamento](doc:fase-08-estagio-em-andamento) — **planned** — Checklist de pausas, substituições, aditivos, cancelamento e histórico do estágio.
- [Fase 09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao) — **planned** — Checklist de avaliações, notas, requisitos de encerramento e conclusão do estágio.
- [Fases de desenvolvimento](doc:fases-de-desenvolvimento) — **in-progress** — Índice das fases executáveis do desenvolvimento do SGE.

## Enums

- [Enum — AffiliationType](doc:enum-affiliationtype) — **implemented** — Tipos funcionais permitidos para um vínculo institucional do SGE.
- [Enum — BrazilianState](doc:enum-brazilianstate) — **implemented** — Unidades federativas usadas por cidades, endereços, campi e calendários; integração com os modelos ainda pendente.
- [Enum — HolidayScope](doc:enum-holidayscope) — **implemented** — Escopo nacional, estadual ou municipal de um feriado.
- [Enum — EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus) — **implemented** — Estados da tentativa de transporte de uma mensagem de e-mail; integração com o modelo ainda pendente.
- [Enum — EmailMessagePurpose](doc:enum-emailmessagepurpose) — **implemented** — Finalidades estáveis para mensagens de e-mail do SGE; integração com o modelo ainda pendente.
- [Enum — EmancipationEvidenceStatus](doc:enum-emancipationevidencestatus) — **implemented** — Ciclo da prova privada de emancipação analisada pelo Setor de Estágio; integração com o modelo ainda pendente.
- [Enum — EvaluationStatus](doc:enum-evaluationstatus) — **implemented** — Ciclo persistido das respostas de avaliação enviadas pelo supervisor; migration e integração ainda pendentes.
- [Enum — GeneratedDocumentOrigin](doc:enum-generateddocumentorigin) — **implemented** — Origem do documento registrado no processo de estágio.
- [Enum — GeneratedDocumentStatus](doc:enum-generateddocumentstatus) — **implemented** — Ciclo de vida de cada documento gerado ou registrado no estágio.
- [Enum — GeneratedDocumentType](doc:enum-generateddocumenttype) — **implemented** — Tipos de documentos registrados no processo de estágio.
- [Enum — InternshipCancellationRequestStatus](doc:enum-internshipcancellationrequeststatus) — **implemented** — Ciclo do pedido de cancelamento de estágio formalizado; fluxo decisório pendente.
- [Enum — InternshipRequestCorrectionStatus](doc:enum-internshiprequestcorrectionstatus) — **implemented** — Ciclo de cada pendência devolvida na solicitação de estágio; fluxo de análise pendente.
- [Enum — InternshipRequestStatus](doc:enum-internshiprequeststatus) — **implemented** — Ciclo de preenchimento, envio e análise da solicitação nativa de estágio; transições do fluxo pendentes.
- [Enum — InternshipStatus](doc:enum-internshipstatus) — **implemented** — Ciclo de formalização e execução de um estágio já criado no SGE; integração ainda pendente.
- [Enum — LegalCapacityDeclaration](doc:enum-legalcapacitydeclaration) — **implemented** — Opção declarada pelo discente para a capacidade civil; interface e análise manual pendentes.
- [Enum — PartyDocumentType](doc:enum-partydocumenttype) — **implemented** — Tipo de documento de identificação da parte concedente.
- [Enum — RegistrationRequestStatus](doc:enum-registrationrequeststatus) — **implemented** — Ciclo das solicitações de cadastro de supervisor e parte concedente.

## Migrations

Sequência física dos arquivos em `database/migrations`; os números permanecem como identificadores das notas.

- [Migration base 01 — users](doc:migration-base-01-users) — **implemented** — Estado atual das tabelas de autenticação, reset de senha e sessões.
- [Migration base 02 — cache](doc:migration-base-02-cache) — **implemented** — Estado atual das tabelas de cache e locks do Laravel.
- [Migration base 03 — jobs](doc:migration-base-03-jobs) — **implemented** — Estado atual das filas, lotes e falhas de Jobs do Laravel.
- [Migration base 04 — activity_log](doc:migration-base-04-activity-log) — **implemented** — Estado atual da auditoria baseada no Spatie Activity Log.
- [Migration base 05 — media](doc:migration-base-05-media) — **implemented** — Estado atual do armazenamento de mídia polimórfica do Spatie Media Library.
- [Migration 01A — cities](doc:migration-01a-cities) — **implemented** — Catálogo local de cidades identificado pelo código IBGE, carregado pelo `CitySeeder` antes dos endereços.
- [Migration 22 — holidays](doc:migration-22-holidays) — **implemented** — Base persistida de feriados nacional, estadual e municipal, com importação BrasilAPI para nacionais e estaduais.
- [Migration 01 — addresses](doc:migration-01-addresses) — **implemented** — Base backend com cidade local, validação dos campos obrigatórios, Activity Log e cópia histórica; consulta e validação de CEP continuam pendentes.
- [Migration 02 — user_personal_data](doc:migration-02-user-personal-data) — **implemented** — Dados pessoais e profissionais opcionais por usuário; CPF permanece na conta.
- [Migration 03 — campuses](doc:migration-03-campuses) — **implemented** — Tabela de campi; representante legal e cargo permanecem textuais no próprio campus.
- [Migration 04 — affiliations](doc:migration-04-affiliations) — **implemented** — Schema PostgreSQL, modelo, validação, factory, relações e Activity Log; login e sessão seguem na Fase 04.
- [Migration 05 — notifications](doc:migration-05-notifications) — **implemented** — Tabela nativa do Laravel para notificações internas.
- [Migration 06 — email_messages](doc:migration-06-email-messages) — **implemented** — Snapshot imutável da mensagem de e-mail preparada para envio.
- [Migration 07 — email_delivery_attempts](doc:migration-07-email-delivery-attempts) — **implemented** — Histórico append-only das tentativas de transporte de e-mails.
- [Migration 09 — courses](doc:migration-09-courses) — **implemented** — Cursos por campus e dois vínculos coordenadores opcionais no cadastro inicial.
- [Migration 10 — course_id em affiliations](doc:migration-10-course-id-em-affiliations) — **implemented** — Curso obrigatório para vínculo discente por validação do Model.
- [Migration 11 — internship_types](doc:migration-11-internship-types) — **implemented** — Contrato dos tipos de estágio e suas regras configuráveis.
- [Migration 12 — granting_parties](doc:migration-12-granting-parties) — **implemented** — Contrato das partes concedentes reutilizáveis e seu endereço atual.
- [Migration 12A — supervisor_registration_requests](doc:migration-12a-supervisor-registration-requests) — **implemented** — Solicitações tipadas de cadastro de supervisor feitas durante a abertura.
- [Migration 12B — granting_party_registration_requests](doc:migration-12b-granting-party-registration-requests) — **implemented** — Solicitações tipadas de cadastro de parte concedente feitas durante a abertura.
- [Migration 13 — document_templates](doc:migration-13-document-templates) — **implemented** — Contrato do catálogo de templates DOCX do SGE.
- [Migration 14 — template_versions](doc:migration-14-template-versions) — **in-progress** — Versões DOCX privadas, com preservação após uso; validação do upload e integração com geração ainda pendentes.
- [Migration 15 — internships](doc:migration-15-internships) — **in-progress** — Contrato do processo de estágio, referências atuais e snapshots históricos.
- [Migration 18 — supervisor_evaluations](doc:migration-18-supervisor-evaluations) — **implemented** — Schema, Model, factory e testes da avaliação do supervisor; fluxo funcional pendente.
- [Migration 19 — internship_requests](doc:migration-19-internship-requests) — **implemented** — Contrato da solicitação única de abertura de estágio preenchida pelo discente.
- [Migration 16 — generated_documents](doc:migration-16-generated-documents) — **implemented** — Contrato dos documentos gerados ou registrados no estágio.
- [Migration 17 — internship_pauses](doc:migration-17-internship-pauses) — **implemented** — Contrato das pausas de estágio e sua validação temporal.
- [Migration 19A — emancipation_evidences](doc:migration-19a-emancipation-evidences) — **implemented** — Histórico privado das provas de emancipação e sua análise manual.
- [Migration 20 — internship_request_corrections](doc:migration-20-internship-request-corrections) — **implemented** — Pendências operacionais que direcionam a edição da solicitação de estágio.
- [Migration 21 — internship_cancellation_requests](doc:migration-21-internship-cancellation-requests) — **implemented** — Pedidos rastreáveis de cancelamento de estágio formalizado feitos pelo discente.
- [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides) — **implemented** — Exceções de expediente específicas de um estágio.
- [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules) — **implemented** — Jornada semanal pactuada, preservada por vigência somente quando um aditivo formalizado a alterar.

## Componentes técnicos

- [Action — ResetUserPassword](doc:action-resetuserpassword) — **implemented** — Implementação do contrato Fortify para validar e salvar a nova senha.
- [Actions](doc:actions) — **in-progress** — Índice das Actions de aplicação que encapsulam operações de negócio.
- [Cast — CpfCast](doc:cast-cpfcast) — **implemented** — Cast Eloquent que valida CPF e armazena o documento sem máscara.
- [Cast — PhoneCast](doc:cast-phonecast) — **implemented** — Cast Eloquent que valida telefone fixo/celular com DDD e persiste somente os dígitos.
- [Casts](doc:casts) — **in-progress** — Índice dos casts Eloquent que transformam dados entre entrada, domínio e banco.
- [Concern — PasswordValidationRules](doc:concern-passwordvalidationrules) — **implemented** — Regras compartilhadas para criação/alteração e confirmação de senha.
- [Concern — ProfileValidationRules](doc:concern-profilevalidationrules) — **implemented** — Regras compartilhadas para nome e e-mail de perfil.
- [Concern — CityValidationRules](doc:migration-01a-cities) — **implemented** — Regras compartilhadas para código IBGE, nome e UF do catálogo local.
- [Concern — HolidayValidationRules](doc:migration-22-holidays) — **implemented** — Regras compartilhadas para data, nome, escopo, UF e cidade dos feriados.
- [Concerns](doc:concerns) — **in-progress** — Índice dos traits que centralizam regras reutilizáveis de validação.
- [Configuração e bootstrap](doc:configuracao-e-bootstrap) — **in-progress** — Mapa dos arquivos que inicializam a aplicação e configuram autenticação, locale, filas, cache e rotas.
- [Helper — BrazilianAddressHelper](doc:helper-brazilianaddresshelper) — **implemented** — Formatação de CEP brasileiro para apresentação.
- [Helper — BrazilianContactHelper](doc:helper-braziliancontacthelper) — **implemented** — Formatação de telefones brasileiros locais, com DDD e com DDI 55.
- [Helper — BrazilianDocumentHelper](doc:helper-braziliandocumenthelper) — **implemented** — Formatação de CPF e CNPJ brasileiros a partir de valores normalizados.
- [Helper — CurrencyHelper](doc:helper-currencyhelper) — **implemented** — Formatação de valores monetários usando locale e moeda configurados.
- [Helper — DateHelper](doc:helper-datehelper) — **implemented** — Formatação de datas e horários com timezone configurado na aplicação.
- [Helper — DigitsHelper](doc:helper-digitshelper) — **implemented** — Normalização de valores para uma sequência de dígitos.
- [Helper — Funções globais](doc:helper-funcoes-globais) — **implemented** — Funções globais carregadas pelo Composer que delegam a helpers de domínio.
- [Helper — NumberToWordsHelper](doc:helper-numbertowordshelper) — **implemented** — Conversão determinística de números e valores em reais para texto por extenso.
- [Helpers](doc:helpers) — **in-progress** — Índice dos helpers de formatação, normalização e apresentação do SGE.
- [Model — User](doc:model-user) — **in-progress** — Estado atual do Model de autenticação e seus casts, atributos e relações futuras.
- [Provider — AppServiceProvider](doc:provider-appserviceprovider) — **implemented** — Configuração global atual de Eloquent, locale, timezone e moeda.
- [Provider — FortifyServiceProvider](doc:provider-fortifyserviceprovider) — **implemented** — Configuração atual de Actions, telas e rate limiting de autenticação do Fortify.
- [Providers](doc:providers) — **in-progress** — Índice dos Service Providers que configuram autenticação, locale, moeda e comportamento Eloquent.
- [Desenvolvimento — Checklist de funcionalidade](doc:desenvolvimento-checklist-de-funcionalidade) — **maintained** — Checklist reutilizável para implementar qualquer funcionalidade ou regra do SGE.
- [Schedules](doc:schedules) — **planned** — Contrato dos comandos agendados que reconciliam a execução do estágio e vencimentos documentais.
- [Service — InternshipEndDateCalculator](doc:service-internshipenddatecalculator) — **planned** — Contrato técnico do cálculo reproduzível da previsão de término.
- [Service — InternshipGradeCalculator](doc:service-internshipgradecalculator) — **planned** — Contrato técnico das notas de supervisor, relatório, apresentação e resultado consolidado.
- [Services](doc:services) — **planned** — Índice dos serviços de domínio planejados para cálculos, documentos, snapshots e transições.
- [Testes existentes](doc:testes-existentes) — **in-progress** — Mapa da cobertura de testes já presente no projeto novo e lacunas conhecidas.

## Integrações

- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas) — **defined** — Contrato planejado para notificações internas, mensagens de e-mail e tentativas de entrega.
- [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis) — **defined** — Arquitetura da geração DOCX, validação de templates e catálogo canônico de variáveis.

## Decisões

- [Backlog e decisões](doc:backlog-e-decisoes) — **in-progress** — Decisões aprovadas e assuntos ainda pendentes no planejamento do SGE.
- [Cadastros pendentes de supervisor e concedente](doc:cadastros-pendentes-de-supervisor-e-concedente) — **planned** — Contrato de dados e análise dos cadastros solicitados durante a abertura de estágio.
