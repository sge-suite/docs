---
id: migration-18-supervisor-evaluations
title: Migration 18 — supervisor_evaluations
description: Fluxo implementado de solicitação, resposta e revisão das avaliações do supervisor.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/avaliacao, sge/banco-de-dados
related: migration-02-user-personal-data, enum-evaluationstatus, backlog-e-decisoes, fase-09-avaliacao-e-conclusao
source_refs:
---
> [!info] Estado
> Fluxo implementado com Policy, Action transacional, telas Livewire/Flux, aviso interno e e-mail após commit. O Setor solicita a avaliação; o supervisor não cria o pedido. Formatação, compilação e análise estática são verificações técnicas; a validação funcional e de concorrência permanece pendente, sem criação ou execução de testes nesta entrega.

## Escopo

`supervisor_evaluations` armazena um único formulário fixo por estágio e supervisor, com cada resposta em sua própria coluna. Ele é atualizado somente em `Draft` ou após devolução em `Returned`; o `activity_log` preserva cada alteração e transição sem criar versões de formulário. A liberação da avaliação e a referência para a resposta vigente pertencem a `internships`. O cálculo da nota usa a configuração congelada em `internship_type_snapshot`, e não o cadastro atual de `internship_types`. Relatório e apresentação são lançados separadamente pelo Orientador.

## Contrato implementado

| Campo                        | Regra                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `id`                         | bigint, chave primária.                                                       |
| `internship_id`              | FK obrigatória para o estágio.                                                |
| `supervisor_affiliation_id`  | FK obrigatória para o vínculo de supervisor responsável pelo envio.           |
| `status`                     | [Enum — EvaluationStatus](doc:enum-evaluationstatus) (`EvaluationStatus`).                       |
| `has_academic_background`    | boolean nullable durante o preenchimento parcial; seleciona o ramo de formação ou experiência. |
| `training_course` / `education_level` | Formação acadêmica; obrigatórios somente quando há formação na área. |
| `job_role` / `experience_time` | Cargo obrigatório no envio com carga cumprida; tempo de experiência obrigatório somente no ramo sem formação. |
| Dez colunas de critérios | Conceitos de `EvaluationConcept`, obrigatórios no envio com carga cumprida e nulos no ramo “Não”. |
| Quatro colunas de comentários | Pareceres opcionais, cada um em `text` nullable. |
| `hours_requirement_met`      | boolean nullable no preenchimento parcial; obrigatório no envio e precisa ser `true` para aprovação. |
| `estimated_hours_remaining`  | smallint nullable; horas informadas pelo supervisor, positivas e limitadas à carga exigida no snapshot; obrigatório no envio do ramo “Não”. |
| `submitted_at`               | Preenchido quando o rascunho é congelado e enviado.                           |
| `reviewed_at`                | Preenchido quando o Setor de Estágio aprova ou devolve.                       |
| `review_notes`               | Justificativa nullable, obrigatória na devolução.                             |
| `cancelled_at` / `cancellation_reason` | Nulos até o cancelamento; motivo obrigatório e sem exclusão física. |
| timestamps                   | Auditoria técnica; ações relevantes também devem ir para o Activity Log.      |

Campos relacionados em `internships`:

| Campo                                   | Regra                                                               |
| --------------------------------------- | ------------------------------------------------------------------- |
| `evaluation_released_at`                | Momento a partir do qual o supervisor pode preencher a avaliação.   |
| `evaluation_released_by_affiliation_id` | Vínculo que autorizou a liberação, quando houver ação manual.       |
| `current_supervisor_evaluation_id`      | FK nullable para a avaliação aprovada vigente e efetiva no cálculo. |

Essas três colunas não entram na Migration 15. Depois de criar `supervisor_evaluations`, a própria Migration 18 altera `internships` para acrescentar `evaluation_released_at`, `evaluation_released_by_affiliation_id` e `current_supervisor_evaluation_id`, com suas FKs. Essa ordem evita dependência circular entre as tabelas.

## Respostas em colunas

O formulário é fixo. Não há tabela de definições do formulário, versão por envio ou JSONB de respostas. Cada campo do formulário possui coluna própria em `supervisor_evaluations`; isso permite validação e consulta direta. O Activity Log registra alterações de atributos e transições. A associação ao supervisor que respondeu permanece em `supervisor_affiliation_id`, mesmo que o vínculo de supervisor em `internships` mude depois.

| Grupo | Colunas |
| --- | --- |
| Formação e atuação | `has_academic_background`, `training_course`, `education_level`, `job_role`, `experience_time` |
| Critérios | `performance`, `comprehension`, `technical_knowledge`, `organization`, `initiative`, `attendance`, `discipline`, `sociability`, `cooperation`, `responsibility` |
| Comentários | `considerations`, `suggestions_to_institution`, `performance_issues`, `other_observations` |
| Carga horária | `hours_requirement_met`, `estimated_hours_remaining` |

A primeira pergunta é “A carga horária exigida para este estágio foi cumprida?”. Em “Não”, somente `estimated_hours_remaining` é exibido e salvo, com inteiro positivo até `internship_type_snapshot.rules.required_hours` (respeitando também o limite da coluna). Qualificação, critérios e comentários ficam nulos, mesmo se enviados pelo navegador. Não há cálculo de horas realizadas pela previsão ou jornada.

Em “Sim”, `has_academic_background`, `job_role` e os dez critérios são obrigatórios no envio. O ramo de formação exige `training_course` e `education_level` e mantém `experience_time` nulo; o ramo de experiência faz o inverso. `EducationLevel` conserva seus cinco valores. Os conceitos usam `EvaluationConcept`; rótulos, pesos e valores numéricos são exibidos com base no snapshot do tipo, sem consultar o catálogo atual. Os quatro comentários são opcionais e limitados a 5.000 caracteres. Rascunho e edição em `Returned` permitem preenchimento parcial.

A Action `PrepareSupervisorEvaluationReference` prepara uma cópia explícita do `supervisor_snapshot` do estágio para a tela de avaliação. Exige identidade autenticada, vínculo ativo e selecionado de Supervisor e estágio associado a esse mesmo vínculo; não recebe `user_id` nem busca dados de terceiros. A escolha do ramo é relativa àquele estágio: copia cargo/função e somente curso/nível ou tempo de experiência, retornando nulos para o ramo oposto. Se o snapshot não trouxer valores para o ramo selecionado, os campos retornam nulos para preenchimento. A Action exige também liberação e permissão de edição da avaliação existente. A tela permite confirmar os valores ou digitar outros, validando e autorizando novamente no salvamento; não grava o perfil nem altera o snapshot. Não há sincronização automática; respostas persistidas e snapshots históricos permanecem independentes do perfil.

No envio, `hours_requirement_met` é obrigatório; a edição em `Returned` pode ser salva parcialmente e o cancelamento preserva esse conteúdo. Quando for falso, somente `estimated_hours_remaining` é preenchido: obrigatório, positivo e limitado à carga exigida no snapshot. Os demais campos da resposta ficam nulos. A identificação do discente vem do estágio, não de texto livre na avaliação.

`reviewed_at` registra quando o Setor de Estágio devolveu ou aprovou a avaliação. Não há `reviewed_by_affiliation_id`: as alterações Eloquent já registram no Activity Log o vínculo ativo como *causer* e a conta nos metadados. A revisão usa `SupervisorEvaluationPolicy` e `ManageSupervisorEvaluation`, com autoria do vínculo validado e bloqueado na transação.

## Regras de ciclo e validade

- O supervisor pode salvar o mesmo `Draft` quantas vezes precisar antes do envio.
- `Draft` e a edição em `Returned` aceitam preenchimento parcial. O envio exige os campos do ramo escolhido. Em “Não”, somente horas faltantes; em “Sim”, qualificação e dez critérios, com comentários opcionais.
- `Submitted` e `Approved` bloqueiam edição. `Returned` reabre o mesmo registro para edição completa e novo envio.
- O Setor de Estágio pode aprovar ou devolver, mas não editar a resposta do supervisor. Se `hours_requirement_met` for falso, deve devolver com motivo; não pode aprovar.
- O supervisor pode cancelar um `Submitted` ou `Returned`; `Cancelled` preserva os dados e exige motivo.
- A avaliação vigente é o `Approved` mais recente por `submitted_at` e `id`.
- Um envio pendente, devolvido ou cancelado não substitui a avaliação vigente anterior.
- A troca de `current_supervisor_evaluation_id` deve ocorrer em transação e gerar Activity Log.
- A nota da avaliação do supervisor é `round(sum(valor dos 10 conceitos) / 10, 1)`. Os valores vêm de `internship_type_snapshot.rules` (`supervisor_evaluation_weight`, `very_good_value`, `good_value`, `satisfactory_value`, `unsatisfactory_value`), já limitados ao peso dessa componente; a resposta não pode alterar pesos ou valores e o resultado não é multiplicado novamente.
- A aprovação com `hours_requirement_met = true` conclui o estágio automaticamente na mesma transação, após selecionar a avaliação vigente e recalcular as notas. Um pedido de cancelamento pendente deve ser decidido antes dessa aprovação. A conclusão manual pelo Setor também exige confirmação explícita da carga horária; notas acadêmicas pendentes não a bloqueiam.

## Índices e integridade

- Índice em `internship_id`, `status` e `submitted_at` para localizar a lista e a resposta vigente.
- Índice em `supervisor_affiliation_id` para autorização e consultas do supervisor.
- Restrição única em `internship_id` e `supervisor_affiliation_id`, pois o mesmo formulário é reutilizado após devolução.
- A Policy de análise exige o vínculo ativo selecionado do Setor de Estágio no campus do estágio. O `SetAuditActor` já configura o vínculo ativo como *causer* do Activity Log em ações humanas.
- A referência vigente deve aceitar no máximo uma avaliação por estágio.

## Checklist de decisão

- [x] Definir que o supervisor responde e o Setor de Estágio revisa, devolve ou aprova.
- [x] Liberação manual pelo Setor no estágio formalmente liberado, em `Released`, `InProgress` ou `Paused`, com curso/campus ativos e supervisor ativo; destinatário é o vínculo responsável.
- [x] Mapear critérios, escala e regras condicionais do formulário fixo de avaliação.
- [x] Definir pesos e valores dos conceitos no tipo de estágio, com snapshot no estágio.
- [x] Definir que o mesmo formulário é reaberto após devolução e que o `activity_log` preserva alterações.
- [x] Definir que o Orientador lança as notas de relatório e apresentação.
- [x] Definir a fórmula de média dos conceitos e soma das três contribuições.
- [x] Definir cálculo consolidado a partir do snapshot do tipo de estágio.
- [x] Implementar o cálculo das contribuições e o lançamento das notas de relatório e apresentação pelo Orientador.
- [x] Registrar decisão em [D-009](doc:backlog-e-decisoes#d-009-ciclo-e-validade-da-avaliacao-do-supervisor).

## Checklist de implementação

- [x] Confirmar o contrato de campos contra critérios e escalas aprovados.
- [x] Criar [`EvaluationStatus`](doc:enum-evaluationstatus).
- [x] Criar `supervisor_evaluations` com respostas em colunas, sem versão do formulário nem FK de revisor; acrescentar as referências de avaliação vigente em `internships`, Models, casts e índices.
- [x] Alinhar o enum de nível e as regras condicionais com o cadastro e preparar a cópia própria, explícita e sem persistência automática.
- [x] Implementar a confirmação/edição da referência na tela completa da avaliação.
- [x] Implementar liberação, notificação pós-commit e ações de salvamento/envio com revalidação de contexto.
- [x] Implementar salvamento explícito de rascunho em Livewire e edição integral em `Returned` com auditoria de alterações.
- [x] Atualizar a avaliação vigente e recalcular notas em transação após aprovação.
- [ ] Testar autorização, devolução, aprovação, cálculo e pendências.
- [ ] Validar migrate/rollback da Migration 18 junto à Migration 15 na preparação para produção.
- [x] Atualizar [fase de avaliação](doc:fase-09-avaliacao-e-conclusao) para refletir o lançamento das notas e cálculo consolidados implementados.

## Operação implementada

A ação “Solicitar avaliação do supervisor” no detalhe do estágio registra `evaluation_released_at` e `evaluation_released_by_affiliation_id` e cria o único `Draft` do par estágio/supervisor. Solicitações repetidas são bloqueadas, inclusive após cancelamento; o supervisor não recebe ação para criar outro registro. Mudanças de supervisor preservam respostas históricas e permitem solicitar ao novo responsável. A lista `supervisor-evaluations.index` fica limitada ao vínculo selecionado do supervisor ou ao campus do Setor. Coordenador, Discente, Orientador, Direção e Administrador não recebem acesso ao formulário/revisão por analogia. No detalhe do estágio, o Setor consulta todas as avaliações; Coordenação e Orientador podem consultar somente a aprovada vigente nos estágios de seu escopo, com os campos limitados à matriz de autorização. Discente e Direção não veem a avaliação.

`ManageSupervisorEvaluation` bloqueia vínculo, estágio, curso, campus, supervisor e resposta nas mutações, reautoriza a operação e atribui a auditoria ao vínculo. Aprovação seleciona `Approved` por `submitted_at DESC, id DESC` e usa `InternshipGradeCalculator` na mesma transação. Outros estados preservam a vigente anterior e as notas. A aprovação com `hours_requirement_met = true` conclui o estágio automaticamente na mesma transação, após selecionar a avaliação vigente e recalcular as notas. Um pedido de cancelamento pendente deve ser decidido antes dessa aprovação. O histórico das avaliações integra a auditoria do estágio/campus, sem expô-la ao supervisor.

`DeliverSupervisorEvaluationNotice` é despachado após commit para liberação e revisão ao supervisor e para envio aos vínculos ativos do Setor do campus. Usa UUID estável por aviso, notificação interna por vínculo e `RequestEmailDelivery::notification`, com conteúdo e tentativas preservados. Reexecuções do job reutilizam a mesma notificação e reserva de e-mail.
