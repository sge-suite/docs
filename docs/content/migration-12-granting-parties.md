---
id: migration-12-granting-parties
title: Migration 12 — granting_parties
description: Contrato das partes concedentes reutilizáveis e seu endereço atual.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/concedente, sge/banco-de-dados
related: migration-01-addresses, enum-partydocumenttype
source_refs:
---
> [!todo] Estado
> Planejada. Depende de [`addresses`](doc:migration-01-addresses) e [`PartyDocumentType`](doc:enum-partydocumenttype).

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da concedente/unidade. |
| `document_type` | `varchar(16)` | não | — | `cpf` ou `cnpj`, validado por [`PartyDocumentType`](doc:enum-partydocumenttype). |
| `document_number` | `varchar(14)` | não | índice composto | Documento normalizado, sem pontuação. |
| `name` | `varchar(255)` | não | — | Nome completo ou razão social. |
| `address_id` | `bigint` | sim | `FK`, `RESTRICT` | Endereço atual; a relação é removida explicitamente antes de excluir a linha de endereço. |
| `representative_name` | `varchar(255)` | sim | — | Nome do representante atual. |
| `representative_role` | `varchar(120)` | sim | — | Cargo do representante atual. |
| `phone` | `varchar(20)` | sim | — | Telefone atual normalizado. |
| `email` | `varchar(254)` | sim | — | E-mail atual. |
| `field_of_activity` | `varchar(255)` | sim | — | Área de atuação. |
| `professional_council` | `varchar(120)` | sim | — | Conselho profissional, quando aplicável. |
| `council_registration_number` | `varchar(64)` | sim | — | Registro no conselho, quando aplicável. |
| `credentialing_process_number` | `varchar(100)` | sim | — | Processo de credenciamento, quando aplicável. |
| `created_at` | `timestamp(0)` | não | — | Auditoria. |
| `updated_at` | `timestamp(0)` | não | — | Auditoria. |
| `deleted_at` | `timestamp(0)` | sim | índice | Exclusão lógica sem apagar histórico. |

Não exigir unicidade global de CNPJ: unidades distintas podem compartilhar o documento. Nome, unidade e endereço diferenciam os registros. Para ser selecionada na solicitação de estágio, a parte concedente precisa estar cadastrada; não é exigido convênio ou termo prévio como regra de validação. Quando houver, o número do processo de credenciamento preenche o campo correspondente do documento. O estágio guardará FK e snapshot.

Os campos de endereço continuam em `addresses`, e não são repetidos nesta tabela. A FK usa `RESTRICT`: uma regra de `SET NULL` condicional ao uso do cadastro não pode ser representada pela FK. Ao atualizar o endereço atual, a aplicação cria ou seleciona a nova linha e troca `address_id`; a remoção física só é elegível depois que nenhuma relação a referenciar. Ao criar um estágio, o sistema copia o endereço apontado por `address_id` para uma nova linha de `addresses`; o estágio guarda essa nova FK em `workplace_address_id`. Telefone, representante, conselho e processo continuam sendo dados atuais da concedente e entram no snapshot do estágio somente no aceite.

## Checklist

- [ ] Confirmar se a unidade precisa de coluna própria ou faz parte de `name`.
- [ ] Criar migration e cast de `PartyDocumentType` no Model.
- [ ] Definir índice de busca sem impor unicidade indevida.
- [ ] Criar factory para CPF, CNPJ e unidades distintas.
- [ ] Validar documento e normalização.
- [ ] Criar solicitação de cadastro para análise do Setor de Estágio.
- [x] Definir que o cadastro é suficiente para validar a parte concedente no formulário de estágio.
- [x] Definir número de processo como dado simples de credenciamento.
- [ ] Testar endereço alterado e snapshot no estágio.
- [ ] Testar migrate/rollback na ordem completa.
