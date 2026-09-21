---
id: migration-02-user-personal-data
title: Migration 02 — user_personal_data
description: Contrato dos dados complementares do discente, separados da autenticação.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/dados-pessoais
related: migration-01-addresses, migration-19a-emancipation-evidences, backlog-e-decisoes, modelo-de-dados-acesso, cast-phonecast
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_20_085446_create_user_personal_data_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/UserPersonalData.php, https://github.com/sge-suite/sge/blob/master/app/Casts/PhoneCast.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/UserPersonalDataTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/PhoneCastTest.php
---
> [!success] Estado
> Implementada. Depende de `users` (migration base do Laravel) e [`addresses`](doc:migration-01-addresses).

## Contrato

| Campo        | Regra                                                 |
| ------------ | ----------------------------------------------------- |
| `id`         | bigint, chave primária.                               |
| `user_id`    | FK única para `users`; um perfil por conta.           |
| `rg`         | `varchar(255)`, nullable; exigido para discente quando a regra pedir. |
| `rg_issuer` | `varchar(255)`, nullable; obrigatório junto ao RG quando exigido. |
| `rg_issue_date` | `date`, nullable; obrigatório junto ao RG quando exigido. |
| `birth_date` | nullable; exigida quando a regra pedir.               |
| `phone`      | `varchar(255)`, nullable, validado e normalizado pelo `PhoneCast` com `celular_com_ddd`; aceita telefone fixo (8 dígitos) ou celular (9 dígitos), ambos com DDD, e é exigido para discente no envio da solicitação de estágio. |
| `emancipation_verified_at` | `timestamp(0)` nullable; preenchido somente após validação do Setor de Estágio. |
| `emancipation_verified_by_affiliation_id` | FK nullable para o vínculo que confirmou a prova; adicionada em alteração posterior a `affiliations`, para não criar dependência circular. |
| `address_id` | nullable, FK para `addresses` com exclusão `RESTRICT`. |
| timestamps   | obrigatórios.                                         |

CPF permanece em `users`, como identificador único e imutável da conta. Esta tabela só é criada e preenchida no futuro fluxo de vínculo discente; ela não altera cadastro, login ou perfil de conta nesta etapa. Dados atuais podem mudar, mas o estágio deve guardar snapshot histórico. A matrícula não pertence a esta tabela: ela é o `registration_number` do vínculo discente em `affiliations`.

`emancipation_verified_at` conserva a decisão positiva já dada pelo Setor; não é um booleano editável pelo discente. A evidência e todo o histórico de envios ficam em [`emancipation_evidences`](doc:migration-19a-emancipation-evidences), não em uma string solta deste perfil. Na abertura, a opção `emancipated_minor` permite enviar o comprovante e dispensar temporariamente o responsável legal, mas cria pendência de análise manual. A cópia fica em área privada e não entra no `activity_log`, no e-mail ou em documentos gerados, conforme [D-018](doc:backlog-e-decisoes#d-018-emancipacao-exige-comprovacao-e-validacao-institucional).

## Checklist

- [x] Criar migration com FK única para `users` e exclusão em cascata.
- [x] Definir `address_id` com `RESTRICT` para impedir exclusão do endereço ainda referenciado.
- [x] Criar Model `UserPersonalData` e relação um-para-um em `User`.
- [x] Criar factory com pessoa completa e pessoa sem dados opcionais.
- [x] Normalizar e validar telefone pelo [`PhoneCast`](doc:cast-phonecast); validar RG, datas e endereço antes de persistir.
- [x] Criar testes de unicidade, perfil ausente, FKs, schema, migrate e rollback em PostgreSQL.
- [x] Manter CPF exclusivamente em `users`, sem alterar cadastro ou autenticação.
- [ ] Exigir e autorizar estes dados somente no futuro fluxo de vínculo discente e solicitação de estágio.
