---
id: fase-03-activity-log
title: Fase 03 — Activity Log
description: Auditoria de alterações Eloquent nas tabelas de negócio, com autoria pelo vínculo ativo.
type: development-phase
status: completed
visibility: public
tags: sge/desenvolvimento, sge/auditoria, sge/checklist
related: migration-base-04-activity-log, modelo-de-dados-historico, e-mails-notificacoes-e-entregas, fase-04-integracao-de-email
source_refs: https://github.com/sge-suite/sge/blob/master/app/Http/Middleware/SetAuditActor.php, https://github.com/sge-suite/sge/blob/master/app/Support/AuditInfrastructureModel.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/DatabaseAuditTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/ActiveAffiliationContextTest.php
---

A aplicação usa o **Spatie Activity Log** e a tabela `activity_log` criada pela migration base `2026_08_06_201115_create_activity_log_table.php`. O escopo decidido é registrar mutações feitas por Models Eloquent. Não há gatilho PostgreSQL de auditoria.

## Contrato de registro

Cada evento de negócio guarda entidade, ação, data, valores anteriores e novos dos campos alterados, conta autora e vínculo ativo quando houver. `SetAuditActor` resolve o vínculo em cada requisição; a escolha explícita usa esse vínculo ao atualizar `last_used_at`. O `CauserResolver` do Spatie grava `App\Models\Affiliation` como `causer`; `properties.user_id` e `properties.affiliation_id` deixam ambos os identificadores explícitos. Uma ação de conta sem vínculo usa `App\Models\User`; comandos, Jobs e importações sem autenticação usam `actor=system`.

CPF, CNPJ, e-mail, endereço e demais campos cadastrais de negócio entram nos valores anteriores e novos. Senhas, tokens, chaves de idempotência, URLs de assinatura e conteúdo de e-mail não entram no Activity Log. Uma mudança que afeta só campo excluído ainda gera evento, sem o valor. A alteração de senha gera o evento `password_changed`, sem senha ou hash nos valores registrados. A recuperação de senha não cria registro nas tabelas de e-mail; o convite inicial cria somente uma tentativa de entrega, sem armazenar o corpo. Mensagens de notificações operacionais armazenam conteúdo sem cast criptografado. As migrations originais das tabelas de e-mail foram ajustadas porque este ambiente ainda não possui dados de produção.

## Inventário de tabelas e mecanismos

| Tabelas | Mecanismo e caminhos cobertos |
| --- | --- |
| `users`, `user_personal_data`, `affiliations`, `addresses` | `LogsActivity` nos Models; criação, edição e exclusão Eloquent. `User::delete()` remove os dados pessoais pelo Model, na mesma transação, para registrar a exclusão antes da cascata do banco. |
| `cities` | `LogsActivity` no Model; `CitySeeder` compara cada lote e salva somente cidades criadas ou alteradas pelo Model `City`, na mesma transação; os eventos Eloquent registram o sistema como autor. |
| `holidays`, `campuses`, `courses`, `internship_types`, `granting_parties`, `supervisor_registration_requests`, `granting_party_registration_requests` | `LogsActivity`; comandos que salvam Models, inclusive `holidays:import`, passam pelos eventos Eloquent. |
| `document_templates`, `template_versions`, `internships`, `supervisor_evaluations`, `internship_requests`, `generated_documents`, `internship_pauses`, `emancipation_evidences`, `internship_request_corrections`, `internship_cancellation_requests`, `internship_calendar_overrides`, `internship_work_schedules` | `LogsActivity`; transições, criação, edição, exclusão e restauração Eloquent. |
| `email_messages`, `email_delivery_attempts` | Histórico técnico próprio, sem `LogsActivity`: mensagem operacional imutável e tentativas com destinatário, solicitante e transições `queued → sent/failed`. O convite inicial cria só tentativa; recuperação de senha não cria linhas nessas tabelas. Atualização de mensagem, alteração de tentativa concluída e exclusões via Model são bloqueadas. SQL direto está fora do escopo da auditoria da aplicação. |
| `media` | Observer `AuditInfrastructureModel` nos eventos Eloquent do Media Library; registra dono, coleção, nome, arquivo, tipo e tamanho. Exclui metadados estruturados que podem carregar URL ou credencial. |
| `notifications` | Mesmo observer no Model nativo do Laravel; registra tipo, destinatário e leitura, sem copiar `data` que pode conter link assinado. Como a chave é UUID e `activity_log.subject_id` é `bigint`, o UUID fica em `properties.record_id`. |
| `activity_log` | O próprio log não é registrado recursivamente. Atualização e exclusão via Model são bloqueadas; `activitylog:clean` é desabilitado. O bloqueio implementado vale para operações via Model; alterações SQL diretas estão fora do escopo. |
| `migrations`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `sessions`, `password_reset_tokens` | Tabelas técnicas excluídas do Activity Log por decisão de produto. São administradas pelos mecanismos e retenção do Laravel/PostgreSQL. |

## Limites e testes

`LogsActivity` observa eventos dos Models. O `CitySeeder` usa `save()` por Model, e `User::delete()` exclui os dados pessoais pelo Model antes da conta, preservando os eventos Eloquent na mesma transação. Operações com Query Builder, SQL direto, `upsert`, exclusões exclusivamente por cascata no banco e escrita em tabelas técnicas não fazem parte da cobertura solicitada. O bloqueio de edição de `activity_log` se aplica ao Model e ao comando de limpeza do pacote; acesso SQL direto ao banco não é protegido por esse mecanismo.

`DatabaseAuditTest` verifica criação, edição, exclusão, valores antigos/novos, autoria por vínculo, exclusão de credenciais, lote do catálogo, mídia, notificações, cascata via Model e rollback transacional. Os testes de e-mail verificam o histórico técnico sem `LogsActivity`, e os testes de senha verificam o evento sem hash. `ActiveAffiliationContextTest` verifica escolha, troca, sessão inválida, vínculo desativado e vínculo alheio. Os testes direcionados de auditoria e contexto e a suíte completa passaram via Sail: 561 testes passaram e 2 foram ignorados, de 563. Pint e `git diff --check` passaram.

## Próxima etapa

[Fase 04 — Integração de e-mail](doc:fase-04-integracao-de-email)
