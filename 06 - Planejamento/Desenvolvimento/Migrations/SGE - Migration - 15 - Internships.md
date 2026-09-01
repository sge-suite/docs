---
title: SGE — Migration 15 — internships
description: Contrato do processo de estágio, referências atuais e snapshots históricos.
type: migration-reference
status: planned
order: 15
table: internships
tags:
  - sge/migrations
  - sge/estagio
  - sge/historico
---
> [!todo] Estado
> Planejada. Depende de usuários, endereços, cursos, tipos de estágio, partes concedentes e [[SGE - Enum - InternshipStatus|`InternshipStatus`]].

Um estágio é criado somente após o aceite de uma [[SGE - Migration - 19 - Internship requests|solicitação de estágio]]. A relação inversa é única: a solicitação recebe `internship_id` ao criar o estágio, preservando a origem sem duplicar uma solicitação a cada correção.

## Contrato mínimo

| Campo                              | Regra                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `id`                               | bigint, chave primária.                                                            |
| `student_user_id`                  | FK da pessoa discente.                                                             |
| `advisor_affiliation_id`           | FK obrigatória para o vínculo de orientador responsável.                          |
| `supervisor_affiliation_id`        | FK obrigatória para o vínculo de supervisor aprovado e responsável.               |
| `student_address_id`               | FK do endereço usado no início, quando houver.                                     |
| `course_id` / `internship_type_id` | FKs do curso e tipo selecionados.                                                  |
| `granting_party_id`                | FK da parte concedente, quando cadastrada.                                         |
| `student_snapshot`                 | JSONB com identificação, período/semestre, dados pessoais e endereço históricos.   |
| `internship_type_snapshot`         | JSONB com carga horária, pesos, conceitos e exceções do tipo aplicados ao estágio. |
| `granting_party_snapshot` / `supervisor_snapshot` | JSONB com os dados aprovados da concedente e do supervisor.              |
| `activities`                       | texto obrigatório com as atividades previstas.                                     |
| `planned_start_date`               | data proposta pelo discente, validada contra o prazo mínimo após o envio.          |
| `projected_end_date`               | data calculada pela carga horária do tipo, jornada semanal, feriados e pausas.     |
| `projected_end_date_calculation`   | JSONB com versão da fórmula, entradas e resultado reproduzível do cálculo vigente. |
| `released_at`                      | momento em que o Setor de Estágio libera o início após as assinaturas.             |
| `released_by_affiliation_id`       | vínculo do Setor de Estágio que realizou a liberação.                              |
| remuneração                        | `is_remunerated`, bolsa e auxílio-transporte conforme aplicável.                   |
| `protocol_number`                  | nullable; protocolo retornado pelo SIGAA.                                          |
| `observations`                     | nullable; informação complementar.                                                 |
| `supervisor_grade`                 | decimal nullable, calculado a partir da avaliação aprovada e dos conceitos do snapshot. |
| `report_grade` / `presentation_grade` | decimal nullable, notas lançadas pelo orientador quando o peso respectivo for maior que zero. |
| `report_graded_by_affiliation_id` / `presentation_graded_by_affiliation_id` | FKs nullable para o orientador que lançou cada nota. |
| `report_graded_at` / `presentation_graded_at` | timestamps nullable do lançamento de cada nota. |
| `consolidated_grade`               | decimal nullable, valor derivado das componentes exigidas e seus pesos congelados. |
| `status`                           | [[SGE - Enum - InternshipStatus|`InternshipStatus`]], inicial `pending_formalization`. |
| timestamps                         | auditoria.                                                                         |

Toda informação histórica deve manter a FK de origem quando ela existir e também o snapshot do estado usado no processo. A data prevista de término é calculada a partir da carga horária exigida em `internship_type_snapshot`, da jornada pactuada — ou de vigência posterior criada exclusivamente por aditivo formalizado —, do calendário e das pausas; não é um campo digitado pelo discente. `projected_end_date_calculation` guarda a versão da fórmula, carga, margem, jornadas, datas sem expediente, pausas, data de conclusão sem margem e resultado final. Em especial, os pesos da avaliação do supervisor, do relatório e da apresentação devem ser lidos exclusivamente de `internship_type_snapshot` ao calcular a nota consolidada.

Os snapshots têm contrato fechado: `student_snapshot` inclui nome, e-mail, matrícula do vínculo, período/semestre, CPF, RG (com emissor e data), nascimento, telefone, endereço e responsável legal quando aplicável; `granting_party_snapshot` inclui documento, nome, endereço, representante, contato, área, conselho e processo; `supervisor_snapshot` inclui nome, telefone, e-mail, cargo, qualificação, formação e experiência; e `internship_type_snapshot` copia integralmente `rules`. Esses dados permanecem disponíveis para documento e auditoria, sem duplicar cadastros atuais.

As notas de relatório e apresentação são lançadas pelo orientador diretamente na escala do peso correspondente. `supervisor_grade` não é digitada: é a média, com uma casa decimal, dos valores dos dez conceitos da avaliação vigente e aprovada. Para cada componente com peso maior que zero a respectiva nota é obrigatória antes de calcular `consolidated_grade`; peso zero contribui com zero. A nota consolidada é a soma das três contribuições, com uma casa decimal, e permanece nula enquanto faltar componente obrigatório. Alterações posteriores das notas ficam no Activity Log.

## Checklist

- [x] Mapear campos de atividades, início, jornada, remuneração e supervisor pelo formulário de abertura.
- [x] Documentar a fórmula de término, margem, calendário, pausas e correções deliberadas.
- [ ] Criar migration com FKs, JSONB, índices de consulta e status inicial.
- [ ] Definir `restrict`/`nullOnDelete` para preservar histórico.
- [ ] Criar Model com cast de status e snapshots.
- [ ] Implementar criação do snapshot no momento correto do fluxo.
- [ ] Validar regras do tipo, carga horária, período, feriados e idade.
- [ ] Criar o serviço de cálculo e persistir a base reproduzível em `projected_end_date_calculation`.
- [ ] Criar factory para rascunho, pendência, andamento e conclusão.
- [ ] Testar alteração de cadastro após snapshot sem alterar o histórico.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [[SGE - Migration - 11 - Internship types|internship_types]]
- [[SGE - Migration - 12 - Granting parties|granting_parties]]
- [[SGE - Enum - InternshipStatus|InternshipStatus]]
- [[SGE - Modelo de dados - Histórico|Modelo de dados histórico]]
