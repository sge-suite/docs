---
id: enum-internshiprequeststatus
title: Enum — InternshipRequestStatus
description: Ciclo de preenchimento, envio e análise da solicitação nativa de estágio.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/estagio, sge/formularios
related: enum-internshipstatus, enum-internshiprequestcorrectionstatus, migration-base-04-activity-log, migration-19-internship-requests, migration-20-internship-request-corrections, fluxos-principais
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/InternshipRequestStatus.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/InternshipRequestStatusTest.php
diagram: enum-request-status
---
> [!success] Estado
> A classe, os testes unitários, o cast em `InternshipRequest` e a Migration 19 já existem. Guardas de transição, Policies e fluxo de análise ainda estão planejados. O enum separa o formulário da formalização e execução registradas em [`InternshipStatus`](doc:enum-internshipstatus).

## Contrato

| Case | Valor persistido | Rótulo | Efeito |
| --- | --- | --- | --- |
| `Draft` | `draft` | Rascunho | O discente pode preencher e salvar, sem enviar ao Setor. |
| `Submitted` | `submitted` | Enviada | Envio novo ou correção respondida; aguarda o início da análise formal. |
| `UnderReview` | `under_review` | Em análise | O Setor de Estágio está analisando. |
| `PendingCorrection` | `pending_correction` | Com pendência | Há uma [correção aberta](doc:enum-internshiprequestcorrectionstatus) com seções liberadas ao discente. |
| `Accepted` | `accepted` | Aceita | O Setor aprovou os dados atuais. Cria o estágio na primeira vez ou atualiza o estágio já vinculado. |
| `Rejected` | `rejected` | Recusada | O processo foi encerrado pelo Setor antes da formalização. |
| `Withdrawn` | `withdrawn` | Desistida | O discente desistiu antes de existir um estágio. |

## Transições

{{diagram:enum-request-status}}

`Accepted` não é final: uma correção posterior à criação do estágio pode levar a solicitação novamente a `PendingCorrection`, depois a `Submitted` e `UnderReview`. A nova aprovação mantém a mesma solicitação e o mesmo `internship_id`.

## Integração com o estágio já criado

Quando `internship_id` já existir, a solicitação continua sendo a fonte editável somente durante uma correção aberta. O estágio mantém seus dados e snapshots aprovados enquanto o discente corrige o formulário. Ao aprovar o reenvio, o Setor aplica ao estágio apenas as seções autorizadas, recalcula os valores derivados — como data prevista de término —, preserva o histórico e reemite os documentos necessários. Não são criadas outra solicitação nem uma versão completa de resposta; o [`activity_log`](doc:migration-base-04-activity-log) registra as alterações.

Depois de `released_at`, mudanças contratuais devem seguir o fluxo próprio de alteração/aditivo, e não reabrir o formulário de abertura.

## Preenchimento incremental e retenção

`Draft` é salvo incrementalmente pelo Livewire e pode manter campos nulos, exceto os identificadores técnicos do proprietário e o próprio status. Ao enviar ou seguir para análise, todos os campos obrigatórios e condicionais do caso escolhido devem estar válidos; campos de opções não selecionadas permanecem nulos. Em `PendingCorrection`, somente as seções autorizadas ficam editáveis, mas continuam obedecendo às mesmas validações.

O discente consulta uma lista das próprias solicitações, com status e última atualização, sem acesso ao `activity_log`. Não há exclusão física: `Withdrawn` preserva a solicitação desistida e sua auditoria. Para permitir a retenção de um rascunho abandonado, o cancelamento pode preservar campos incompletos que existiam no momento da desistência.

## Checklist de implementação

- [x] Criar enum string, rótulos, `options()` e `values()`.
- [x] Adicionar cast em `InternshipRequest`.
- [x] Usar o valor inicial do enum na [migration de internship_requests](doc:migration-19-internship-requests).
- [ ] Implementar guardas de transição e Policies do discente e do Setor.
- [x] Testar cases, valores, rótulos e opções.
- [ ] Testar primeiro envio, pendência, reenvio, aceite inicial, reaprovação e desistência no fluxo de domínio.

## Referências

- [Migration 19 — internship_requests](doc:migration-19-internship-requests)
- [Migration 20 — internship_request_corrections](doc:migration-20-internship-request-corrections)
- [Fluxos principais](doc:fluxos-principais#2-solicitacao)
