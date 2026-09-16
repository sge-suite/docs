---
id: migration-03-campuses
title: Migration 03 — campuses
description: Contrato da tabela de campi e do representante legal por vínculo.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/campus
related: migration-01-addresses, migration-04-affiliations, enum-affiliationtype
source_refs:
---
> [!todo] Estado
> Planejada. Depende de [`addresses`](doc:migration-01-addresses). A FK do representante aponta para `affiliations` e deve ser criada depois, ou como FK adicionada em uma migration posterior.

## Contrato

| Campo                                 | Regra                                        |
| ------------------------------------- | -------------------------------------------- |
| `id`                                  | bigint, chave primária.                      |
| `name`                                | nome institucional completo, obrigatório.    |
| `cnpj`                                | nullable, normalizado e sem formatação.      |
| `phone`                              | `varchar(20)`, nullable e normalizado.       |
| `email`                              | `varchar(254)`, nullable.                    |
| `address_id`                          | FK obrigatória para endereço atual.          |
| `legal_representative_affiliation_id` | nullable; vínculo da pessoa representante.   |
| `internship_office_signatory_affiliation_id` | nullable; vínculo usado como responsável institucional nos documentos. |
| `insurance_company_name`             | `varchar(255)`, nullable no cadastro inicial; obrigatório se o template citar o seguro. |
| `insurance_policy_number`            | `varchar(100)`, nullable no cadastro inicial; obrigatório se o template citar o seguro. |
| `deactivated_at`                      | nullable; bloqueia novos cadastros/vínculos. |
| timestamps / `deleted_at`             | auditoria e exclusão lógica.                 |

Não criar `code`. O campus é delimitado pelo vínculo ativo e o ciclo de ativação pertence ao Administrador do Sistema. As duas FKs de signatário são adicionadas depois de `affiliations` para evitar ciclo. A geração congela nomes, cargos, seguro e endereço no snapshot documental; alterar o campus não reescreve documento anterior.

## Checklist

- [ ] Criar migration `create_campuses_table` sem FK circular prematura.
- [ ] Criar migration complementar para `legal_representative_affiliation_id` após `affiliations`, se necessário.
- [ ] Criar Model `Campus`, factory e SoftDeletes quando aplicável.
- [ ] Normalizar e validar CNPJ.
- [ ] Validar signatários ativos no próprio campus e configuração de seguro exigida pelo template.
- [ ] Implementar ativação/desativação e escopo por campus.
- [ ] Registrar alterações no Activity Log.
- [ ] Testar campus ativo, desativado, endereço alterado e representante inválido.
- [ ] Testar migrate/rollback na ordem completa.

## Dependências

- [addresses](doc:migration-01-addresses)
- [affiliations](doc:migration-04-affiliations)
- [AffiliationType](doc:enum-affiliationtype)
