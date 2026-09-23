---
id: migration-15-internships
title: Migration 15 — internships
description: Contrato do processo de estágio, referências atuais, endereço histórico e snapshots históricos.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/estagio, sge/historico
related: enum-internshipstatus, migration-19-internship-requests, migration-11-internship-types, migration-12-granting-parties, modelo-de-dados-historico
source_refs:
---
> [!todo] Estado
> Planejada. Depende de usuários, endereços, cursos, tipos de estágio, partes concedentes e [`InternshipStatus`](doc:enum-internshipstatus).

Um estágio é criado somente após o aceite de uma [solicitação de estágio](doc:migration-19-internship-requests). A Migration 15 vem antes da 19 somente para permitir que a solicitação acrescente sua FK única `internship_id`; no fluxo do produto, a solicitação nasce e é aceita antes de a linha do estágio ser criada.

O vínculo discente de origem é `internship_requests.affiliation_id`. `internships` não repete `student_affiliation_id`: para autorização e auditoria, a Action parte da solicitação associada; `student_user_id` identifica a conta para consulta e snapshot, sem inferir campus, curso ou escopo.

## Contrato mínimo

| Campo                              | Regra                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `id`                               | bigint, chave primária.                                                            |
| `student_user_id`                  | FK da pessoa discente.                                                             |
| `advisor_affiliation_id`           | FK obrigatória para o vínculo de orientador responsável.                          |
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
| `activities`                       | texto obrigatório com as atividades previstas.                                     |
| `planned_start_date`               | data proposta pelo discente, validada contra o prazo mínimo após o envio.          |
| `projected_end_date`               | data calculada pela jornada, feriados aplicáveis ao endereço de trabalho e pausas.  |
| `projected_end_date_calculation`   | JSONB com versão da fórmula, entradas e resultado reproduzível do cálculo vigente. |
| `released_at`                      | momento em que o Setor de Estágio libera o início após as assinaturas.             |
| `released_by_affiliation_id`       | vínculo do Setor de Estágio que realizou a liberação.                              |
| `is_remunerated`                   | booleano que indica se o estágio possui remuneração.                                |
| `grant_value`                      | decimal(10,2) nullable; bolsa mensal quando remunerado.                             |
| `transportation_allowance`         | decimal(10,2) nullable; auxílio-transporte quando aplicável.                        |
| `protocol_number`                  | nullable; protocolo retornado pelo SIGAA.                                          |
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

Toda informação histórica deve manter a FK de origem quando ela existir e também o snapshot do estado usado no processo. O endereço do local do estágio não fica em JSONB: `workplace_address_id` aponta para a linha de `addresses` criada na formalização. A data prevista de término é calculada a partir da carga horária exigida em `internship_type_snapshot`, da jornada pactuada — ou de vigência posterior criada exclusivamente por aditivo formalizado —, do calendário de feriados nacional, estadual e municipal aplicável ao endereço de trabalho e das pausas; não é um campo digitado pelo discente. `projected_end_date_calculation` guarda a versão da fórmula, carga, margem, jornadas, endereço, feriados, pausas, data de conclusão sem margem e resultado final.

Os snapshots têm contrato fechado: `student_snapshot` inclui nome, e-mail, matrícula do vínculo, período/semestre, CPF, RG (com emissor e data), nascimento, telefone e responsável legal quando aplicável; `granting_party_snapshot` inclui documento, nome, representante, contato, área, conselho e processo; `supervisor_snapshot` inclui nome, telefone, e-mail, cargo, qualificação, formação e experiência; `internship_type_snapshot.rules` preserva o contrato histórico de carga, pesos, conceitos, limites e margem, montado a partir das colunas escalares de `internship_types`; o conceito `excellent` recebe o peso do supervisor e `unsatisfactory` recebe o valor configurado em `unsatisfactory_value` (inicialmente `0`); e os endereços históricos são relações para `addresses`. Esses dados permanecem disponíveis para documento e auditoria, sem depender do cadastro atual. Os dados profissionais atuais do supervisor ficam em `user_personal_data`; o fluxo funcional definirá quando ele os confirma para compor `supervisor_snapshot`.

As notas de relatório e apresentação são lançadas pelo orientador diretamente na escala do peso correspondente. `supervisor_grade` não é digitada: é a média, com uma casa decimal, dos valores dos dez conceitos da avaliação vigente e aprovada. Para cada componente com peso maior que zero a respectiva nota é obrigatória antes de calcular `consolidated_grade`; peso zero contribui com zero. A nota consolidada é a soma das três contribuições, com uma casa decimal, e permanece nula enquanto faltar componente obrigatório. Alterações posteriores das notas ficam no Activity Log.

## Checklist

- [x] Mapear campos de atividades, início, jornada, remuneração e supervisor pelo formulário de abertura.
- [x] Documentar a fórmula de término, margem, calendário, pausas e correções deliberadas.
- [ ] Criar migration com FKs, JSONB, índices de consulta e status inicial.
- [ ] Definir `restrict`/`nullOnDelete` para preservar histórico.
- [ ] Criar Model com cast de status e snapshots.
- [x] Usar `internship_requests.affiliation_id` como vínculo discente de origem para autorização e auditoria.
- [ ] Implementar criação do snapshot no momento correto do fluxo.
- [ ] Validar regras do tipo, carga horária, período, feriados nacionais/estaduais/municipais aplicáveis ao endereço de trabalho e idade.
- [ ] Criar o serviço de cálculo e persistir a base reproduzível em `projected_end_date_calculation`.
- [ ] Criar factory para rascunho, pendência, andamento e conclusão.
- [ ] Testar alteração de cadastro após snapshot sem alterar o histórico.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [internship_types](doc:migration-11-internship-types)
- [granting_parties](doc:migration-12-granting-parties)
- [InternshipStatus](doc:enum-internshipstatus)
- [Modelo de dados histórico](doc:modelo-de-dados-historico)
