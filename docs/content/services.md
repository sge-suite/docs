---
id: services
title: Services
description: Índice dos serviços de domínio planejados para cálculos, documentos, snapshots e transições.
type: technical-hub
status: planned
visibility: public
tags: sge/desenvolvimento, sge/services, sge/arquitetura
related: service-internshipenddatecalculator, service-internshipgradecalculator, geracao-de-documentos-docx-e-variaveis
source_refs:
---
Services concentram regras que combinam dados, mas não representam por si só um caso de uso com autorização e efeitos colaterais. Actions orquestram transações, Policies autorizam e Jobs executam trabalho assíncrono.

## Inventário planejado

| Serviço | Contrato |
| --- | --- |
| [`InternshipEndDateCalculator`](doc:service-internshipenddatecalculator) | previsão reproduzível de término. |
| [`InternshipGradeCalculator`](doc:service-internshipgradecalculator) | nota do supervisor e soma consolidada. |
| `InternshipSnapshotBuilder` | cria snapshots tipados no aceite sem buscar dados atuais depois. |
| `InternshipStateTransitionService` | guardas puras de transição do estágio. |
| `InternshipExecutionStatusResolver` | determina o estado de execução para uma data e uma pausa ativa, sem efeitos colaterais. |
| `EvaluationStateTransitionService` | guardas de edição, envio, retorno, aprovação e cancelamento. |
| `RegistrationRequestApprovalService` | associa/cria supervisor ou concedente em transação. |
| `EmancipationReviewService` | aprova/devolve prova sem expor arquivo no log. |
| `TemplateVariableCatalog` / `TemplateInspector` | catálogo e inspeção de DOCX já implementados. |
| `DocumentSnapshotBuilder` / `DocumentVariableResolver` | contexto histórico e valores do documento. |
| `DocxDocumentGenerator` | futura geração temporária com cláusulas definidas em templates por remuneração. |

O conjunto documental é detalhado em [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis). Nenhum desses serviços deve retornar resposta HTTP, ler sessão global ou decidir permissão do usuário.

## Actions correspondentes

- `AcceptInternshipRequest` — valida cadastros/aceite, cria estágio com snapshots e jornada inicial em uma transação;
- `RecalculateProjectedEndDate` — bloqueia o estágio, calcula, persiste resultado/base e registra auditoria;
- `ApproveSupervisorEvaluation` — valida carga, escolhe avaliação vigente e recalcula notas;
- `UpdateAdvisorGrades` — autoriza o orientador e recalcula a nota consolidada;
- `GenerateInternshipDocument` — gera e registra documento de forma idempotente;
- `ReviewInternshipCancellationRequest` — decide, aplica efeitos e inicia a rescisão documental.
- `SynchronizeInternshipExecutionStatus` — bloqueia o estágio, aplica a transição temporal válida, audita e notifica sem duplicar eventos;
- `NotifyProjectedInternshipEnd` — cria o único lembrete de sete dias para o discente e o resumo interno diário do Setor, de forma idempotente;
- `NotifySignatureAvailability` — valida os interessados selecionados, cria os avisos internos/externos adequados e despacha e-mail após o commit.

## Validação automatizada

O projeto está sem testes automatizados durante a implementação de funcionalidades. Na preparação para produção, priorizar regras puras dos Services e fluxos críticos das Actions: transação, concorrência, autorização, Activity Log, notificações e rollback. Ver [Testes automatizados](doc:testes-existentes).
