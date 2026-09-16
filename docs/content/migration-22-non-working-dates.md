---
id: migration-22-non-working-dates
title: Migration 22 — non_working_dates
description: Calendário global auditável de datas sem expediente nacionais, estaduais e municipais.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/calendario, sge/calculos
related: enum-nonworkingdatescope, enum-brazilianstate, migration-01a-cities, migration-15-internships, migration-22-internship-calendar-overrides
source_refs:
---
> [!todo] Estado
> Planejada. Registra o calendário reutilizável; a consulta de cidades não depende da API e os feriados nacionais/estaduais importados devem ser persistidos antes do cálculo.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da data. |
| `date` | `date` | não | índice | Uma data por registro. Feriadão usa uma linha para cada dia. |
| `name` | `varchar(255)` | não | — | Nome apresentado na lista e nos relatórios. |
| `scope` | `varchar(16)` | não | índice | [`NonWorkingDateScope`](doc:enum-nonworkingdatescope): `national`, `state` ou `municipal`. |
| `state_code` | `char(2)` | sim | índice composto | UF do feriado estadual; validada por [`BrazilianState`](doc:enum-brazilianstate). Nula no escopo nacional e opcional quando derivada de `city_id`. |
| `city_id` | `bigint` | sim | `FK`, índice composto | Cidade do feriado municipal; `RESTRICT`. Obrigatória nesse escopo. |
| `source` | `varchar(32)` | não | — | Origem auditada, como `brasil_api`, `ibge` ou `manual`; não é enum. |
| `source_reference` | `text` | sim | — | URL, ato oficial ou observação da origem. |
| `created_by_affiliation_id` | `bigint` | sim | `FK` | Vínculo do Administrador do Sistema que cadastrou ou confirmou; nulo em importação automática. |
| `imported_at` | `timestamp(0)` | sim | — | Instante de importação; nulo para cadastro manual. |
| `invalidated_at` | `timestamp(0)` | sim | índice | Retirada lógica sem apagar um registro já usado em cálculo. |
| `invalidated_by_affiliation_id` | `bigint` | sim | `FK` | Vínculo que invalidou a data. |
| `created_at` | `timestamp(0)` | não | — | Auditoria. |
| `updated_at` | `timestamp(0)` | não | — | Auditoria técnica; não reescreve uma data usada historicamente. |

## Regras de localização

- `national`: `state_code` e `city_id` devem ser nulos;
- `state`: `state_code` obrigatório e `city_id` nulo;
- `municipal`: `city_id` obrigatório e sua UF deve coincidir com `state_code`, quando informado;
- a mesma data pode ter registros nacional, estadual e municipal distintos;
- o mesmo registro lógico não pode ser duplicado entre datas não invalidadas: nacional por data, estadual por data/UF e municipal por data/cidade;
- a invalidação cria uma nova decisão histórica, não altera o conteúdo usado em cálculos anteriores;
- nenhuma consulta de cálculo chama a BrasilAPI.

Feriados nacionais e estaduais podem ser importados automaticamente uma única vez por ano e UF necessária. A falha da fonte gera retry e aviso ao Administrador do Sistema; o calendário publicado permanece intacto. Feriados municipais são cadastrados manualmente até existir uma fonte confiável para esse escopo.

O Administrador do Sistema é responsável por importar ou cadastrar dados. O Setor de Estágio consulta e utiliza o calendário, mas não edita o calendário global; suas liberações ou bloqueios para um estágio ficam em [`internship_calendar_overrides`](doc:migration-22-internship-calendar-overrides).

## Dependências e aplicação

O estágio usa o endereço histórico do local de trabalho para obter a cidade e a UF. O serviço combina as datas nacionais, estaduais e municipais aplicáveis com a jornada e as pausas. Uma exceção de estágio não altera esta tabela: fica em `internship_calendar_overrides`.

## Checklist

- [ ] Criar migration com constraints condicionais por `scope`.
- [ ] Criar índices parciais de unicidade para datas não invalidadas.
- [ ] Criar Model com cast de `scope` e `state_code`.
- [ ] Criar importação nacional/estadual idempotente com retry e aviso, sem sobrescrever registros.
- [ ] Criar cadastro manual de datas municipais pelo Administrador do Sistema.
- [ ] Testar duplicata lógica, mesma data em escopos diferentes, invalidação e filtro por cidade/UF.
