---
id: migration-01-addresses
title: Migration 01 — addresses
description: Contrato da tabela reutilizável de endereços atuais.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/endereco
related: dominio-e-modelo-de-dados, migration-02-user-personal-data, migration-03-campuses, migration-12-granting-parties
source_refs:
---
> [!todo] Estado
> Planejada. É a primeira tabela do domínio e não depende de outras migrations.

## Contrato

| Campo          | Regra                                       |
| -------------- | ------------------------------------------- |
| `id`           | bigint, chave primária.                     |
| `street`       | rua/logradouro, obrigatório.                |
| `number`       | string, obrigatório; aceita `s/n`.          |
| `neighborhood` | obrigatório.                                |
| `city`         | obrigatório.                                |
| `uf`           | char(2), obrigatório e normalizado.         |
| `zip_code`     | string, obrigatório e sem formatação.       |
| timestamps     | obrigatórios.                               |
| `deleted_at`   | nullable; exclusão lógica quando aplicável. |

Não criar `complement` agora. O endereço representa o cadastro atual; estágios e documentos preservam seus próprios snapshots. A normalização impede que rua, número, bairro, cidade, UF e CEP sejam repetidos em cada estágio.

## Checklist

- [ ] Confirmar campos e obrigatoriedade com a regra de endereço.
- [ ] Criar migration `create_addresses_table`.
- [ ] Definir índices úteis para busca sem indexar formatação.
- [ ] Criar Model `Address`, factory e cast de exclusão lógica se aplicável.
- [ ] Validar CEP, UF, número e valores `s/n`.
- [ ] Registrar alteração no Activity Log quando o endereço atual for editado.
- [ ] Testar migrate, rollback e banco limpo.
- [ ] Atualizar [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados).

## Próximas dependências

- [user_personal_data](doc:migration-02-user-personal-data)
- [campuses](doc:migration-03-campuses)
- [granting_parties](doc:migration-12-granting-parties)
