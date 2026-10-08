---
id: fase-03-activity-log
title: Fase 03 — Activity Log
description: Auditoria de alterações Eloquent nas tabelas de negócio, com autoria pelo vínculo ativo.
type: development-phase
status: completed
visibility: public
tags: sge/desenvolvimento, sge/auditoria, sge/checklist
related: migration-base-04-activity-log, modelo-de-dados-historico, e-mails-notificacoes-e-entregas, fase-04-integracao-de-email
source_refs: https://github.com/sge-suite/sge/blob/master/app/Http/Middleware/SetAuditActor.php, https://github.com/sge-suite/sge/blob/master/app/Support/AuditInfrastructureModel.php, https://github.com/sge-suite/sge/blob/master/app/Support/ActivityAccess.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeActivityScope.php, https://github.com/sge-suite/sge/blob/master/app/Policies/ActivityPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Providers/AppServiceProvider.php, https://github.com/sge-suite/sge/blob/master/app/Models/UserPersonalData.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/DatabaseAuditTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/ActiveAffiliationContextTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AuditInterfaceTest.php
---

A aplicação usa o **Spatie Activity Log** e a tabela `activity_log` criada pela migration base `2026_08_06_201115_create_activity_log_table.php`. O escopo decidido é registrar mutações feitas por Models Eloquent. Não há gatilho PostgreSQL de auditoria.

## Contrato de registro

Cada evento coberto guarda entidade, ação, data, valores anteriores e novos, e autoria. `SetAuditActor` resolve o vínculo validado em cada requisição. A seleção explícita pode atualizar `last_used_at`, mas essa memória operacional é excluída do Activity Log. O `CauserResolver` do Spatie grava `App\Models\Affiliation` como `causer`; `properties.user_id` e `properties.affiliation_id` guardam os dois identificadores. Ações de conta sem vínculo usam `App\Models\User`. `admin:create` registra `properties.actor=terminal`, sem `causer`; Jobs, seeders e comandos sem pessoa autenticada usam `properties.actor=system`.

CPF, CNPJ, e-mail, endereços e os demais campos de negócio configurados nos Models entram nos valores anteriores e novos, incluindo RG, nascimento, telefone e dados profissionais de `UserPersonalData`. Esse Model registra seus atributos fillable e também `emancipation_verified_at`, campo não fillable incluído explicitamente na auditoria por ser uma mudança de estado relevante. `id`, `created_at` e `updated_at` ficam fora do log. Senhas, tokens, chaves de idempotência, URLs assinadas e corpos de notificação não entram no Activity Log. A alteração de senha gera `password_changed`, sem senha ou hash. O conteúdo dos e-mails fica no histórico técnico separado em `email_messages` e `email_delivery_attempts`, não no Activity Log.

## Inventário de tabelas e mecanismos

| Tabelas | Mecanismo e caminhos cobertos |
| --- | --- |
| `users`, `user_personal_data`, `affiliations`, `addresses` | `LogsActivity` nos Models; criação, edição e exclusão Eloquent. `UserPersonalData` registra os campos fillable (`user_id`, dados pessoais/profissionais e `address_id`) e também `emancipation_verified_at`, explicitamente incluído no log embora não seja fillable. `id` e timestamps não são registrados. `User::delete()` remove os dados pessoais pelo Model, na mesma transação, para registrar a exclusão antes da cascata do banco. |
| `cities` | `LogsActivity` no Model; `CitySeeder` compara cada lote e salva somente cidades criadas ou alteradas pelo Model `City`, na mesma transação; os eventos Eloquent registram o sistema como autor. |
| `holidays`, `campuses`, `courses`, `internship_types`, `granting_parties`, `supervisor_registration_requests`, `granting_party_registration_requests` | `LogsActivity`; comandos que salvam Models, inclusive `holidays:import`, passam pelos eventos Eloquent. |
| `document_templates`, `template_versions`, `internships`, `supervisor_evaluations`, `internship_requests`, `generated_documents`, `internship_pauses`, `emancipation_evidences`, `internship_request_corrections`, `internship_cancellation_requests`, `internship_calendar_overrides`, `internship_work_schedules` | `LogsActivity`; transições, criação, edição, exclusão e restauração Eloquent. |
| `email_messages`, `email_delivery_attempts` | Histórico técnico próprio, sem `LogsActivity`: conteúdo imutável quando a finalidade o exige e tentativas com destinatário, vínculo solicitante, contexto do registro afetado e transições `queued → sent/failed`. Detalhes em [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas). Recuperação de senha não cria linhas nessas tabelas. Atualização de mensagem, alteração de tentativa concluída e exclusões via Model são bloqueadas. SQL direto está fora do escopo da auditoria da aplicação. |
| `media` | Observer `AuditInfrastructureModel` nos eventos Eloquent do Media Library; registra dono, coleção, nome, arquivo, tipo e tamanho. Exclui metadados estruturados que podem carregar URL ou credencial. |
| `notifications` | Mesmo observer no Model nativo do Laravel; registra tipo, destinatário e leitura, sem copiar `data` que pode conter link assinado. Como a chave é UUID e `activity_log.subject_id` é `bigint`, o UUID fica em `properties.record_id`. |
| `activity_log` | O próprio log não é registrado recursivamente. Atualização e exclusão via Model são bloqueadas; `activitylog:clean` é desabilitado. O bloqueio implementado vale para operações via Model; alterações SQL diretas estão fora do escopo. |
| `migrations`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `sessions`, `password_reset_tokens` | Tabelas técnicas excluídas do Activity Log por decisão de produto. São administradas pelos mecanismos e retenção do Laravel/PostgreSQL. |

## Consulta administrativa

A tela **Auditoria** tem índice e detalhes e exige, em cada requisição, o vínculo ativo selecionado de Administrador do Sistema. O escopo inclui alterações em campi, contas com vínculo administrativo e vínculos dos tipos Administrador do Sistema e Administrador do Campus. Não inclui estágios, documentos, concedentes ou registros e vínculos fora desse escopo. A Policy aplica o mesmo escopo ao índice e ao detalhe; não há bypass global. A seleção do vínculo não é registrada como atividade.

O índice identifica registro, ação, autoria e data. O detalhe apresenta apenas os valores efetivamente registrados, sem inferir alterações ausentes; em criações, não exibe valor anterior. O histórico relacionado aparece ao final das telas de detalhes de campi e contas; na conta, agrupa também os registros dos vínculos administrativos atuais ou excluídos. Senhas, hashes, tokens e outros segredos não são exibidos.

## Limites e testes

`LogsActivity` observa eventos dos Models. O `CitySeeder` usa `save()` por Model, e `User::delete()` exclui os dados pessoais pelo Model antes da conta, preservando os eventos Eloquent na mesma transação. Operações com Query Builder, SQL direto, `upsert`, exclusões exclusivamente por cascata no banco e escrita em tabelas técnicas não fazem parte da cobertura solicitada. O bloqueio de edição de `activity_log` se aplica ao Model e ao comando de limpeza do pacote; acesso SQL direto ao banco não é protegido por esse mecanismo.

`DatabaseAuditTest` verifica inventário de Models e tabelas, criação, edição, exclusão, valores antigos/novos e autoria por vínculo nos campos fillable de dados pessoais e profissionais e no estado `emancipation_verified_at`; também confirma que id e timestamps não entram no log. O teste cobre exclusão de credenciais, lote do catálogo, mídia, notificações, cascata via Model e rollback transacional. `CreateAdminCommandTest` verifica autoria `terminal`; testes de Jobs e importação verificam autoria `system`. Os testes de e-mail verificam o histórico técnico sem `LogsActivity`, e os testes de senha verificam o evento sem hash. `ActiveAffiliationContextTest` verifica escolha, troca, sessão inválida, vínculo desativado e vínculo alheio. Consulte [Testes existentes](doc:testes-existentes) para a matriz atual.

## Próxima etapa

[Fase 04 — Integração de e-mail](doc:fase-04-integracao-de-email)
