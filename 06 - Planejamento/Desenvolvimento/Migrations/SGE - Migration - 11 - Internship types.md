---
title: SGE — Migration 11 — internship_types
description: Contrato dos tipos de estágio e suas regras configuráveis.
type: migration-reference
status: planned
order: 11
table: internship_types
tags:
  - sge/migrations
  - sge/estagio
  - sge/banco-de-dados
---
> [!todo] Estado
> Planejada. Depende de [[SGE - Migration - 09 - Courses|`courses`]].

## Contrato

| Campo         | Regra                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| `id`          | bigint, chave primária.                                                                     |
| `course_id`   | FK obrigatória para o curso.                                                                |
| `name`        | nome do tipo, obrigatório.                                                                  |
| `rules`       | JSONB com carga horária, pesos, valores dos conceitos e exceções configuráveis.             |
| ciclo de vida | timestamps e eventual desativação; sem `InternshipTypeStatus` agora.                        |

## Regras de avaliação

`rules` será a fonte dos critérios de conclusão por modalidade. O contrato mínimo deverá conter:

- `required_hours`: carga horária obrigatória;
- `grade_weights`: pesos da avaliação do supervisor, do relatório e da apresentação, cuja soma obrigatoriamente é 10;
- `concept_values`: valor numérico de cada conceito usado na avaliação do supervisor;
- `workload_exceptions`: exceções aplicáveis à carga horária, quando houver.
- `end_date_calculation`: versão da fórmula e margem de segurança usada na previsão de término.

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
  "workload_exceptions": {
    "enabled": false,
    "max_daily_hours": null,
    "max_weekly_hours": null,
    "reason_required": false
  },
  "end_date_calculation": {
    "version": 1,
    "safety_margin_days": 7
  }
}
```

`required_hours` é inteiro positivo. Cada peso é número não negativo e a soma de `supervisor_evaluation`, `report` e `presentation` é exatamente 10; componente com peso zero não exige nota. `concept_values` contém exatamente os cinco conceitos, em ordem não crescente, dentro do intervalo entre zero e o peso da avaliação do supervisor. `excellent` deve ser igual ao peso dessa componente e `unsatisfactory` deve ser zero, para que a melhor avaliação alcance a contribuição máxima sem nova multiplicação.

`end_date_calculation.version` identifica a fórmula e `safety_margin_days` é inteiro não negativo, inicialmente `7`. Ambos são congelados no estágio. A regra completa está definida por este contrato e pelo [[SGE - Service - InternshipEndDateCalculator|serviço de cálculo de término]].

Os pesos e os valores dos conceitos são configurados no tipo de estágio, nunca na resposta da avaliação nem livremente em cada estágio. As regras devem ser congeladas em `internship_type_snapshot` na criação do estágio; alterar o tipo depois não pode recalcular históricos já formalizados.

## Checklist

- [x] Definir que pesos e valores dos conceitos pertencem ao tipo de estágio.
- [x] Definir o schema mínimo, a escala dos conceitos e a configuração do cálculo de término.
- [ ] Criar migration com JSONB e índice somente se uma consulta real exigir.
- [ ] Criar Model com cast/objeto de regras validado.
- [ ] Criar factory com regras mínimas e completas.
- [ ] Implementar validação de carga horária, pesos, conceitos e exceções.
- [ ] Testar tipo de outro curso/campus e alteração após uso.
- [ ] Testar snapshot no estágio.
- [ ] Testar conceitos fora do peso, ordem inválida, margem negativa e versão desconhecida.
- [ ] Testar migrate/rollback na ordem completa.
