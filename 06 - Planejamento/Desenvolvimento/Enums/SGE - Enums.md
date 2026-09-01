---
title: SGE — Enums
description: Índice dos enums do SGE, com status de implementação, valores persistidos e checklists individuais.
type: reference-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/enums
  - sge/banco-de-dados
aliases:
  - Índice de enums do SGE
---
> [!abstract] Critério
> Um enum só deve existir quando o conjunto for pequeno, estável e parte da regra de negócio. Se o valor for configurável pelo Administrador do Campus ou crescer sem mudança de código, use tabela ou JSONB.

## Painel

| Status          | Enum                                        | Onde é usado                     |
| --------------- | ------------------------------------------- | -------------------------------- |
| ✅ Implementado | [[SGE - Enum - AffiliationType]]            | `affiliations.type`              |
| 🟡 Planejado    | [[SGE - Enum - EmailMessagePurpose]]        | `email_messages.purpose`         |
| 🟡 Planejado    | [[SGE - Enum - EmailDeliveryAttemptStatus]] | `email_delivery_attempts.status` |
| 🟡 Planejado    | [[SGE - Enum - InternshipRequestStatus]]    | `internship_requests.status`     |
| 🟡 Planejado    | [[SGE - Enum - LegalCapacityDeclaration]]   | `internship_requests.legal_capacity_declaration` |
| 🟡 Planejado    | [[SGE - Enum - InternshipRequestCorrectionStatus]] | `internship_request_corrections.status` |
| 🟡 Planejado    | [[SGE - Enum - InternshipStatus]]           | `internships.status`             |
| ✅ Implementado | [[SGE - Enum - PartyDocumentType]]          | `granting_parties.document_type` |
| ✅ Implementado | [[SGE - Enum - GeneratedDocumentType]]      | `generated_documents.type`       |
| ✅ Implementado | [[SGE - Enum - GeneratedDocumentStatus]]    | `generated_documents.status`     |
| ✅ Implementado | [[SGE - Enum - GeneratedDocumentOrigin]]    | `generated_documents.origin`     |
| 🟡 Planejado    | [[SGE - Enum - EvaluationStatus]]           | `supervisor_evaluations.status`  |
| ✅ Implementado | [[SGE - Enum - RegistrationRequestStatus]]  | solicitações de cadastro pendente |
| 🟡 Planejado    | [[SGE - Enum - InternshipCancellationRequestStatus]] | `internship_cancellation_requests.status` |
| 🟡 Planejado    | [[SGE - Enum - EmancipationEvidenceStatus]] | `emancipation_evidences.status` |
| 🟡 Planejado    | [[SGE - Enum - NonWorkingDateScope]]        | `non_working_dates.scope` |

## Checklist do catálogo

- [ ] Confirmar cada enum contra a regra de negócio aprovada.
- [ ] Manter valores persistidos em inglês e `snake_case`.
- [ ] Manter rótulos de interface nas traduções/`label()`, sem persistir texto exibido.
- [ ] Adicionar teste para todos os cases, `values()` e `options()` quando esses métodos existirem.
- [ ] Atualizar a migration que usa o enum e o [[SGE - Guia de desenvolvimento|painel de desenvolvimento]].
- [ ] Não criar enum para permissões, templates, campus ou vínculos desativados quando a regra já for atendida por Policy, versão ou timestamp.

## O que não é enum agora

- `CampusStatus`: usar `deactivated_at`.
- `AffiliationStatus`: usar `deactivated_at`.
- `TemplateStatus`: usar versões e `activated_at`/`deactivated_at`.
- Autorização: implementar a matriz institucional em Policies/Gates, a partir de `AffiliationType` e do vínculo ativo; ela não é configurável em tempo de execução.
- Variáveis de template: usar catálogo fixo em português com `${variavel}`.
- Motivo/origem de jornada e fonte do calendário: strings auditadas; não são conjuntos fechados.
- Aditivos: usar `GeneratedDocumentType::Addendum`.

## Navegação

- [[SGE - Migrations|Índice de migrations]]
- [[SGE - Guia de desenvolvimento]]
- [[SGE - Domínio e modelo de dados]]
- [[SGE - Enums e migrations|Portal antigo de enums e migrations]]
