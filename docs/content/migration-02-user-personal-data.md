---
id: migration-02-user-personal-data
title: Migration 02 — user_personal_data
description: Dados pessoais atuais e qualificações do supervisor, separados da autenticação.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/dados-pessoais
related: migration-01-addresses, migration-12a-supervisor-registration-requests, migration-19a-emancipation-evidences, enum-educationlevel, enum-supervisorqualificationtype, backlog-e-decisoes, modelo-de-dados-acesso, cast-phonecast
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_20_085446_create_user_personal_data_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/UserPersonalData.php, https://github.com/sge-suite/sge/blob/master/app/Models/SupervisorQualification.php, https://github.com/sge-suite/sge/blob/master/app/Enums/EducationLevel.php, https://github.com/sge-suite/sge/blob/master/app/Enums/SupervisorQualificationType.php, https://github.com/sge-suite/sge/blob/master/app/Casts/PhoneCast.php
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
| `phone`      | `varchar(255)`, nullable, validado e normalizado pelo `PhoneCast` com `celular_com_ddd`; contato atual compartilhado pela conta, exigido para discente no envio da solicitação de estágio. |
| `job_role` | `varchar(255)` nullable; cargo ou função atual do supervisor, compartilhado pela conta. |
| `emancipation_verified_at` | `timestamp(0)` nullable; preenchido somente após validação do Setor de Estágio. |
| `emancipation_verified_by_affiliation_id` | FK nullable para o vínculo que confirmou a prova; adicionada pela Migration 19A, depois de `affiliations`, para não criar dependência circular. |
| `address_id` | nullable, FK para `addresses` com exclusão `RESTRICT`. |
| timestamps   | obrigatórios.                                         |

A migration original cria `user_personal_data` e `supervisor_qualifications`. CPF permanece em `users` como identificador único da conta. O Administrador do Sistema e o Setor de Estágio autorizado podem corrigir o CPF pela área Usuários, com validação e unicidade. O Setor opera contas locais e pode corrigir a própria conta; não altera dados de acesso de outros administradores. As configurações pessoais comuns não oferecem edição de CPF. Esta tabela guarda um perfil por usuário (`user_id` único), compartilhado entre seus vínculos; não há perfil separado por vínculo. A conta pode existir sem esta linha. A criação do usuário supervisor não exige os dados profissionais. O Setor pode informar ou editar o cargo/função e as qualificações no vínculo local; a configuração própria do Supervisor também permite manter essas informações. O cargo/função fica no perfil compartilhado. As qualificações ficam em `supervisor_qualifications`, com várias linhas por pessoa e valores do ramo não escolhido nulos. Dados atuais podem mudar, mas o estágio guarda snapshot da qualificação escolhida na formalização. A matrícula não pertence a esta tabela: ela é o `registration_number` dos vínculos que exigem matrícula em `affiliations`; supervisor não possui esse campo.

A autorização de edição própria é por tipo de vínculo ativo selecionado: dados de RG, nascimento e endereço no contexto discente; cargo/função e qualificações no contexto de supervisor. O telefone é contato compartilhado. A edição administrativa do cargo/função e das qualificações pelo Setor está implementada na gestão de vínculos locais. A edição pela própria pessoa está implementada em **Configurações → Dados pessoais**, com Policy, Form Request e Action transacional. O telefone pode ser alterado nos dois contextos e permanece compartilhado. Identidade, vínculo e posse são revalidados no servidor; campos de outro contexto e campos internos são recusados. Omissão preserva valores e vazio explícito limpa opcionais, respeitando o conjunto do RG. Perfil ausente é criado somente ao informar dados. O endereço do Discente reutiliza os campos e a consulta por CEP com revisão dos formulários de Campus e Concedente, sem persistir antes do envio do formulário. Campus inativo mantém o acesso a esta configuração. A abertura exige dados pessoais completos no envio; o rascunho pode ser salvo incompleto.

Cada linha de `supervisor_qualifications` representa uma formação acadêmica ou uma experiência profissional. O perfil pode guardar várias de cada tipo, sem escolher um ramo global. Na abertura, o pedido de supervisor não cadastrado contém uma única proposta; para supervisor existente, o Setor escolhe a qualificação adequada ao estágio no aceite. A qualificação selecionada é copiada para `supervisor_snapshot`; mudanças posteriores no perfil não alteram estágios nem avaliações, e não há sincronização automática.

[`EducationLevel`](doc:enum-educationlevel) define os cinco níveis de formação; `undergraduate` é exibido como “Graduação”. [`SupervisorQualificationType`](doc:enum-supervisorqualificationtype) distingue `academic` de `professional`. A tabela de qualificações está descrita abaixo.

`emancipation_verified_at` conserva a decisão positiva já dada pelo Setor; não é um booleano editável pelo discente. A evidência e todo o histórico de envios ficam em [`emancipation_evidences`](doc:migration-19a-emancipation-evidences), não em uma string solta deste perfil. Na abertura, a opção `emancipated_minor` permite enviar o comprovante e dispensar temporariamente o responsável legal, mas cria pendência de análise manual. A cópia fica em área privada e não entra no `activity_log`, no e-mail ou em documentos gerados, conforme [D-018](doc:backlog-e-decisoes#d-018-emancipacao-exige-comprovacao-e-validacao-institucional).

> [!info] Atualização do schema
> A Migration 02 original foi editada diretamente para criar também `supervisor_qualifications`; a Migration 12A original mantém os campos da proposta única de supervisor. Não foi criada migration incremental para essas alterações. Bancos com o schema anterior precisam ser recriados ou alinhados antes de usar o código novo.

## `supervisor_qualifications`

A mesma migration cria a tabela um-para-muitos das qualificações do supervisor:

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `user_id` | FK para `users`, com exclusão em cascata; uma pessoa pode manter várias qualificações. |
| `type` | enum PHP [`SupervisorQualificationType`](doc:enum-supervisorqualificationtype), persistido em string: `academic` ou `professional`. |
| `training_course`, `education_level` | dados do ramo acadêmico; `education_level` usa [`EducationLevel`](doc:enum-educationlevel). |
| `experience_area`, `experience_time` | área e tempo de experiência do ramo profissional. |
| timestamps | datas de criação e atualização. |

O Model valida exatamente o ramo indicado em `type` e limpa os campos do ramo oposto. Há índice em (`user_id`, `type`), sem unicidade por tipo. O registro também usa Activity Log. A Migration 02 foi editada diretamente para criar a tabela; bancos que ainda não possuem esse esquema devem aplicar a criação original atualizada.

## Checklist

- [x] Criar migration com FK única para `users` e exclusão em cascata.
- [x] Definir `address_id` com `RESTRICT` para impedir exclusão do endereço ainda referenciado.
- [x] Criar Model `UserPersonalData` e relação um-para-um em `User`.
- [x] Criar factory com pessoa completa e pessoa sem dados opcionais.
- [x] Normalizar e validar telefone pelo [`PhoneCast`](doc:cast-phonecast); validar RG, datas e endereço antes de persistir.
- [ ] Criar testes de unicidade, perfil ausente, FKs, schema, migrate e rollback em PostgreSQL.
- [x] Manter cargo/função no perfil compartilhado e criar `supervisor_qualifications` para múltiplas formações e experiências.
- [x] Validar cada qualificação segundo `SupervisorQualificationType` e `EducationLevel`, com atualização administrativa e própria.
- [ ] Validar os campos profissionais em suíte automatizada persistente; não foram criados nem executados testes Pest nesta entrega.
- [x] Manter CPF exclusivamente em `users`, sem alterar cadastro ou autenticação.
- [x] Autorizar os campos pertinentes na configuração própria de Discente e Supervisor e preservar o perfil compartilhado.
- [x] Exigir os dados pessoais completos ao enviar a solicitação de estágio e congelar os dados pertinentes nos snapshots.

A exclusão de um vínculo mantém a conta e o perfil compartilhado; a existência do perfil por `user_id` não impede excluir um vínculo sem referências. A FK com cascata pertence à exclusão da conta, não à exclusão de um vínculo.
