---
id: migration-03-campuses
title: Migration 03 — campuses
description: Contrato da tabela de campi e do representante legal por vínculo.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/campus
related: migration-01-addresses, migration-04-affiliations, enum-affiliationtype
source_refs:
---
> [!success] Estado
> Implementada com dependência obrigatória de [`addresses`](doc:migration-01-addresses). As FKs dos dois signatários continuam pendentes para uma migration posterior a [`affiliations`](doc:migration-04-affiliations), evitando o ciclo.

## Contrato

| Campo                                 | Regra                                        |
| ------------------------------------- | -------------------------------------------- |
| `id`                                  | bigint, chave primária.                      |
| `name`                                | nome institucional completo, obrigatório.    |
| `cnpj`                                | `char(14)`, nullable, normalizado e sem formatação. |
| `phone`                              | `varchar(20)`, nullable e normalizado.       |
| `email`                              | `varchar(254)`, nullable.                    |
| `address_id`                          | FK obrigatória para endereço atual.          |
| `legal_representative_affiliation_id` | bigint nullable e indexado; vínculo da pessoa representante. A FK entra após `affiliations`. |
| `internship_office_signatory_affiliation_id` | bigint nullable e indexado; vínculo usado como responsável institucional nos documentos. A FK entra após `affiliations`. |
| `insurance_company_name`             | `varchar(255)`, nullable no cadastro inicial; obrigatório se o template citar o seguro. |
| `insurance_policy_number`            | `varchar(100)`, nullable no cadastro inicial; obrigatório se o template citar o seguro. |
| `deactivated_at`                      | `timestamp(0)` nullable e indexado; bloqueia novos cadastros/vínculos. |
| timestamps / `deleted_at`             | `timestamp(0)` para auditoria e exclusão lógica. |

Não criar `code`. O campus é delimitado pelo vínculo ativo e o ciclo de ativação pertence ao Administrador do Sistema. As duas FKs de signatário são adicionadas depois de `affiliations` para evitar ciclo. A geração congela nomes, cargos, seguro e endereço no snapshot documental; alterar o campus não reescreve documento anterior.

## Implementação atual

`Campus` usa `SoftDeletes`, registra alterações cadastrais no Activity Log e expõe o escopo `active()` para registros sem `deactivated_at`. O endereço atual é obrigatório (`belongsTo`/`hasMany`) e sua exclusão é `RESTRICT`, inclusive enquanto o campus estiver apenas excluído logicamente. O CNPJ é normalizado para 14 dígitos e validado com `laravellegends/pt-br-validator`; o telefone reutiliza `PhoneCast`, aceitando telefone fixo ou celular com DDD e persistindo somente os dígitos.

`CampusFactory` cobre o cadastro inicial sem seguro, o estado `withInsurance()` e o estado `deactivated()`. A configuração de seguro exigida por um template e a validação de signatários ativos do próprio campus permanecem para as migrations e serviços que criarão `affiliations` e templates.

`tests/Feature/CampusTest.php` e `tests/Unit/CnpjCastTest.php` cobrem schema PostgreSQL, índices, FK `RESTRICT`, nulabilidade, ausência de FK circular, rollback/reaplicação, casts, validações, relações, desativação, exclusão lógica e Activity Log. A execução direcionada passou com 26 testes e 161 assertions.

## Checklist

- [x] Criar migration `create_campuses_table` sem FK circular prematura.
- [ ] Criar migration complementar para `legal_representative_affiliation_id` após `affiliations`, se necessário.
- [x] Criar Model `Campus`, factory e SoftDeletes.
- [x] Normalizar e validar CNPJ e telefone.
- [ ] Validar signatários ativos no próprio campus e configuração de seguro exigida pelo template.
- [x] Implementar escopo de campus ativo, desativação e exclusão lógica; a autorização do Administrador do Sistema entra no fluxo administrativo.
- [x] Registrar alterações cadastrais no Activity Log.
- [x] Testar campus ativo, desativado, endereço obrigatório, representante ainda sem FK e seguro opcional.
- [x] Testar migrate/rollback e reaplicação da migration.

## Dependências

- [addresses](doc:migration-01-addresses)
- [affiliations](doc:migration-04-affiliations)
- [AffiliationType](doc:enum-affiliationtype)
