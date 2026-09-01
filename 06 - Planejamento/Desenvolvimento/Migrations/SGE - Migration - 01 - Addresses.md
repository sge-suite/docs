---
title: SGE — Migration 01 — addresses
description: Contrato da tabela reutilizável de endereços atuais.
type: migration-reference
status: planned
order: 1
table: addresses
tags:
  - sge/migrations
  - sge/banco-de-dados
  - sge/endereco
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
- [ ] Atualizar [[SGE - Domínio e modelo de dados]].

## Próximas dependências

- [[SGE - Migration - 02 - User personal data|user_personal_data]]
- [[SGE - Migration - 03 - Campuses|campuses]]
- [[SGE - Migration - 12 - Granting parties|granting_parties]]
