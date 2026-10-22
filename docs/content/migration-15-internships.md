---
id: migration-15-internships
title: Migration 15 — internships
description: Contrato do processo de estágio, referências atuais, endereço histórico e snapshots históricos.
type: migration-reference
status: in-progress
visibility: public
tags: sge/migrations, sge/estagio, sge/historico
related: enum-internshipstatus, migration-19-internship-requests, migration-11-internship-types, migration-12-granting-parties, modelo-de-dados-historico
source_refs:
---
> [!info] Estado
> Migration, Model, factory, criação transacional após o aceite e snapshots da abertura estão implementados. Liberação documental e as transições de execução, avaliação e conclusão também estão implementadas. A previsão é recalculada após alterações relevantes do estágio, pausas e exceções; a integração de novas vigências após aditivo assinado e a base historicamente reproduzível continuam pendentes. Depende de vínculos, endereços, cursos, tipos de estágio, partes concedentes e [`InternshipStatus`](doc:enum-internshipstatus).

Um estágio é criado somente após o aceite de uma [solicitação de estágio](doc:migration-19-internship-requests). A Migration 15 vem antes da 19 somente para permitir que a solicitação acrescente sua FK única `internship_id`; no fluxo do produto, a solicitação nasce e é aceita antes de a linha do estágio ser criada.

O estágio guarda `student_affiliation_id` como FK direta do vínculo discente aceito. A solicitação de origem também conserva seu `affiliation_id`; a Action deve conferir que os dois vínculos coincidem. A pessoa é obtida por `studentAffiliation.user`, sem `student_user_id` redundante.

## Contrato mínimo

| Campo                              | Regra                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `id`                               | bigint, chave primária.                                                            |
| `student_affiliation_id`           | FK obrigatória do vínculo discente de origem, vinculada ao curso selecionado.       |
| `advisor_affiliation_id`           | FK obrigatória para o vínculo de orientador responsável.                          |
| `co_advisor_name` | Nome opcional do co-orientador, texto de até 255 caracteres, sem FK ou vínculo institucional. |
| `supervisor_affiliation_id`        | FK obrigatória para o vínculo de supervisor aprovado e responsável.               |
| `student_address_id`               | FK da cópia do endereço do discente usada na formalização, quando houver.            |
| `course_id`                       | FK obrigatória para o curso selecionado.                                            |
| `internship_type_id`              | FK obrigatória para o tipo de estágio selecionado.                                  |
| `granting_party_id`                | FK obrigatória da parte concedente aprovada.                                        |
| `workplace_address_id`             | FK obrigatória para nova linha de `addresses`, copiada do endereço atual da concedente. |
| `student_snapshot`                 | JSONB com identificação, período/semestre e dados pessoais; não contém o endereço estruturado. |
| `internship_type_snapshot`         | JSONB com carga horária, pesos, conceitos e limites de jornada do tipo aplicados ao estágio. |
| `granting_party_snapshot`          | JSONB com os dados aprovados da concedente.                                         |
| `supervisor_snapshot`              | JSONB com os dados aprovados do supervisor.                                         |
| `weekly_hours`                    | JSONB obrigatório com a jornada inicial pactuada, de domingo a sábado.             |
| `activities`                       | texto obrigatório com as atividades previstas.                                     |
| `internship_sector`                | setor/área de realização, nullable.                                                |
| `planned_start_date`               | data proposta pelo discente, no mínimo sete dias corridos após cada envio.          |
| `projected_end_date`               | data calculada pela jornada, feriados aplicáveis ao endereço de trabalho e pausas.  |
| `released_at`                      | momento em que o Setor de Estágio libera o início após as assinaturas.             |
| `released_by_affiliation_id`       | vínculo do Setor de Estágio que realizou a liberação.                              |
| `is_remunerated`                   | booleano que indica se o estágio possui remuneração.                                |
| `grant_value`                      | decimal(10,2) nullable; bolsa mensal quando remunerado.                             |
| `transportation_allowance`         | decimal(10,2) nullable; auxílio-transporte quando aplicável.                        |
| `observations`                     | nullable; informação complementar.                                                 |
| `supervisor_grade`                 | decimal nullable, calculado a partir da avaliação aprovada e dos conceitos do snapshot. |
| `report_grade`                     | decimal nullable, nota lançada pelo orientador quando o peso respectivo for maior que zero. |
| `presentation_grade`               | decimal nullable, nota lançada pelo orientador quando o peso respectivo for maior que zero. |
| `report_graded_by_affiliation_id`  | FK nullable para o orientador que lançou a nota do relatório.                       |
| `presentation_graded_by_affiliation_id` | FK nullable para o orientador que lançou a nota da apresentação.                |
| `report_graded_at`                 | `timestamp(0)` nullable do lançamento da nota do relatório.                         |
| `presentation_graded_at`           | `timestamp(0)` nullable do lançamento da nota da apresentação.                      |
| `consolidated_grade`               | decimal nullable, valor derivado das componentes exigidas e seus pesos congelados. |
| `status`                           | [`InternshipStatus`](doc:enum-internshipstatus), inicial `pending_formalization`. |
| timestamps                         | auditoria.                                                                         |

Toda informação histórica mantém a FK de origem quando ela existe e também o snapshot do estado usado no processo. O endereço do local do estágio não fica em JSONB: `workplace_address_id` aponta para a linha de `addresses` criada na formalização. A jornada inicial fica em `weekly_hours`; vigências posteriores só surgem de aditivo formalizado na Migration 23. A data prevista de término continua calculada automaticamente a partir da carga horária e dos limites congelados em `internship_type_snapshot`, da jornada aplicável em cada data, dos feriados pertinentes ao endereço histórico e das pausas. O estágio persiste o resultado em `projected_end_date`, sem JSONB de fórmula, versão de algoritmo ou entradas do cálculo.

Os snapshots têm contrato fechado: `student_snapshot` inclui nome, e-mail e matrícula do vínculo, período permitido, CPF, RG (com emissor e data), nascimento, telefone e responsável legal quando aplicável; `granting_party_snapshot` contém o cadastro aprovado; `supervisor_snapshot` contém identidade, contato, cargo/função e a qualificação acadêmica ou profissional escolhida pelo Setor, com a referência de origem; `internship_type_snapshot.rules` preserva carga, pesos, conceitos, limites, margem e anos/semestres permitidos a partir do tipo vigente no envio. Os endereços históricos são relações para linhas independentes de `addresses`. Esses dados permanecem disponíveis para o processo sem depender dos cadastros atuais. Cargo/função fica em `user_personal_data`; qualificações atuais ficam em `supervisor_qualifications`. Alterações posteriores não sincronizam os snapshots já formalizados.

As notas de relatório e apresentação são lançadas pelo orientador diretamente na escala do peso correspondente. `supervisor_grade` não é digitada: é a média, com uma casa decimal, dos valores dos dez conceitos da avaliação vigente e aprovada. Para cada componente com peso maior que zero a respectiva nota é obrigatória antes de calcular `consolidated_grade`; peso zero contribui com zero. A nota consolidada é a soma das três contribuições, com uma casa decimal, e permanece nula enquanto faltar componente obrigatório. Alterações posteriores das notas ficam no Activity Log.

O co-orientador é apenas um registro textual opcional. É copiado da solicitação no aceite e nas correções aprovadas da seção de estágio. Pode ser editado pelo Setor nas condições já previstas para o estágio e aparece nas consultas e na auditoria. Não cria conta, vínculo, acesso, atribuição de avaliação ou destinatário de notificações. Vazio é normalizado para nulo.

## Checklist

- [x] Mapear campos de atividades, início, jornada, remuneração e supervisor pelo formulário de abertura.
- [x] Documentar o cálculo automático de término, margem, calendário, pausas e correções deliberadas, sem persistir fórmula versionada.
- [x] Criar migration com FKs, snapshots JSONB, jornada inicial e status inicial.
- [x] Usar exclusão restrita nas FKs históricas.
- [x] Criar Model com casts de status, snapshots, jornada, datas e valores.
- [x] Guardar `student_affiliation_id` diretamente no estágio.
- [x] Conferir no fluxo de aceite que `student_affiliation_id = internship_requests.affiliation_id`.
- [x] Implementar snapshots no envio e sua cópia aprovada na formalização.
- [x] Validar no envio/aceite regras do tipo, período permitido, jornada, data inicial, capacidade civil e disponibilidade dos feriados aplicáveis ao local.
- [x] Calcular a previsão no envio/aceite e recalcular após alterações relevantes, pausas e exceções; vigências por aditivo e base historicamente reproduzível continuam pendentes.
- [x] Criar factory para estágio em formalização, remunerado e liberado.
- [ ] Testar alteração de cadastro após snapshot sem alterar o histórico.
- [ ] Testar schema PostgreSQL, FKs, casts, validações, snapshots e rollback da 15.
- [ ] Testar o fluxo completo de aceite, cálculo, aditivos, documentos e conclusão.

## Dependências

- [internship_types](doc:migration-11-internship-types)
- [granting_parties](doc:migration-12-granting-parties)
- [InternshipStatus](doc:enum-internshipstatus)
- [Modelo de dados histórico](doc:modelo-de-dados-historico)

## Dependência de calendário

A base local, importação anual e gestão estão implementadas em [Calendário de feriados](doc:calendario-de-feriados). O cálculo usa o endereço do local de trabalho e exige importações nacionais/estaduais completas, sem pendências, para os anos envolvidos. Não há chamada externa durante o cálculo. Alteração posterior do calendário global não dispara recálculo automático de estágios; mudanças de estágio, pausas e exceções recalculam quando salvas. A vigência criada por aditivo e uma base histórica reproduzível continuam pendentes; Activity Log sozinho não congela as entradas.

## Formalização da abertura — 16/10/2026

`ReviewInternshipRequest` cria o estágio em transação depois do aceite, com orientador/supervisor ativos do campus e ambas as referências de cadastro resolvidas. Preserva o vínculo discente de origem, os dados pessoais/tipo congelados na solicitação, os dados aprovados de concedente/supervisor e a jornada. O endereço aprovado da concedente e o endereço histórico discente recebem novas linhas exclusivas em `addresses`. Endereços atuais e históricos anteriores não são reescritos.

Correções anteriores à liberação deixam o estágio PendingCorrection e preservam seus dados até o novo aceite. A aprovação aplica somente os grupos devolvidos e seus derivados ao mesmo estágio e retorna a PendingFormalization. Esta Action não gera documentos automaticamente; o Setor pode emitir/reemitir pelo fluxo documental implementado. O cálculo usa o calendário local conferido; a integração de novas vigências de jornada e a base histórica reproduzível de D-019 permanecem pendentes.

A devolução manual antes da liberação também atende AwaitingSignatures: documentos Generated/AwaitingSignature são cancelados com o motivo, mantendo seus snapshots e os documentos Signed como histórico. O novo aceite volta a PendingFormalization; depois dele, o Setor pode emitir os documentos novamente pelo fluxo documental existente.

O número de protocolo pertence a cada documento, não ao estágio. O campo opcional está em `generated_documents.protocol_number`; o número fica disponível no cadastro externo do documento. Não identifica o discente.
