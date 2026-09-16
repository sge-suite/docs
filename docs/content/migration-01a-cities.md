---
id: migration-01a-cities
title: Migration 01A — cities
description: Catálogo local das cidades brasileiras identificadas pelo código IBGE.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/localizacao, sge/ibge
related: enum-brazilianstate, migration-01-addresses, migration-22-non-working-dates
source_refs: https://github.com/sge-suite/sge/blob/master/app/Console/Commands/FetchCities.php, https://github.com/sge-suite/sge/blob/master/config/services.php, https://github.com/sge-suite/sge/blob/master/database/data/cities.json
---
> [!todo] Estado
> Planejada. É uma tabela de referência pequena, carregada a partir do catálogo do IBGE/BrasilAPI antes de liberar os formulários de endereço.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador interno usado pelas FKs. |
| `ibge_code` | `char(7)` | não | `UQ` | Código oficial do município. |
| `name` | `varchar(120)` | não | índice `(state, name)` | Nome oficial usado nos selects e relatórios. |
| `state` | `char(2)` | não | índice | Sigla da UF validada por [`BrazilianState`](doc:enum-brazilianstate). |
| `created_at` | `timestamp(0)` | não | — | Inclusão no catálogo. |
| `updated_at` | `timestamp(0)` | não | — | Última sincronização. |

O catálogo nacional tem poucos milhares de linhas e deve ser importado localmente. A carga inicial foi feita durante o desenvolvimento: o catálogo conferido está salvo em `database/data/cities.json` e versionado junto com o projeto. Depois, o `CitySeeder` lerá esse arquivo e inserirá/atualizará as cidades de forma idempotente pelo `ibge_code`.

Não haverá chamada à BrasilAPI para o autocomplete de cidades nem para o cálculo de feriados. A API/IBGE pode ser usada apenas para obter ou revisar o arquivo versionado antes de uma nova implantação. A única consulta externa prevista no formulário é a busca opcional por CEP, documentada em [`addresses`](doc:migration-01-addresses); mesmo nesse caso, a cidade é resolvida e persistida pela tabela local usando o código IBGE. O formulário seleciona primeiro a UF e consulta a tabela local com filtro por `state` e busca textual limitada; a cidade nunca é um enum nem texto livre.

O código IBGE é a identidade da cidade. O `CitySeeder` pode atualizar o nome oficial associado ao mesmo código em uma carga controlada; documentos gerados preservam os valores formatados no snapshot da geração, e endereços históricos continuam apontando para a mesma identidade municipal. Não há enum de cidades nem exclusão lógica como operação normal.

## Geração do catálogo e `CitySeeder`

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

O `CitySeeder` deve:

- ler o arquivo local sem fazer requisições de rede;
- validar o código IBGE com sete dígitos, a UF contra `BrazilianState` e o nome não vazio;
- inserir ou atualizar pelo `ibge_code`, em lotes e dentro de uma operação segura para reexecução;
- nunca apagar cidades automaticamente, porque endereços e feriados podem referenciá-las;
- ser chamado pelo seeder principal sem depender de ordem implícita ou de serviço externo disponível.

A obtenção do arquivo ocorre fora do fluxo de seed, durante o desenvolvimento ou em uma sincronização administrativa explícita. Depois de revisado e commitado, qualquer ambiente consegue popular o banco de forma determinística e reproduzível.

## Integridade

- `PRIMARY KEY (id)`;
- `UNIQUE (ibge_code)`;
- `INDEX (state, name)` para o autocomplete dependente da UF;
- a validação de `state` usa os 27 valores de [`BrazilianState`](doc:enum-brazilianstate);
- uma cidade só pode ser usada por endereço e feriado municipal da mesma UF.

## Checklist

- [ ] Criar `create_cities_table` antes de `create_addresses_table`.
- [ ] Criar Model `City` com cast de `state`.
- [x] Gerar e revisar `database/data/cities.json` com o catálogo nacional pelo comando Artisan.
- [ ] Criar `CitySeeder` idempotente, executável sem rede e seguro para reexecução.
- [ ] Testar código IBGE, filtro por UF e busca do autocomplete.
