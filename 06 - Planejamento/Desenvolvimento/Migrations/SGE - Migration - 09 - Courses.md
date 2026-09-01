---
title: SGE — Migration 09 — courses
description: Contrato dos cursos por campus e de seus coordenadores.
type: migration-reference
status: planned
order: 9
table: courses
tags:
  - sge/migrations
  - sge/cursos
  - sge/banco-de-dados
---
> [!todo] Estado
> Planejada. Depende de [[SGE - Migration - 03 - Campuses|`campuses`]] e [[SGE - Migration - 04 - Affiliations|`affiliations`]].

## Contrato

| Campo                 | Regra                                                         |
| --------------------- | ------------------------------------------------------------- |
| `id`                  | bigint, chave primária.                                       |
| `campus_id`           | FK obrigatória para o campus.                                 |
| `name`                | nome do curso, obrigatório.                                   |
| coordenadores         | dois campos FK para `affiliations`, conforme nomes aprovados. |
| timestamps / exclusão | definir conforme ciclo de catálogo.                           |

Os coordenadores são vínculos, não texto livre nem usuários genéricos. O curso não deve criar tabela intermediária de coordenação neste primeiro desenho. As referências usam `affiliations` para preservar campus, função e desativação do vínculo.

## Checklist

- [ ] Confirmar nomes e obrigatoriedade das duas FKs de coordenador.
- [ ] Criar migration com FKs para `campuses` e `affiliations`.
- [ ] Definir se coordenadores podem ser nulos durante o cadastro.
- [ ] Criar Model `Course`, relações e factory.
- [ ] Aplicar escopo de campus e validação do tipo do vínculo coordenador.
- [ ] Testar curso de campus ativo, coordenador de outro campus e vínculo desativado.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [[SGE - Migration - 10 - Affiliation course|adicionar course_id a affiliations]]
- [[SGE - Migration - 11 - Internship types|internship_types]]
