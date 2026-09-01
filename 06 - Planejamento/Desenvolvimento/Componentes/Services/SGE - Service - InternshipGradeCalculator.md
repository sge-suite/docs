---
title: SGE — Service — InternshipGradeCalculator
description: Contrato técnico das notas de supervisor, relatório, apresentação e resultado consolidado.
type: technical-reference
status: planned
tags:
  - sge/services
  - sge/avaliacao
  - sge/calculos
---
Serviço puro que recebe o snapshot de regras do tipo, os dez conceitos da avaliação aprovada e as notas lançadas pelo orientador. Retorna as contribuições e, quando completas, a nota consolidada.

## Fórmulas

```text
supervisor_grade = round(sum(valor(conceito_1..10)) / 10, 1)
consolidated_grade = round(supervisor_grade + report_grade + presentation_grade, 1)
```

Cada valor de conceito já está na escala do peso do supervisor. Relatório e apresentação também são informados diretamente entre zero e seu peso. Peso zero produz contribuição zero e remove a obrigatoriedade. O serviço retorna consolidação nula enquanto faltar contribuição de peso positivo.

## Erros de domínio

- pesos ausentes, negativos ou cuja soma não seja 10;
- mapa de conceitos incompleto, fora da ordem/limite aprovado ou com chave desconhecida;
- avaliação com menos ou mais de dez critérios;
- nota de orientador negativa, com mais de uma casa ou acima do peso;
- tentativa de calcular supervisor a partir de avaliação não aprovada.

Não existe nota mínima configurada. O serviço não decide aprovação acadêmica enquanto essa regra não estiver declarada no snapshot do tipo.

## Referências

- [[SGE - Migration - 11 - Internship types]]
- [[SGE - Migration - 18 - Evaluations]]
