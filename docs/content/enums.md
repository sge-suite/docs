---
id: enums
title: Enums
description: Índice dos enums do SGE, com status de implementação, valores persistidos e checklists individuais.
type: reference-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/enums, sge/banco-de-dados
related: enum-affiliationtype, enum-brazilianstate, enum-holidayscope, enum-emailmessagepurpose, enum-emaildeliveryattemptstatus, enum-internshiprequeststatus, enum-legalcapacitydeclaration, enum-internshiprequestcorrectionstatus, enum-internshipstatus, enum-partydocumenttype, enum-generateddocumenttype, enum-generateddocumentstatus, enum-generateddocumentorigin, enum-evaluationstatus, enum-registrationrequeststatus, enum-internshipcancellationrequeststatus, enum-emancipationevidencestatus, migrations, dominio-e-modelo-de-dados, enums-e-migrations
source_refs:
---
> [!abstract] Critério
> Um enum só deve existir quando o conjunto for pequeno, estável e parte da regra de negócio. Se o valor for configurável pelo Administrador do Campus ou crescer sem mudança de código, use tabela ou JSONB.

## Painel

| Status          | Enum                                        | Onde é usado                     |
| --------------- | ------------------------------------------- | -------------------------------- |
| ✅ Implementado | [Enum — AffiliationType](doc:enum-affiliationtype)            | `affiliations.type`              |
| ✅ Implementado | [Enum — BrazilianState](doc:enum-brazilianstate)              | `cities.state`, endereços, campi e calendários |
| 🟡 Planejado | [Enum — HolidayScope](doc:enum-holidayscope) | `holidays.scope` |
| ✅ Implementado | [Enum — EmailMessagePurpose](doc:enum-emailmessagepurpose)        | `email_messages.purpose`         |
| ✅ Implementado | [Enum — EmailDeliveryAttemptStatus](doc:enum-emaildeliveryattemptstatus) | `email_delivery_attempts.status` |
| ✅ Implementado | [Enum — InternshipRequestStatus](doc:enum-internshiprequeststatus)    | `internship_requests.status`     |
| ✅ Implementado | [Enum — LegalCapacityDeclaration](doc:enum-legalcapacitydeclaration)   | `internship_requests.legal_capacity_declaration` |
| ✅ Implementado | [Enum — InternshipRequestCorrectionStatus](doc:enum-internshiprequestcorrectionstatus) | `internship_request_corrections.status` |
| ✅ Implementado | [Enum — InternshipStatus](doc:enum-internshipstatus)           | `internships.status`             |
| ✅ Implementado | [Enum — PartyDocumentType](doc:enum-partydocumenttype)          | `granting_parties.document_type` |
| ✅ Implementado | [Enum — GeneratedDocumentType](doc:enum-generateddocumenttype)      | `generated_documents.type`       |
| ✅ Implementado | [Enum — GeneratedDocumentStatus](doc:enum-generateddocumentstatus)    | `generated_documents.status`     |
| ✅ Implementado | [Enum — GeneratedDocumentOrigin](doc:enum-generateddocumentorigin)    | `generated_documents.origin`     |
| ✅ Implementado | [Enum — EvaluationStatus](doc:enum-evaluationstatus)           | `supervisor_evaluations.status`  |
| ✅ Implementado | [Enum — RegistrationRequestStatus](doc:enum-registrationrequeststatus)  | solicitações de cadastro pendente |
| ✅ Implementado | [Enum — InternshipCancellationRequestStatus](doc:enum-internshipcancellationrequeststatus) | `internship_cancellation_requests.status` |
| ✅ Implementado | [Enum — EmancipationEvidenceStatus](doc:enum-emancipationevidencestatus) | `emancipation_evidences.status` |

## Checklist do catálogo

Neste índice, **Implementado** significa que a classe do enum e seus testes unitários já existem. O uso em Models, migrations, Policies e fluxos de domínio continua indicado no checklist individual.

- [ ] Confirmar cada enum contra a regra de negócio aprovada.
- [ ] Manter valores persistidos em inglês e `snake_case`.
- [ ] Manter rótulos de interface nas traduções/`label()`, sem persistir texto exibido.
- [ ] Adicionar teste para todos os cases, `values()` e `options()` quando esses métodos existirem.
- [ ] Atualizar a migration que usa o enum e o [painel de desenvolvimento](doc:painel-de-desenvolvimento).
- [ ] Não criar enum para permissões, templates, campus ou vínculos desativados quando a regra já for atendida por Policy, versão ou timestamp.

## O que não é enum agora

- `CampusStatus`: usar `deactivated_at`.
- `AffiliationStatus`: usar `deactivated_at`.
- `TemplateStatus`: usar versões e `activated_at`/`deactivated_at`.
- Autorização: implementar a matriz institucional em Policies/Gates, a partir de `AffiliationType` e do vínculo ativo; ela não é configurável em tempo de execução.
- Variáveis de template: usar catálogo fixo em português com `${variavel}`.
- Motivo/origem de jornada e fonte do calendário: strings auditadas; não são conjuntos fechados.
- Aditivos: usar `GeneratedDocumentType::Addendum`.
- Feriados: usar calendário nacional, estadual e municipal versionado, aplicável pela cidade/UF do endereço histórico do local de trabalho; exceções de um estágio ficam em `internship_calendar_overrides`.

## Navegação

- [Índice de migrations](doc:migrations)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados)
- [Portal antigo de enums e migrations](doc:enums-e-migrations)
