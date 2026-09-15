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

O painel original era uma Base do Obsidian: uma consulta às propriedades das notas. No Aurelius, a Base não vira uma falsa tabela dinâmica. Este índice é uma fotografia editorial da migração; os documentos vinculados continuam sendo a fonte de verdade.

**Como interpretar os status:** `implemented` indica que o artefato já existe no código; a integração com o domínio, as migrations, as Policies e os testes específicos podem continuar pendentes. `defined` indica contrato aprovado ainda não implementado; `planned` indica trabalho ainda não iniciado.

## Fases

- [Fase 00 — Preparação](doc:fase-00-preparacao) — **completed** — Checklist do ambiente, qualidade e fluxo de trabalho do projeto novo.
- [Fase 01 — Contratos de e-mail](doc:fase-01-contratos-de-e-mail) — **planned** — Checklist para fechar notificações, mensagens e tentativas de e-mail.
- [Fase 03 — Fundação de dados](doc:fase-03-fundacao-de-dados) — **planned** — Checklist da fundação de dados, enums, migrations, modelos e catálogos básicos.
- [Fase 04 — Conta e contexto](doc:fase-04-conta-e-contexto) — **planned** — Checklist de autenticação, vínculos ativos e configurações próprias.
- [Fase 05 — Administração](doc:fase-05-administracao) — **planned** — Checklist de policies, escopos, perfis e catálogos administrativos do SGE.
- [Fase 06 — Documentos](doc:fase-06-documentos) — **planned** — Checklist de templates DOCX, versões, geração e acompanhamento de assinatura.
- [Fase 07 — Abertura do estágio](doc:fase-07-abertura-do-estagio) — **planned** — Checklist de criação da solicitação, envio, análise e formalização inicial do estágio.
- [Fase 08 — Estágio em andamento](doc:fase-08-estagio-em-andamento) — **planned** — Checklist de pausas, substituições, aditivos, cancelamento e histórico do estágio.
- [Fase 09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao) — **planned** — Checklist de avaliações, notas, requisitos de encerramento e conclusão do estágio.
- [Fase 10 — Serviços transversais](doc:fase-10-servicos-transversais) — **planned** — Checklist de auditoria, Jobs, notificações, filtros, relatórios e operação segura.
- [Fases de desenvolvimento](doc:fases-de-desenvolvimento) — **in-progress** — Índice das fases executáveis do desenvolvimento do SGE.

## Enums

- [Enum — AffiliationType](doc:enum-affiliationtype) — **implemented** — Tipos funcionais permitidos para um vínculo institucional do SGE.
- [Enum — EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus) — **implemented** — Estados da tentativa de transporte de uma mensagem de e-mail; integração com o modelo ainda pendente.
- [Enum — EmailMessagePurpose](doc:enum-emailmessagepurpose) — **implemented** — Finalidades estáveis para mensagens de e-mail do SGE; integração com o modelo ainda pendente.
- [Enum — EmancipationEvidenceStatus](doc:enum-emancipationevidencestatus) — **implemented** — Ciclo da prova privada de emancipação analisada pelo Setor de Estágio; integração com o modelo ainda pendente.
- [Enum — EvaluationStatus](doc:enum-evaluationstatus) — **implemented** — Ciclo persistido das respostas de avaliação enviadas pelo supervisor; migration e integração ainda pendentes.
- [Enum — GeneratedDocumentOrigin](doc:enum-generateddocumentorigin) — **implemented** — Origem do documento registrado no processo de estágio.
- [Enum — GeneratedDocumentStatus](doc:enum-generateddocumentstatus) — **implemented** — Ciclo de vida de cada documento gerado ou registrado no estágio.
- [Enum — GeneratedDocumentType](doc:enum-generateddocumenttype) — **implemented** — Tipos de documentos registrados no processo de estágio.
- [Enum — InternshipCancellationRequestStatus](doc:enum-internshipcancellationrequeststatus) — **implemented** — Ciclo do pedido de cancelamento de estágio formalizado; integração com o modelo ainda pendente.
- [Enum — InternshipRequestCorrectionStatus](doc:enum-internshiprequestcorrectionstatus) — **implemented** — Ciclo de cada pendência devolvida na solicitação de estágio; integração ainda pendente.
- [Enum — InternshipRequestStatus](doc:enum-internshiprequeststatus) — **implemented** — Ciclo de preenchimento, envio e análise da solicitação nativa de estágio; integração ainda pendente.
- [Enum — InternshipStatus](doc:enum-internshipstatus) — **implemented** — Ciclo de formalização e execução de um estágio já criado no SGE; integração ainda pendente.
- [Enum — LegalCapacityDeclaration](doc:enum-legalcapacitydeclaration) — **implemented** — Opção declarada pelo discente para a capacidade civil no formulário de abertura; integração ainda pendente.
- [Enum — PartyDocumentType](doc:enum-partydocumenttype) — **implemented** — Tipo de documento de identificação da parte concedente.
- [Enum — RegistrationRequestStatus](doc:enum-registrationrequeststatus) — **implemented** — Ciclo das solicitações de cadastro de supervisor e parte concedente.

## Migrations

- [Migration base 01 — users](doc:migration-base-01-users) — **implemented** — Estado atual das tabelas de autenticação, reset de senha e sessões.
- [Migration base 02 — cache](doc:migration-base-02-cache) — **implemented** — Estado atual das tabelas de cache e locks do Laravel.
- [Migration base 03 — jobs](doc:migration-base-03-jobs) — **implemented** — Estado atual das filas, lotes e falhas de Jobs do Laravel.
- [Migration base 04 — activity_log](doc:migration-base-04-activity-log) — **implemented** — Estado atual da auditoria baseada no Spatie Activity Log.
- [Migration base 05 — media](doc:migration-base-05-media) — **implemented** — Estado atual do armazenamento de mídia polimórfica do Spatie Media Library.
- [Migration 01 — addresses](doc:migration-01-addresses) — **planned** — Contrato da tabela reutilizável de endereços atuais.
- [Migration 02 — user_personal_data](doc:migration-02-user-personal-data) — **planned** — Contrato dos dados pessoais separados da autenticação.
- [Migration 03 — campuses](doc:migration-03-campuses) — **planned** — Contrato da tabela de campi e do representante legal por vínculo.
- [Migration 04 — affiliations](doc:migration-04-affiliations) — **planned** — Contrato base dos vínculos institucionais e seu contexto de acesso.
- [Migration 05 — notifications](doc:migration-05-notifications) — **planned** — Extensão das notificações nativas do Laravel com contexto de vínculo.
- [Migration 06 — email_messages](doc:migration-06-email-messages) — **planned** — Snapshot imutável da mensagem de e-mail preparada para envio.
- [Migration 07 — email_delivery_attempts](doc:migration-07-email-delivery-attempts) — **planned** — Histórico append-only das tentativas de transporte de e-mails.
- [Migration 09 — courses](doc:migration-09-courses) — **planned** — Contrato dos cursos por campus e de seus coordenadores.
- [Migration 10 — course_id em affiliations](doc:migration-10-course-id-em-affiliations) — **planned** — Adiciona o curso obrigatório ao vínculo de discente sem criar ciclo de FK.
- [Migration 11 — internship_types](doc:migration-11-internship-types) — **planned** — Contrato dos tipos de estágio e suas regras configuráveis.
- [Migration 12 — granting_parties](doc:migration-12-granting-parties) — **planned** — Contrato das partes concedentes reutilizáveis e seu endereço atual.
- [Migration 12A — supervisor_registration_requests](doc:migration-12a-supervisor-registration-requests) — **planned** — Solicitações tipadas de cadastro de supervisor feitas durante a abertura.
- [Migration 12B — granting_party_registration_requests](doc:migration-12b-granting-party-registration-requests) — **planned** — Solicitações tipadas de cadastro de parte concedente feitas durante a abertura.
- [Migration 13 — document_templates](doc:migration-13-document-templates) — **planned** — Contrato do catálogo de templates DOCX do SGE.
- [Migration 14 — template_versions](doc:migration-14-template-versions) — **planned** — Contrato das versões imutáveis dos templates DOCX.
- [Migration 15 — internships](doc:migration-15-internships) — **planned** — Contrato do processo de estágio, referências atuais e snapshots históricos.
- [Migration 16 — generated_documents](doc:migration-16-generated-documents) — **planned** — Contrato dos documentos gerados ou registrados no estágio.
- [Migration 17 — internship_pauses](doc:migration-17-internship-pauses) — **planned** — Contrato das pausas de estágio e sua validação temporal.
- [Migration 18 — avaliações](doc:migration-18-avaliacoes) — **planned** — Estrutura planejada para rascunhos, envios e análise das avaliações do supervisor.
- [Migration 19 — internship_requests](doc:migration-19-internship-requests) — **planned** — Contrato da solicitação única de abertura de estágio preenchida pelo discente.
- [Migration 19A — emancipation_evidences](doc:migration-19a-emancipation-evidences) — **planned** — Histórico privado das provas de emancipação e sua análise manual.
- [Migration 20 — internship_request_corrections](doc:migration-20-internship-request-corrections) — **planned** — Pendências operacionais que direcionam a edição da solicitação de estágio.
- [Migration 21 — internship_cancellation_requests](doc:migration-21-internship-cancellation-requests) — **planned** — Pedidos rastreáveis de cancelamento de estágio formalizado feitos pelo discente.
- [Migration 22 — internship_work_schedules](doc:migration-22-internship-work-schedules) — **planned** — Jornada semanal pactuada, preservada por vigência somente quando um aditivo formalizado a alterar.

## Componentes técnicos

- [Action — ResetUserPassword](doc:action-resetuserpassword) — **implemented** — Implementação do contrato Fortify para validar e salvar a nova senha.
- [Actions](doc:actions) — **in-progress** — Índice das Actions de aplicação que encapsulam operações de negócio.
- [Cast — CpfCast](doc:cast-cpfcast) — **implemented** — Cast Eloquent que valida CPF e armazena o documento sem máscara.
- [Casts](doc:casts) — **in-progress** — Índice dos casts Eloquent que transformam dados entre entrada, domínio e banco.
- [Concern — PasswordValidationRules](doc:concern-passwordvalidationrules) — **implemented** — Regras compartilhadas para criação/alteração e confirmação de senha.
- [Concern — ProfileValidationRules](doc:concern-profilevalidationrules) — **implemented** — Regras compartilhadas para nome e e-mail de perfil.
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
