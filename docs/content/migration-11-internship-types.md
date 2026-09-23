---
id: migration-11-internship-types
title: Migration 11 — internship_types
description: Contrato dos tipos de estágio e suas regras configuráveis.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/estagio, sge/banco-de-dados
related: migration-09-courses, service-internshipenddatecalculator
source_refs:
---
> [!todo] Estado
> Planejada. Depende de [`courses`](doc:migration-09-courses).

## Contrato

| Campo         | Regra                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| `id`          | bigint, chave primária.                                                                     |
| `course_id`   | FK obrigatória para o curso.                                                                |
| `name`        | nome do tipo, obrigatório.                                                                  |
| `rules`       | JSONB com carga horária, pesos, valores dos conceitos, limites de jornada e margem de segurança. |
| ciclo de vida | timestamps e eventual desativação; sem `InternshipTypeStatus` agora.                        |

## Regras de avaliação

`rules` será a fonte dos critérios de conclusão por modalidade. O contrato mínimo deverá conter:

- `required_hours`: carga horária obrigatória;
- `grade_weights`: pesos da avaliação do supervisor, do relatório e da apresentação, cuja soma obrigatoriamente é 10;
- `concept_values`: valor numérico de cada conceito usado na avaliação do supervisor;
- `workload_limits`: limites diário e semanal da jornada.
- `end_date_calculation`: margem de segurança usada na previsão de término.

### Schema mínimo de `rules`

```json
{
  "required_hours": 300,
  "grade_weights": {
    "supervisor_evaluation": 4,
    "report": 3,
    "presentation": 3
  },
  "concept_values": {
    "excellent": 4,
    "very_good": 3,
    "good": 2,
    "satisfactory": 1,
    "unsatisfactory": 0
  },
  "workload_limits": {
    "max_daily_hours": 6,
    "max_weekly_hours": 30
  },
  "end_date_calculation": {
    "safety_margin_days": 7
  }
}
```

`required_hours` é inteiro positivo. Cada peso é número não negativo e a soma de `supervisor_evaluation`, `report` e `presentation` é exatamente 10; componente com peso zero não exige nota. `concept_values` contém exatamente os cinco conceitos, em ordem não crescente, entre zero e o peso de `grade_weights.supervisor_evaluation`. `concept_values.excellent` deve ser igual a `grade_weights.supervisor_evaluation`, e `concept_values.unsatisfactory` deve ser zero, para que a melhor avaliação alcance a contribuição máxima sem nova multiplicação.

`workload_limits.max_daily_hours` e `workload_limits.max_weekly_hours` são inteiros. O formulário de configuração começa preenchido com `6` e `30`, respectivamente; esses valores são mínimos e não podem ser reduzidos, mas podem ser aumentados. A jornada informada deve respeitar os limites configurados para cada dia e para a soma semanal.

`end_date_calculation.safety_margin_days` é inteiro não negativo, inicialmente `7`, e é congelado no estágio. A versão identifica o algoritmo de cálculo, não uma regra configurável do tipo; ela e as entradas usadas são registradas em `projected_end_date_calculation`. A regra completa está definida por este contrato e pelo [serviço de cálculo de término](doc:service-internshipenddatecalculator).

Os pesos e os valores dos conceitos são configurados no tipo de estágio, nunca na resposta da avaliação nem livremente em cada estágio. As regras devem ser congeladas em `internship_type_snapshot` na criação do estágio; alterar o tipo depois não pode recalcular históricos já formalizados.

## Checklist

- [x] Definir que pesos e valores dos conceitos pertencem ao tipo de estágio.
- [x] Definir o schema mínimo, a escala dos conceitos, os limites de jornada e a margem do cálculo de término.
- [ ] Criar migration com JSONB e índice somente se uma consulta real exigir.
- [ ] Criar Model com cast/objeto de regras validado.
- [ ] Criar factory com regras mínimas e completas.
- [ ] Implementar validação da carga horária obrigatória, dos pesos, conceitos e limites diário e semanal da jornada.
- [ ] Testar tipo de outro curso/campus e alteração após uso.
- [ ] Testar snapshot no estágio.
- [ ] Testar conceitos fora do peso, `excellent` diferente do peso do supervisor, ordem inválida, limites menores que 6/30 e margem negativa.
- [ ] Testar migrate/rollback na ordem completa.
