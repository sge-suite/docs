---
id: migration-22-holidays
title: Migration 22 — holidays
description: Calendário global auditável de feriados nacionais, estaduais e municipais.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/calendario, sge/calculos
related: enum-holidayscope, enum-brazilianstate, migration-01a-cities, migration-15-internships, migration-22-internship-calendar-overrides
source_refs:
---
> [!success] Estado
> Implementada como base de backend. Registra somente feriados oficiais reutilizáveis; recessos, folgas, pontes e fechamentos específicos entram como pausas do estágio. A consulta de cidades não depende da API e os feriados importados são persistidos antes de qualquer cálculo.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da data. |
| `date` | `date` | não | índice | Uma data por registro. Feriadão usa uma linha para cada dia. |
| `name` | `varchar(255)` | não | — | Nome apresentado na lista e nos relatórios. |
| `scope` | `varchar(255)` | não | índice | [`HolidayScope`](doc:enum-holidayscope): `national`, `state` ou `municipal`; validado pelo cast do model. |
| `state_code` | `char(2)` | sim | índice composto | UF validada por [`BrazilianState`](doc:enum-brazilianstate). Nula no escopo nacional, obrigatória no estadual e derivada da cidade no municipal. |
| `city_id` | `bigint` | sim | `FK`, índice composto | Cidade do feriado municipal; `RESTRICT`. Obrigatória nesse escopo. |
| `deleted_at` | `timestamp(0)` | sim | parte da unicidade | Exclusão lógica via `SoftDeletes`; permite auditoria e restauração. |
| `created_at` | `timestamp(0)` | não | — | Auditoria. |
| `updated_at` | `timestamp(0)` | não | — | Auditoria técnica. |

## Regras de localização

- `national`: `state_code` e `city_id` devem ser nulos;
- `state`: `state_code` obrigatório e `city_id` nulo;
- `municipal`: `city_id` obrigatório; o model deriva a UF da cidade e confere uma UF informada;
- a mesma data pode ter registros nacional, estadual e municipal distintos;
- feriados diferentes podem ocorrer na mesma data e no mesmo escopo; o mesmo feriado ativo não pode ser duplicado: nacional por data/nome, estadual por data/UF/nome e municipal por data/cidade/nome;
- a exclusão é lógica (`deleted_at`); consultas normais ignoram registros excluídos e o Activity Log registra a auditoria;
- nenhuma consulta de cálculo chama a BrasilAPI.

O comando `php artisan holidays:import {ano}` importa os feriados nacionais da BrasilAPI. Com `--uf=RS`, importa os nacionais e estaduais retornados para a UF. A chamada usa timeout e retry, ignora pontos facultativos e é idempotente: registros ativos existentes não são sobrescritos. Feriados municipais continuam previstos para cadastro manual quando houver fluxo administrativo.

As migrations do projeto exigem PostgreSQL. A unicidade usa `NULLS NOT DISTINCT` sobre data, nome, escopo, UF, cidade e `deleted_at`, permitindo escopos distintos e apenas uma versão ativa de cada feriado.

O Administrador do Sistema será responsável por importar ou cadastrar dados quando a interface existir. O Setor de Estágio consulta e utiliza o calendário, mas não edita o calendário global; suas liberações ou bloqueios para um estágio ficam em [`internship_calendar_overrides`](doc:migration-22-internship-calendar-overrides).

## Dependências e aplicação

O estágio usa o endereço histórico do local de trabalho para obter a cidade e a UF. O serviço combina os feriados nacionais, estaduais e municipais aplicáveis com a jornada e as pausas. Uma exceção de estágio não altera esta tabela: fica em `internship_calendar_overrides`. Recessos, feriadões e outros períodos sem atividade são pausas, não registros em `holidays`.

## Checklist

- [x] Criar migration PostgreSQL com índices por data, localização e unicidade de registros ativos.
- [x] Criar Model `Holiday` com `SoftDeletes`, cast de `scope` e `state_code`.
- [x] Criar importação nacional/estadual idempotente com retry, sem sobrescrever registros.
- [ ] Criar cadastro manual de datas municipais pelo Administrador do Sistema.
- [x] Testar schema, combinações de escopo/localização, unicidade, soft delete, filtro por UF e importação.
