---
id: migration-02-user-personal-data
title: Migration 02 — user_personal_data
description: Dados pessoais e profissionais atuais da pessoa, separados da autenticação.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/dados-pessoais
related: migration-01-addresses, migration-12a-supervisor-registration-requests, migration-19a-emancipation-evidences, backlog-e-decisoes, modelo-de-dados-acesso, cast-phonecast
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_20_085446_create_user_personal_data_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/UserPersonalData.php, https://github.com/sge-suite/sge/blob/master/app/Casts/PhoneCast.php
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
| `job_role` | `varchar(255)` nullable; Cargo/Função que atua. |
| `training_course` | `varchar(255)` nullable; Curso de formação. |
| `education_level` | `varchar(255)` nullable; cast e validação pelo enum PHP `EducationLevel`. |
| `experience_time` | `varchar(255)` nullable; Tempo de experiência na função, em texto livre como no formulário atual. |
| `emancipation_verified_at` | `timestamp(0)` nullable; preenchido somente após validação do Setor de Estágio. |
| `emancipation_verified_by_affiliation_id` | FK nullable para o vínculo que confirmou a prova; adicionada pela Migration 19A, depois de `affiliations`, para não criar dependência circular. |
| `address_id` | nullable, FK para `addresses` com exclusão `RESTRICT`. |
| timestamps   | obrigatórios.                                         |

CPF permanece em `users` como identificador único da conta. O Administrador do Sistema e o Setor de Estágio autorizado podem corrigir o CPF pela área Usuários, com validação e unicidade. O Setor opera contas locais e pode corrigir a própria conta; não altera dados de acesso de outros administradores. As configurações pessoais comuns não oferecem edição de CPF. Esta tabela guarda um perfil por usuário (`user_id` único), compartilhado entre seus vínculos; não há perfil separado por vínculo. A conta pode existir sem esta linha. A criação do usuário supervisor não exige os dados profissionais. O Setor pode informá-los no cadastro e editá-los no vínculo local; a configuração própria do Supervisor permite preenchê-los ou confirmá-los. Campos profissionais omitidos no cadastro ou edição preservam o perfil existente; valores vazios enviados na edição podem limpar os campos opcionais. Os campos profissionais ficam nullable para esse cadastro inicial e para usuários que não têm vínculo de supervisor. Dados atuais podem mudar, mas o estágio deve guardar snapshot histórico. A matrícula não pertence a esta tabela: ela é o `registration_number` dos vínculos que exigem matrícula em `affiliations`; supervisor não possui esse campo.

A autorização de edição própria é por tipo de vínculo ativo selecionado: dados de RG, nascimento e endereço no contexto discente; cargo/função, curso de formação, nível e tempo de experiência na função no contexto de supervisor. O telefone é contato compartilhado. A edição administrativa dos campos profissionais pelo Setor está implementada na gestão de vínculos locais. A edição pela própria pessoa está implementada em **Configurações → Dados pessoais**, com Policy, Form Request e Action transacional. O telefone pode ser alterado nos dois contextos e permanece compartilhado. Identidade, vínculo e posse são revalidados no servidor; campos de outro contexto e campos internos são recusados. Omissão preserva valores e vazio explícito limpa opcionais, respeitando o conjunto do RG. Perfil ausente é criado somente ao informar dados. O endereço do Discente reutiliza os campos e a consulta por CEP com revisão dos formulários de Campus e Concedente, sem persistir antes do envio do formulário. Campus inativo mantém o acesso a esta configuração. A obrigatoriedade no envio de solicitação de estágio continua pertencendo ao futuro fluxo de domínio.

Os campos profissionais são apenas uma referência de preenchimento: o perfil pode guardar formação e experiência ao mesmo tempo, sem selecionar um ramo global. Na avaliação, o supervisor escolhe se tem formação na área daquele estagiário e confirma a cópia ou digita outros dados. A avaliação persiste respostas próprias; mudanças no perfil não alteram avaliações nem snapshots, e respostas da avaliação não sobrescrevem o perfil. Não existe sincronização automática.

`EducationLevel` usa os mesmos cinco níveis do formulário atual:

| Valor persistido | Rótulo |
| --- | --- |
| `secondary_technical` | Médio/Técnico |
| `undergraduate_technologist` | Graduação/Tecnólogo |
| `specialization` | Especialização |
| `masters` | Mestrado |
| `doctorate` | Doutorado |

`emancipation_verified_at` conserva a decisão positiva já dada pelo Setor; não é um booleano editável pelo discente. A evidência e todo o histórico de envios ficam em [`emancipation_evidences`](doc:migration-19a-emancipation-evidences), não em uma string solta deste perfil. Na abertura, a opção `emancipated_minor` permite enviar o comprovante e dispensar temporariamente o responsável legal, mas cria pendência de análise manual. A cópia fica em área privada e não entra no `activity_log`, no e-mail ou em documentos gerados, conforme [D-018](doc:backlog-e-decisoes#d-018-emancipacao-exige-comprovacao-e-validacao-institucional).

> [!info] Atualização do schema
> Os campos estruturados do supervisor foram ajustados diretamente nas migrations de criação de `user_personal_data` e `supervisor_registration_requests`, sem migration incremental. Editar esses arquivos não modifica tabelas de um banco já migrado: o schema existente precisa ser alinhado antes de usar o código novo. Nenhuma alteração foi aplicada ao banco persistente nesta entrega.

## Checklist

- [x] Criar migration com FK única para `users` e exclusão em cascata.
- [x] Definir `address_id` com `RESTRICT` para impedir exclusão do endereço ainda referenciado.
- [x] Criar Model `UserPersonalData` e relação um-para-um em `User`.
- [x] Criar factory com pessoa completa e pessoa sem dados opcionais.
- [x] Normalizar e validar telefone pelo [`PhoneCast`](doc:cast-phonecast); validar RG, datas e endereço antes de persistir.
- [ ] Criar testes de unicidade, perfil ausente, FKs, schema, migrate e rollback em PostgreSQL.
- [x] Estruturar curso de formação, nível (`EducationLevel`), cargo/função e tempo de experiência conforme o formulário atual; manter formação e experiência como referências independentes.
- [x] Acrescentar campos profissionais opcionais do supervisor, compartilhados por usuário, com validação administrativa e própria.
- [ ] Validar os campos profissionais em suíte automatizada persistente; não foram criados nem executados testes Pest nesta entrega.
- [x] Manter CPF exclusivamente em `users`, sem alterar cadastro ou autenticação.
- [x] Autorizar os campos pertinentes na configuração própria de Discente e Supervisor e preservar o perfil compartilhado.
- [ ] Exigir os dados obrigatórios nos futuros envios de solicitação de estágio e formulários de domínio.

A exclusão de um vínculo mantém a conta e o perfil compartilhado; a existência do perfil por `user_id` não impede excluir um vínculo sem referências. A FK com cascata pertence à exclusão da conta, não à exclusão de um vínculo.
