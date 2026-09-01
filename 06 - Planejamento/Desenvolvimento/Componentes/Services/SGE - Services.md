---
title: SGE — Services
description: Índice dos serviços de domínio planejados para cálculos, documentos, snapshots e transições.
type: technical-hub
status: planned
tags:
  - sge/desenvolvimento
  - sge/services
  - sge/arquitetura
aliases:
  - Serviços de domínio do SGE
---
Services concentram regras que combinam dados, mas não representam por si só um caso de uso com autorização e efeitos colaterais. Actions orquestram transações, Policies autorizam e Jobs executam trabalho assíncrono.

## Inventário planejado

| Serviço | Contrato |
| --- | --- |
| [[SGE - Service - InternshipEndDateCalculator|`InternshipEndDateCalculator`]] | previsão reproduzível de término. |
| [[SGE - Service - InternshipGradeCalculator|`InternshipGradeCalculator`]] | nota do supervisor e soma consolidada. |
| `InternshipSnapshotBuilder` | cria snapshots tipados no aceite sem buscar dados atuais depois. |
| `InternshipStateTransitionService` | guardas puras de transição do estágio. |
| `InternshipExecutionStatusResolver` | determina o estado de execução para uma data e uma pausa ativa, sem efeitos colaterais. |
| `EvaluationStateTransitionService` | guardas de edição, envio, retorno, aprovação e cancelamento. |
| `RegistrationRequestApprovalService` | associa/cria supervisor ou concedente em transação. |
| `EmancipationReviewService` | aprova/devolve prova sem expor arquivo no log. |
| `TemplateVariableCatalog` / `TemplateValidator` | catálogo e validação de DOCX. |
| `DocumentSnapshotBuilder` / `DocumentVariableResolver` | contexto histórico e valores do documento. |
| `RemunerationParagraphFormatter` / `DocxDocumentGenerator` | texto jurídico e geração temporária. |

O conjunto documental é detalhado em [[SGE - Geração de documentos DOCX e variáveis]]. Nenhum desses serviços deve retornar resposta HTTP, ler sessão global ou decidir permissão do usuário.

## Actions correspondentes

- `AcceptInternshipRequest` — valida cadastros/aceite, cria estágio, snapshots e jornada inicial em uma transação;
- `RecalculateProjectedEndDate` — bloqueia o estágio, calcula, persiste resultado/base e registra auditoria;
- `ApproveSupervisorEvaluation` — valida carga, escolhe avaliação vigente e recalcula notas;
- `UpdateAdvisorGrades` — autoriza o orientador e recalcula a nota consolidada;
- `GenerateInternshipDocument` — gera e registra documento de forma idempotente;
- `ReviewInternshipCancellationRequest` — decide, aplica efeitos e inicia a rescisão documental.
- `SynchronizeInternshipExecutionStatus` — bloqueia o estágio, aplica a transição temporal válida, audita e notifica sem duplicar eventos;
- `NotifyProjectedInternshipEnd` — cria o único lembrete de sete dias para o discente e o resumo interno diário do Setor, de forma idempotente;
- `NotifySignatureAvailability` — valida os interessados selecionados, cria os avisos internos/externos adequados e despacha e-mail após o commit.

## Regra de teste

Services puros recebem DTOs/objetos de valor e têm testes unitários sem banco quando possível. Actions têm testes de feature cobrindo transação, concorrência, autorização, Activity Log, notificações e rollback.
