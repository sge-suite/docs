---
id: migration-11-internship-types
title: Migration 11 — internship_types
description: Contrato dos tipos de estágio e suas regras configuráveis.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/estagio, sge/banco-de-dados
related: migration-09-courses, service-internshipenddatecalculator
source_refs:
---
> [!success] Estado
> Migration, Model, factory e regras Laravel em PHP implementados após [`courses`](doc:migration-09-courses). A gestão pelo Setor de Estágio está implementada na [Fase 05](doc:fase-05-administracao); o snapshot pertence à Migration 15 e é preservado nas alterações do catálogo. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | `bigint` autoincremental, chave primária. |
| `course_id` | `bigint` obrigatório, FK para `courses.id` com `ON DELETE RESTRICT`. |
| `name` | Nome obrigatório, `varchar(255)`. |
| `required_hours` | Carga horária obrigatória, inteiro positivo. |
| `supervisor_evaluation_weight` | Peso da avaliação do supervisor, inteiro positivo. |
| `report_weight` | Peso do relatório, inteiro positivo. |
| `presentation_weight` | Peso da apresentação, inteiro positivo. |
| `very_good_value`, `good_value`, `satisfactory_value`, `unsatisfactory_value` | Valores configuráveis dos conceitos, `numeric(5,1)`. |
| `max_daily_hours` | Máximo de horas por dia, inteiro com padrão `6`; deve ficar entre `6` e `24` e não pode superar o limite semanal. |
| `max_weekly_hours` | Máximo de horas por semana, inteiro com padrão `30`; deve ficar entre `30` e `40`. |
| `safety_margin_days` | Margem de segurança para previsão do término, inteiro não negativo com padrão `7`. |
| `deactivated_at` | Timestamp nullable; nulo significa tipo ativo. |
| `created_at`, `updated_at` | Timestamps convencionais do Laravel. |

Os campos escalares substituem a coluna JSONB `rules`. Eles têm casts declarados no Model, incluindo cast `integer` para os pesos e cast `decimal:1` para os valores configuráveis dos conceitos. `EvaluationConcept` define os nomes persistidos e seus rótulos em português: a chave histórica `excellent` aparece como “Ótimo” na interface. O valor de `excellent` é o próprio `supervisor_evaluation_weight` e não tem coluna. `unsatisfactory` tem valor inicial `0`, mas permanece configurável por tipo de estágio na coluna `unsatisfactory_value`. Os limites de jornada e a margem são inteiros.

## Regras de negócio em PHP

As regras são aplicadas pela validação Laravel no Model ao salvar. A migration não adiciona constraints `CHECK` para validar regras de negócio; a validação acontece na aplicação.

- `required_hours` deve ser inteiro positivo.
- Os três pesos devem ser inteiros positivos e sua soma deve ser exatamente `10`. O peso da avaliação do supervisor também define o valor de `excellent` e o limite superior dos demais conceitos.
- Os quatro conceitos configuráveis devem ser números não negativos com até uma casa decimal. A sequência completa — `excellent`, `very_good`, `good`, `satisfactory` e `unsatisfactory` — deve ser estritamente decrescente; valores iguais não são permitidos. Os conceitos configuráveis não podem ultrapassar `supervisor_evaluation_weight`. `unsatisfactory` costuma começar em zero, mas cada tipo pode definir outro valor, como `1.0`.
- `excellent` usa diretamente `supervisor_evaluation_weight`, sem duplicar esse valor em uma coluna.
- `max_daily_hours` e `max_weekly_hours` são inteiros. O formulário começa preenchido com `6` e `30`; esses valores são limites mínimos e não podem ser reduzidos. O máximo configurável é de `24` horas por dia e `40` por semana, e o limite diário não pode superar o semanal. O teto de 40 horas semanais corresponde à exceção do art. 10, § 1º da [Lei nº 11.788/2008](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm), aplicável a cursos que alternam teoria e prática, em períodos sem aulas presenciais, quando previsto no projeto pedagógico. A jornada informada deve respeitar os limites configurados para cada dia e para a soma semanal.
- `safety_margin_days` é inteiro não negativo, inicialmente `7`, e será congelado no estágio. O cálculo automático usa essa margem e grava somente a previsão em `internships.projected_end_date`; não persiste fórmula, versão de algoritmo ou entradas. A regra completa está definida por este contrato e pelo [serviço de cálculo de término](doc:service-internshipenddatecalculator).

A validação também exige curso ativo na criação, troca de curso ou reativação. Uma desativação posterior do curso não bloqueia a edição de um tipo já existente enquanto sua associação não mudar. `active()` filtra tipos não desativados; esta migration não cria índices secundários explícitos.

Os pesos e os valores dos conceitos são configurados no tipo de estágio, nunca na resposta da avaliação nem livremente em cada estágio. Na criação do estágio, o snapshot pode agrupar esses valores no contrato histórico `internship_type_snapshot.rules`, montado a partir das colunas escalares, usando o peso do supervisor para `excellent`; alterar o tipo depois não pode recalcular históricos já formalizados.

## Checklist

- [x] Definir que pesos e valores dos conceitos pertencem ao tipo de estágio.
- [x] Definir campos escalares, precisão dos pesos e conceitos, limites de jornada e margem do cálculo de término.
- [x] Criar migration sem constraints `CHECK` de regras de negócio e sem índice secundário explícito.
- [x] Criar Model com casts e validação Laravel em PHP.
- [x] Criar factory com regras completas.
- [x] Implementar validação da carga horária obrigatória, dos pesos, conceitos e limites diário e semanal da jornada.
- [ ] Testar consulta de tipos por curso/campus e ciclo de desativação.
- [ ] Testar preservação do snapshot, datas e demais atributos após edição, troca de curso, desativação e reativação do tipo usado em estágio formalizado.
- [ ] Testar conceitos fora do peso, `excellent` derivado do peso do supervisor, valores repetidos, ordem inválida, limites de jornada fora dos intervalos definidos e margem negativa.
- [ ] Testar migrate/rollback das Migrations 15, 11, 10 e 09 na ordem das FKs.
