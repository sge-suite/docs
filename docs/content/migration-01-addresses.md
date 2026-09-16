---
id: migration-01-addresses
title: Migration 01 — addresses
description: Base backend de endereços reutilizáveis e cópia histórica na própria tabela.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/endereco
related: migration-01a-cities, actions, concerns, testes-existentes, dominio-e-modelo-de-dados, migration-02-user-personal-data, migration-03-campuses, migration-12-granting-parties, migration-15-internships
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_16_153327_create_addresses_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Address.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/AddressValidationRules.php, https://github.com/sge-suite/sge/blob/master/app/Actions/CopyAddress.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AddressesTest.php
---
> [!success] Estado
> Base backend implementada: migration, model, factories, relacionamentos, validação dos campos obrigatórios, Activity Log e cópia histórica. Consulta e validação de CEP, telas e integrações com os cadastros e a formalização continuam pendentes.

## Contrato implementado

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador interno. |
| `city_id` | `bigint` | não | `FK`, índice | Referencia `cities.id`; exclusão `RESTRICT`. A UF é obtida da cidade. |
| `street` | `varchar(255)` | não | — | Rua ou logradouro obrigatório. |
| `number` | `varchar(32)` | não | — | Número textual obrigatório; aceita `123 A`, `0` e `s/n`. |
| `neighborhood` | `varchar(120)` | não | — | Bairro obrigatório. |
| `zip_code` | `char(8)` | sim | — | Valor opcional; sem validação de formato ou limpeza de dígitos nesta etapa. |
| `created_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel; preenchido pelo Eloquent no timezone institucional. |
| `updated_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel; atualizado pelo Eloquent. |

A migration usa `$table->timestamps()`, com a nulabilidade padrão do Laravel. O Eloquent converte esses campos automaticamente em datas, sem casts explícitos no model. Inserções diretas que não passem pelo Eloquent podem deixar os timestamps nulos. O `down()` remove a tabela.

A cidade é obrigatória e selecionada no [catálogo local](doc:migration-01a-cities), criado antes desta tabela. Não há `complement`, UF duplicada, tabela de snapshots, `copied_from_address_id` ou campos de autoria. A tabela não usa `SoftDeletes` nem Scout/Searchable.

## Model, validação e auditoria

`Address` declara os campos cadastrais com `#[Fillable]`, usa `HasFactory` e possui casts de `city_id` para inteiro e dos campos textuais para string. `Address::city()` é `BelongsTo`; `City::addresses()` é `HasMany`. As relações com modelos ainda inexistentes não foram adicionadas.

`AddressValidationRules` centraliza as regras aplicadas no evento `saving` do model: cidade existente, logradouro, número e bairro obrigatórios, todos com os limites do schema. O número é textual, sem restringir os valores ao formato numérico. Não há Form Request porque ainda não existe endpoint de cadastro.

O CEP omitido, nulo ou vazio é persistido como `null`. Valores informados não passam por validação de CEP, normalização por helper ou remoção de máscara; permanecem sujeitos ao limite físico de `char(8)` no PostgreSQL. Essa coluna pode apresentar espaços de preenchimento ao ler valores menores que oito caracteres. A validação de oito dígitos e o tratamento de máscaras serão definidos em uma etapa futura.

O Activity Log registra os campos cadastrais, somente quando há mudanças, sem registros vazios. A autoria vem do próprio mecanismo de auditoria. `AddressFactory` usa `CityFactory` para criar fixtures independentes de rede e da carga completa do catálogo.

## Cópia histórica implementada

`CopyAddress::handle(Address $address): Address` exige uma origem persistida, relê a linha dentro de uma transação com bloqueio compartilhado e cria outra linha em `addresses`. A cópia recebe novo ID e timestamps, não altera a origem e ignora mudanças ainda não salvas no objeto recebido. Cópias sucessivas são independentes.

Uma origem não persistida gera `InvalidArgumentException`; se a linha já foi removida, a releitura gera `ModelNotFoundException`. A criação da cópia também passa pelas regras do model e pelo Activity Log.

O bloqueio seletivo de edição e exclusão de endereços históricos será implementado junto às futuras FKs de formalização. Esta base disponibiliza a cópia, mas ainda não identifica quais linhas foram utilizadas por um estágio. Não há integração com `internships`, `user_personal_data`, campi ou concedentes nesta etapa.

Na formalização futura, `internships.workplace_address_id` deverá apontar para uma cópia do endereço da concedente nesta mesma tabela. `internships.student_address_id` poderá apontar para a cópia do endereço do discente quando necessário. Essas linhas deverão ser preservadas sem alterações retroativas; a mudança do cadastro atual poderá criar outra linha e trocar sua FK.

## Consulta de CEP futura

A consulta à BrasilAPI está fora da base atual. Quando implementada, sua resposta servirá apenas como sugestão de preenchimento e não impedirá a edição manual em caso de CEP geral, ausência ou indisponibilidade.

A cidade deverá continuar sendo resolvida exclusivamente no catálogo local: primeiro pelo código IBGE quando disponível; caso contrário, pelo nome normalizado e pela UF. Ausência ou ambiguidade exigirá seleção manual. A integração não poderá criar cidades a partir da resposta externa.

## Testes

`tests/Feature/AddressesTest.php` cobre tipos e limites PostgreSQL, nulabilidade, índices, FK `RESTRICT`, migrate e rollback, factories, casts, relacionamentos, campos obrigatórios, número textual, CEP opcional sem validação de formato, cópia histórica e Activity Log. Os testes usam `Http::fake()` e `preventStrayRequests()` para impedir acesso à rede.

```bash
./vendor/bin/sail artisan test --compact tests/Feature/AddressesTest.php tests/Feature/CitiesTest.php tests/Unit/DatabaseDriverGuardTest.php
./vendor/bin/sail exec laravel.test vendor/bin/pint --dirty --format agent
```

Os testes afetados passaram no banco PostgreSQL `testing`: 50 testes e 209 assertions, incluindo cidades e a guarda global de migrations. Pint e PHPStan nos arquivos da implementação também passaram.

## Checklist

- [x] Definir cidade por FK para catálogo IBGE e CEP opcional.
- [x] Confirmar campos obrigatórios e limites textuais.
- [x] Criar migration reversível `create_addresses_table` com índice em `city_id` e FK `RESTRICT`.
- [x] Criar `Address`, `AddressFactory`, `CityFactory` e relacionamentos existentes.
- [x] Validar cidade, logradouro, bairro e número textual, incluindo `s/n`.
- [x] Usar timestamps nativos, sem casts explícitos de data.
- [x] Registrar alterações cadastrais no Activity Log, sem campos de autoria.
- [x] Implementar e testar a cópia histórica na própria tabela.
- [x] Testar schema, migrate, rollback e persistência em PostgreSQL.
- [x] Atualizar [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados).
- [ ] Definir validação e normalização de CEP no futuro fluxo de cadastro.
- [ ] Implementar a consulta opcional de CEP e resolução da cidade no catálogo local.
- [ ] Criar telas e endpoints de cadastro nas etapas correspondentes.
- [ ] Integrar cópias e impedir alteração/exclusão de linhas históricas ao implementar a formalização.

## Próximas dependências

- [user_personal_data](doc:migration-02-user-personal-data)
- [campuses](doc:migration-03-campuses)
- [granting_parties](doc:migration-12-granting-parties)
- [internships](doc:migration-15-internships)
