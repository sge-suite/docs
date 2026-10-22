---
id: services
title: Services
description: Índice dos componentes de suporte e cálculo existentes no SGE.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/services, sge/arquitetura
related: service-internshipenddatecalculator, service-internshipgradecalculator, geracao-de-documentos-docx-e-variaveis
source_refs: https://github.com/sge-suite/sge/blob/master/app/Support/InternshipEndDateCalculator.php, https://github.com/sge-suite/sge/blob/master/app/Support/InternshipGradeCalculator.php, https://github.com/sge-suite/sge/blob/master/app/Support/GeneratedDocumentSnapshot.php, https://github.com/sge-suite/sge/blob/master/app/Support/TemplateVariableCatalog.php, https://github.com/sge-suite/sge/blob/master/app/Support/HolidayCalendar.php, https://github.com/sge-suite/sge/blob/master/app/Actions/GenerateInternshipDocument.php
---
Services e componentes em `App\Support` concentram cálculos determinísticos, catálogos e preparação de dados. Actions autorizam e orquestram transações e efeitos colaterais; Policies autorizam; Jobs executam trabalho assíncrono.

## Cálculos

| Componente | Situação atual |
| --- | --- |
| [`InternshipEndDateCalculator`](doc:service-internshipenddatecalculator) | Implementado; cálculo puro usado para projetar a previsão. Actions resolvem calendário e persistem o resultado no envio, aceite e alterações relevantes do estágio. Histórico reproduzível das entradas e novas vigências de jornada por aditivo continuam pendentes. |
| [`InternshipGradeCalculator`](doc:service-internshipgradecalculator) | Implementado; calcula a contribuição do supervisor e a nota consolidada a partir das regras congeladas e notas acadêmicas. |
| `HolidayCalendar`, `InternshipPlannedPauses`, `InternshipCalendarOverrides` | Implementados; resolvem dias bloqueados, pausas e exceções locais usadas pelo cálculo da previsão. |

## Documentos

| Componente | Responsabilidade |
| --- | --- |
| `TemplateVariableCatalog` e `TemplateInspector` | Catálogo de variáveis e inspeção/validação de templates DOCX no upload. |
| `GeneratedDocumentSnapshot` | Congela valores e substituições usados em uma emissão para permitir reprodução do documento. |
| `DocxRenderer`, `DocxToPdf` e `DocumentTemplatePreview` | Renderizam DOCX, convertem para PDF e preparam a visualização privada do template. |
| Actions `GenerateInternshipDocument`, `ManageDocumentSignature` e `RebuildGeneratedDocument` | Geram e reproduzem documentos, registram assinatura conferida e administram o ciclo do documento. |

O conjunto documental está detalhado em [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis). O registro de documentos externos sem arquivo ainda não está implementado. A Migration 23 e o Model `InternshipWorkSchedule` existem, mas a integração que cria novas vigências após aditivo assinado também permanece pendente.

## Actions de domínio

Os casos de uso estão distribuídos em Actions existentes, entre elas `ReviewInternshipRequest`, `ReviewInternshipRegistration`, `ManageInternship`, `ManageInternshipLifecycle`, `ManageSupervisorEvaluation`, `UpdateAdvisorGrades`, `SyncInternshipExecutionStatus` e `ReviewEmancipationEvidence`. O diretório `app/Actions` é a referência para nomes e implementação; este índice não declara serviços planejados como existentes.

## Validação

As regras funcionais e integrações têm implementação; validação automatizada e operacional permanece pendente conforme [Testes automatizados](doc:testes-existentes) e os checklists das fases. Nenhum teste foi criado ou executado nesta revisão documental.
