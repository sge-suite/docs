---
id: migration-01-addresses
title: Migration 01 — addresses
description: Base backend de endereços próprios de cada cadastro e cópia histórica na própria tabela.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/endereco
related: migration-01a-cities, actions, concerns, testes-existentes, dominio-e-modelo-de-dados, migration-02-user-personal-data, migration-03-campuses, migration-12-granting-parties, migration-15-internships
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_16_153327_create_addresses_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Address.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/AddressValidationRules.php, https://github.com/sge-suite/sge/blob/master/app/Actions/CopyAddress.php
---
> [!success] Estado
> Base backend implementada: migration, model, factories, relacionamentos, validação dos campos obrigatórios, Activity Log e cópia histórica. CEP obrigatório com PT-BR Validator e consulta com revisão estão implementados nos formulários de campus. Integrações restantes e a formalização continuam pendentes.

## Contrato implementado

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador interno. |
| `city_id` | `bigint` | não | `FK`, índice | Referencia `cities.id`; exclusão `RESTRICT`. A UF é obtida da cidade. |
| `street` | `varchar(255)` | não | — | Rua ou logradouro obrigatório. |
| `number` | `varchar(255)` | não | — | Número textual obrigatório; aceita `123 A`, `0` e `s/n`. |
| `neighborhood` | `varchar(255)` | não | — | Bairro obrigatório. |
| `zip_code` | `varchar(255)` | não | — | Obrigatório; validado com PT-BR Validator e persistido somente com oito dígitos, preservando zeros à esquerda. |
| `created_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel; preenchido pelo Eloquent no timezone institucional. |
| `updated_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel; atualizado pelo Eloquent. |

A migration usa `$table->timestamps()`, com a nulabilidade padrão do Laravel. O Eloquent converte esses campos automaticamente em datas, sem casts explícitos no model. Inserções diretas que não passem pelo Eloquent podem deixar os timestamps nulos. O `down()` remove a tabela. A obrigatoriedade de CEP foi incluída na migration original, sem nova migration; bancos já migrados não recebem essa mudança de schema automaticamente.

A cidade é obrigatória e selecionada no [catálogo local](doc:migration-01a-cities), criado antes desta tabela. Não há `complement`, UF duplicada, tabela de snapshots, `copied_from_address_id` ou campos de autoria. A tabela não usa `SoftDeletes` nem Scout/Searchable; o endereço é removido fisicamente quando seu proprietário é excluído e não há outras referências.

## Propriedade dos endereços

`addresses` centraliza as colunas de endereço, mas suas linhas não são compartilhadas. Cada linha pode pertencer a no máximo um registro proprietário, seja em `user_personal_data`, `campuses`, `granting_parties` ou nos futuros endereços históricos de `internships`. Isso vale também para dois registros da mesma tabela: conteúdo idêntico recebe IDs diferentes. Um novo proprietário recebe uma nova linha, nunca o `address_id` já vinculado a outro registro. A cópia histórica cria outra linha na mesma tabela.

O schema atual contém FKs nos cadastros proprietários, mas ainda não impõe essa exclusividade entre todas as tabelas. Os futuros fluxos de integração devem respeitar a regra ao criar e trocar endereços; uma garantia no banco exige desenho próprio antes de ser declarada implementada.

Na gestão de campi, a edição atualiza a mesma linha de endereço e preserva seu ID. Antes da mudança, o controller verifica referências em campi, dados pessoais, concedentes e estágios; se encontrar outro proprietário ou uso histórico, rejeita a operação. A verificação é de aplicação, pois o schema não impõe exclusividade entre as FKs.

A exclusão Eloquent de Campus, Parte Concedente, dados pessoais e Estágio usa `HasOwnedAddresses` para remover fisicamente os endereços associados na mesma transação. Não há exclusão lógica ou restauração nesses cadastros. Referências de outro cadastro ou de estágio histórico preservam a linha; FKs `RESTRICT` impedem excluir diretamente um endereço ainda associado. Novas associações rejeitam IDs de endereços já removidos. SQL direto e cascatas exclusivas do banco não executam esses eventos.

## Model, validação e auditoria

`Address` declara os campos cadastrais com `#[Fillable]`, usa `HasFactory` e possui casts de `city_id` para inteiro e dos campos textuais para string. `Address::city()` é `BelongsTo`; `City::addresses()` é `HasMany`. As relações com modelos ainda inexistentes não foram adicionadas.

`AddressValidationRules` centraliza as regras aplicadas no evento `saving` do model: cidade existente, logradouro, número e bairro obrigatórios, todos com os limites do schema. O número é textual, sem restringir os valores ao formato numérico. A rota de campus valida o endereço aninhado em um Form Request e cria ou atualiza `Address` via Eloquent. Ainda não há endpoint genérico para gerenciar endereços.

O CEP é obrigatório no Model e nos Form Requests de campus. A validação usa obrigatoriamente `LaravelLegends\PtBrValidator\Rules\FormatoCep`. São aceitos oito dígitos ou as máscaras `00000-000` e `00.000-000`; `BrazilianAddressHelper::cepForValidation()` formata somente entradas compostas exatamente por oito dígitos antes da validação. Entradas inválidas não são limpas para se tornarem válidas. Após validar, o evento `saving` remove a máscara com `DigitsHelper::only()` e persiste oito dígitos em coluna textual, preservando zeros à esquerda. Essa regra cobre factories, cópias históricas e endereços preenchidos pela BrasilAPI. A exibição utiliza `BrazilianAddressHelper::formatCep()`.

O Activity Log registra a identificação do cadastro proprietário em `properties.address_context` quando disponível; eventos anteriores podem recuperar a associação pelo histórico imutável do cadastro. O Activity Log registra os campos cadastrais, somente quando há mudanças, sem registros vazios. A autoria vem do próprio mecanismo de auditoria. `AddressFactory` usa `CityFactory` para criar fixtures independentes de rede e da carga completa do catálogo.

## Cópia histórica implementada

`CopyAddress::handle(Address $address): Address` exige uma origem persistida, relê a linha dentro de uma transação com bloqueio compartilhado e cria outra linha em `addresses`. A cópia recebe novo ID e timestamps, não altera a origem e ignora mudanças ainda não salvas no objeto recebido. Cópias sucessivas são independentes.

Uma origem não persistida gera `InvalidArgumentException`; se a linha já foi removida, a releitura gera `ModelNotFoundException`. A criação da cópia também passa pelas regras do model e pelo Activity Log.

O fluxo de campus impede editar seu endereço quando uma referência de outro proprietário ou estágio aponta para a mesma linha. Não há bloqueio genérico de edição/exclusão de endereços históricos para os demais cadastros; essa proteção será implementada junto às futuras FKs e operações de formalização. A cópia existe, mas os outros fluxos ainda precisam integrar seu uso.

Na formalização futura, `internships.workplace_address_id` deverá apontar para uma cópia do endereço da concedente nesta mesma tabela. `internships.student_address_id` poderá apontar para a cópia do endereço do discente quando necessário. Essas linhas deverão ser preservadas sem alterações retroativas; a mudança do cadastro atual poderá criar outra linha e trocar sua FK.

## Consulta de CEP implementada

O botão **Buscar CEP** nos formulários de campus chama `BrasilApiCepLookup`, que valida com PT-BR Validator antes de consultar `https://brasilapi.com.br/api/cep/v1/{cep}` somente com dígitos. A configuração de URL é compartilhada com a consulta de CNPJ; conexão e resposta têm limites de 3 e 10 segundos. Carregamento e erros aparecem junto ao CEP. Falhas HTTP, CEP não encontrado, conexão indisponível ou resposta inválida preservam os dados e permitem preenchimento manual. Salvar não depende de consultar com sucesso.

A resposta abre um modal Flux com valores atuais e propostos; cancelar preserva o formulário. Após confirmação, logradouro e bairro retornados substituem os campos preenchidos, valores vazios não apagam os atuais e o número é mantido. A cidade é resolvida exclusivamente por nome normalizado e UF no catálogo local, ignorando diferenças de maiúsculas e acentos. Somente uma correspondência inequívoca pode ser selecionada; ausência ou ambiguidade limpa a seleção e exige escolha manual. A integração não cria cidades. Os dados permanecem editáveis e só são persistidos pelo envio normal do formulário. A proposta fica protegida por `#[Locked]`, não pode ser aplicada se o CEP mudar e as permissões e o estado do campus são revalidados em cada requisição.

## Validação antes da produção

Não há testes automatizados no repositório atualmente. Na preparação para produção, validar schema PostgreSQL, endereços, cidades e a guarda global de migrations conforme [Testes automatizados](doc:testes-existentes).

## Checklist

- [x] Definir cidade por FK para catálogo IBGE e CEP obrigatório.
- [x] Confirmar campos obrigatórios e usar o limite padrão de 255 caracteres para os campos textuais.
- [x] Criar migration reversível `create_addresses_table` com índice em `city_id` e FK `RESTRICT`.
- [x] Criar `Address`, `AddressFactory`, `CityFactory` e relacionamentos existentes.
- [x] Validar cidade, logradouro, bairro e número textual, incluindo `s/n`.
- [x] Usar timestamps nativos, sem casts explícitos de data.
- [x] Registrar alterações cadastrais no Activity Log, sem campos de autoria.
- [ ] Implementar e testar a cópia histórica na própria tabela.
- [ ] Testar schema, migrate, rollback e persistência em PostgreSQL.
- [x] Atualizar [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados).
- [x] Validar CEP obrigatoriamente com PT-BR Validator e armazenar somente oito dígitos.
- [x] Implementar consulta opcional de CEP nos formulários de campus, com revisão e resolução da cidade no catálogo local.
- [ ] Criar telas e endpoints de cadastro nas etapas correspondentes.
- [ ] Integrar cópias e impedir alteração/exclusão de linhas históricas ao implementar a formalização.

## Próximas dependências

- [user_personal_data](doc:migration-02-user-personal-data)
- [campuses](doc:migration-03-campuses)
- [granting_parties](doc:migration-12-granting-parties)
- [internships](doc:migration-15-internships)
