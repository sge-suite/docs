---
id: migration-12-granting-parties
title: Migration 12 — granting_parties
description: Cadastro de partes concedentes por campus, com dados cadastrais e credenciamento.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/concedente, sge/banco-de-dados
related: migration-01-addresses, enum-partydocumenttype
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_152827_create_granting_parties_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/GrantingParty.php, https://github.com/sge-suite/sge/blob/master/database/factories/GrantingPartyFactory.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/GrantingPartyTest.php
---
> [!info] Estado
> O cadastro e seu escopo por campus estão implementados na migration, no Model, na factory, nas validações e nos testes PostgreSQL. Os fluxos de interface, autorização e aprovação de solicitações continuam planejados.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da concedente/unidade. |
| `campus_id` | `bigint` | não | `FK` para `campuses.id`, `RESTRICT`, índice | Campus proprietário do cadastro. |
| `document_type` | `varchar(255)` | não | — | `cpf` ou `cnpj`, validado por [`PartyDocumentType`](doc:enum-partydocumenttype). |
| `document_number` | `varchar(255)` | não | — | Documento normalizado, sem pontuação; CPF/CNPJ validado em PHP. |
| `name` | `varchar(255)` | não | — | Nome completo ou razão social. |
| `address_id` | `bigint` | não | `FK`, `RESTRICT` | Endereço atual obrigatório; trocar a FK antes de excluir a linha antiga. |
| `representative_name` | `varchar(255)` | não | — | Nome do representante atual. |
| `representative_role` | `varchar(255)` | não | — | Cargo do representante atual. |
| `phone` | `varchar(255)` | sim | — | Telefone atual com DDD; aceita máscara ou somente dígitos e armazena apenas dígitos pelo `PhoneCast`. |
| `email` | `varchar(255)` | sim | — | E-mail atual. |
| `field_of_activity` | `varchar(255)` | não | — | Área de atuação. |
| `professional_council` | `varchar(255)` | sim | — | Conselho profissional, quando aplicável. |
| `council_registration_number` | `varchar(255)` | sim | — | Registro no conselho, quando aplicável. |
| `credentialing_process_number` | `varchar(255)` | sim | — | Processo de credenciamento, quando aplicável. |
| `created_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel, preenchido pelo Eloquent. |
| `updated_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel, atualizado pelo Eloquent. |
| `deleted_at` | `timestamp(0)` | sim | — | Exclusão lógica sem apagar histórico. |

Cada linha de `granting_parties` pertence a um campus por meio de `campus_id` (FK obrigatória com exclusão restrita e índice). Esse escopo não será alterado na edição comum; para usar a mesma organização ou pessoa em outro campus, será criado outro cadastro local. Os cadastros serão separados por campus, mesmo quando uma empresa exigir o CNPJ da matriz para uma filial ou várias escolas estaduais compartilharem o mesmo CNPJ. O CPF também poderá aparecer em cadastros de campi diferentes; dados de conselho, credenciamento, contatos e endereço ficam no cadastro local e não são compartilhados automaticamente. Não criar unicidade global nem por campus para `document_number`; CPF/CNPJ identificam o documento informado, mas não distinguem necessariamente a unidade operacional. O CPF da parte concedente é independente de `users.cpf` e não deve mesclar contas de usuário. Para ser selecionada na solicitação de estágio, a concedente precisa estar cadastrada para o campus do estágio. Quando houver, o número do processo de credenciamento preenche o campo correspondente do documento. O estágio guardará FK e snapshot.

`name` contém o nome completo da concedente ou unidade. O único índice secundário é o de `campus_id`, sem unicidade por documento. O Model valida o campus, impede a transferência do cadastro para outro campus e registra alterações no Activity Log. A validação também exige que a concedente usada por uma solicitação de estágio ou estágio pertença ao campus do vínculo discente ou curso. `document_type` usa o cast de `PartyDocumentType` e `document_number` é normalizado e validado no evento `saving` com os casts existentes `CpfCast` e `CnpjCast`, de acordo com o tipo. `PhoneCast` aceita telefone brasileiro fixo ou celular com DDD, com máscara ou somente dígitos; valida e armazena apenas dígitos, convertendo telefone vazio em `null`. O model também valida os limites dos campos opcionais e registra alterações cadastrais no Activity Log.

As colunas textuais usam `$table->string()` sem comprimento explícito (`varchar(255)` no PostgreSQL). Os limites de domínio, incluindo os tamanhos de CPF e CNPJ, são aplicados em PHP, sem constraints `CHECK` no banco. Endereço, representante e área de atuação são obrigatórios para a concedente. O CEP continua opcional na tabela de endereços.

Os campos de endereço continuam em `addresses`, e não são repetidos nesta tabela. A FK usa `RESTRICT`. Ao atualizar o endereço atual, a aplicação cria uma nova linha exclusiva da concedente e troca `address_id`; não seleciona uma linha já pertencente a outro cadastro, mesmo que os valores sejam iguais. A remoção física da linha anterior só é elegível depois que nenhuma relação a referenciar. Ao criar um estágio, o sistema copia o endereço apontado por `address_id` para uma nova linha de `addresses`; o estágio guarda essa nova FK em `workplace_address_id`. Telefone, representante, conselho e processo continuam sendo dados atuais da concedente e entram no snapshot do estágio somente no aceite.

## Checklist

- [x] Usar `name` para o nome completo da concedente/unidade nesta implementação.
- [x] Criar migration e cast de `PartyDocumentType` no Model.
- [x] Adicionar FK obrigatória `campus_id`, índice e validar o escopo por campus no cadastro e nos fluxos de estágio.
- [x] Preservar `document_number` sem unicidade global ou por campus.
- [ ] Definir índices adicionais de busca em etapa posterior, além do índice de campus, sem impor unicidade indevida.
- [x] Criar factory para CPF, CNPJ e unidades distintas.
- [x] Validar documento e normalização.
- [ ] Criar solicitação de cadastro para análise do Setor de Estágio.
- [x] Definir que o cadastro é suficiente para validar a parte concedente no formulário de estágio.
- [x] Definir número de processo como dado simples de credenciamento.
- [ ] Testar endereço alterado e snapshot no estágio.
- [x] Testar migrate/rollback da migration e restrições PostgreSQL.
