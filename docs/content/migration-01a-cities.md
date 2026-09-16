---
id: migration-01a-cities
title: Migration 01A — cities
description: Catálogo local das cidades brasileiras identificadas pelo código IBGE.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/localizacao, sge/ibge
related: enum-brazilianstate, migration-01-addresses, migration-22-holidays
source_refs: https://github.com/sge-suite/sge/blob/master/app/Console/Commands/FetchCities.php, https://github.com/sge-suite/sge/blob/master/config/services.php, https://github.com/sge-suite/sge/blob/master/database/data/cities.json
---
> [!success] Estado
> Implementada. A tabela de referência e o catálogo local estão disponíveis no projeto; a carga é determinística e não depende de serviço externo.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador interno usado pelas FKs. |
| `ibge_code` | `char(7)` | não | `UQ` | Código oficial do município. |
| `name` | `varchar(120)` | não | índice `(state, name)` | Nome oficial usado nos selects e relatórios. |
| `state` | `char(2)` | não | índice | Sigla da UF validada por [`BrazilianState`](doc:enum-brazilianstate). |
| `created_at` | `timestamp(0)` | não | — | Inclusão no catálogo. |
| `updated_at` | `timestamp(0)` | não | — | Última sincronização. |

O catálogo nacional tem 5.571 municípios e é importado localmente. O catálogo conferido está salvo em `database/data/cities.json` e versionado junto com o projeto. A migration `create_cities_table`, o model `City` e o `CitySeeder` estão implementados: o seeder lê esse arquivo e insere/atualiza as cidades de forma idempotente pelo `ibge_code`, sem apagar registros existentes.

Não há chamada à BrasilAPI para consultas de cidades nem para o cálculo de feriados. A API/IBGE pode ser usada apenas para obter ou revisar o arquivo versionado antes de uma nova implantação. A busca opcional por CEP, documentada em [`addresses`](doc:migration-01-addresses), fica para uma etapa futura; quando existir, a cidade continuará sendo resolvida no catálogo local, sem criação de municípios pela resposta externa. Quando uma busca por nome for necessária, o backend consulta a tabela local com filtro por `state`, busca textual limitada e o índice `(state, name)`. `City` não usa Scout/Meilisearch porque é uma tabela de referência de backend, sem necessidade atual de busca fuzzy ou índice externo; a cidade nunca é um enum nem texto livre.

O código IBGE é a identidade da cidade. O `CitySeeder` pode atualizar o nome oficial associado ao mesmo código em uma carga controlada; documentos gerados preservam os valores formatados no snapshot da geração, e endereços históricos continuam apontando para a mesma identidade municipal. Não há enum de cidades nem exclusão lógica como operação normal.

## Geração do catálogo e carga local

O comando Artisan `cities:fetch` consulta a lista de UFs, busca os municípios de cada uma, valida os códigos IBGE e gera o arquivo local. A configuração da URL fica em `services.brasil_api.base_url`; não há URL duplicada dentro do comando.

```bash
php artisan cities:fetch
php artisan cities:fetch --force
```

O comando não substitui um catálogo existente sem `--force`. A opção `--output` permite gerar um arquivo temporário ou alternativo para revisão. A gravação do catálogo é atômica: falhas durante a coleta não deixam um JSON parcial no caminho final.

O arquivo `database/data/cities.json` contém somente dados de referência, em formato estável e revisável:

```json
[
  {
    "ibge_code": "4300109",
    "name": "Agudo",
    "state": "RS"
  }
]
```

O `CitySeeder` implementado:

- lê o arquivo local sem fazer requisições de rede;
- valida o código IBGE com sete dígitos, a UF contra `BrazilianState`, o nome não vazio e o limite da coluna;
- insere ou atualiza pelo `ibge_code`, em lotes de 500 registros e dentro de uma transação;
- rejeita códigos IBGE duplicados no catálogo;
- nunca apaga cidades automaticamente, porque endereços e feriados podem referenciá-las;
- é chamado explicitamente pelo seeder principal.

Para carregar ou recarregar o catálogo, use:

```bash
php artisan db:seed --class=Database\\Seeders\\CitySeeder
```

A obtenção do arquivo ocorre fora do fluxo de seed, durante o desenvolvimento ou em uma sincronização administrativa explícita. Depois de revisado e commitado, qualquer ambiente consegue popular o banco de forma determinística e reproduzível.

## Integridade

- `PRIMARY KEY (id)`;
- `UNIQUE (ibge_code)`;
- `INDEX (state)` e `INDEX (state, name)` para filtros por UF e consultas locais por nome;
- a validação de `state` usa os 27 valores de [`BrazilianState`](doc:enum-brazilianstate);
- a UF do endereço é obtida por `city_id`, sem campo estadual duplicado; feriados municipais devem pertencer à UF da cidade selecionada.

O model `City` declara `holidays()` para os feriados municipais e `addresses()` para os endereços. `CityFactory` cria fixtures independentes de rede e do catálogo nacional nos testes de backend.

## Checklist

- [x] Criar `create_cities_table` antes de `create_addresses_table`.
- [x] Criar Model `City` com cast de `state`.
- [x] Adicionar `City::addresses()` e `CityFactory` para fixtures de backend.
- [x] Gerar e revisar `database/data/cities.json` com o catálogo nacional pelo comando Artisan.
- [x] Criar `CitySeeder` idempotente, executável sem rede e seguro para reexecução.
- [x] Testar migration, carga local, unicidade do código IBGE e filtro por UF/nome.
