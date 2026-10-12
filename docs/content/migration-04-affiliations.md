---
id: migration-04-affiliations
title: Migration 04 — affiliations
description: Fundação dos vínculos institucionais e do contexto de acesso.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/autorizacao
related: migration-03-campuses, migration-10-course-id-em-affiliations, enum-affiliationtype, migration-09-courses, modelo-de-dados-acesso, fase-02-conta-e-contexto
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_22_105745_create_affiliations_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Affiliation.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/AffiliationValidationRules.php, https://github.com/sge-suite/sge/blob/master/database/factories/AffiliationFactory.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusActivityScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusEmailLogScope.php
---
> [!success] Estado
> Migration, Model, validação, factory, relações e Activity Log estão implementados. A migration depende de `users` e [`campuses`](doc:migration-03-campuses). O contrato foi verificado no PostgreSQL por Sail. A resolução do vínculo após o login, a sessão, a tela de seleção e a troca pelo menu do perfil estão implementadas na [Fase 02](doc:fase-02-conta-e-contexto).

## Schema PostgreSQL

| Campo | Tipo e regra |
| --- | --- |
| `id` | `bigint`, chave primária. |
| `user_id` | `bigint` obrigatório, FK para `users.id` com `ON DELETE RESTRICT`. |
| `campus_id` | `bigint` nullable, FK para `campuses.id` com `ON DELETE RESTRICT`. Nulo somente em vínculo de `SystemAdministrator`. |
| `type` | `varchar(255)`, convertido pelo cast PHP [`AffiliationType`](doc:enum-affiliationtype) e validado antes de persistir. |
| `registration_number` | `varchar(255)` nullable; obrigatório nos tipos diferentes de `Supervisor`. |
| `email` | `varchar(255)` obrigatório; e-mail de contato do contexto. |
| `deactivated_at` | `timestamp(0)` nullable; nulo significa vínculo ativo. |
| `last_used_at` | `timestamp(0)` nullable; último vínculo explicitamente selecionado. |
| `created_at`, `updated_at` | timestamps convencionais do Laravel. |

Esta migration inicial não contém `course_id` nem `deleted_at`. A ausência de curso aqui é intencional: a [Migration 10](doc:migration-10-course-id-em-affiliations), já implementada, adiciona a FK após a criação de `courses` na Migration 09. O schema final exige curso para vínculos de discente por validação do Model. `Affiliation` não usa `SoftDeletes`: o ciclo de vida do vínculo usa `deactivated_at`.

### FKs e índices

- A exclusão física de um usuário ou campus referenciado é restringida. A exclusão lógica de `Campus` não remove nem altera a FK.
- A migration cria somente a chave primária e as FKs; índices secundários ficam para quando as consultas reais indicarem necessidade.
- As regras de tipo, campus obrigatório, matrícula, titularidade do registro institucional e unicidade de matrícula discente são validadas pelo model em PHP. O cast de `AffiliationType` converte os valores para o enum e rejeita valores desconhecidos ao acessar o atributo.
- Matrículas de servidores podem se repetir entre funções ou campi somente para a mesma pessoa. Um registro institucional não pode pertencer a usuários diferentes, inclusive quando o vínculo existente estiver desativado. Não há unicidade global de e-mail ou da combinação usuário/tipo/campus.

## Model, relações e validação

`Affiliation` usa o cast `AffiliationType` e casts datetime para `deactivated_at` e `last_used_at`. As relações iniciais são `Affiliation → User`, `Affiliation → Campus`, `User → affiliations` e `Campus → affiliations`. A Migration 10 acrescenta `Affiliation → Course` e a relação inversa de discentes; a Migration 09 acrescenta as relações dos cursos com seus vínculos coordenadores.

`AffiliationValidationRules` é executado ao salvar e centraliza:

- enum válido, usuário existente, e-mail obrigatório válido e datas opcionais válidas;
- campus obrigatório por tipo, campus existente e campus ativo/não excluído ao criar, trocar campus ou reativar;
- preservação de vínculos existentes quando o campus é posteriormente desativado;
- matrícula obrigatória para tipos diferentes de supervisor, proibida para supervisor e única entre vínculos discentes;
- registro institucional sem espaços nas extremidades e pertencente à mesma pessoa em todos os vínculos que o utilizam, verificado na criação, na alteração da matrícula ou do titular e na reativação. Duplicidades antigas não são corrigidas automaticamente e não impedem a desativação de vínculos.

Uma pessoa pode ter vários vínculos, inclusive de tipos ou campi distintos. Na gestão administrativa, a criação e a reativação bloqueiam outro vínculo ativo da mesma pessoa, tipo e campus; a regra é aplicada na transação, sem limpar duplicidades históricas. O campus é um atributo do vínculo e não muda por seleção de contexto.

O scope `active()` filtra `deactivated_at IS NULL`. `orderByLastUsedAt()` ordena por `last_used_at DESC NULLS LAST` e desempata por `id ASC`, evitando a ordenação padrão de nulos do PostgreSQL.

## Último contexto usado

`last_used_at` é memória operacional do último vínculo selecionado ou usado numa troca explícita de contexto. `markAsUsed()` atualiza o timestamp somente quando chamado para um vínculo persistido e ativo. Leituras e requisições comuns não o atualizam.

O campo não é auditado pelo Activity Log e não representa login, logout ou trilha de autenticação. `ActiveAffiliationContext` restaura o vínculo ativo mais recentemente usado; vínculo desativado nunca é elegível. Se houver um único vínculo ativo, ele é selecionado automaticamente. Com múltiplos vínculos e nenhum uso anterior, a pessoa escolhe em `affiliations/select`, sem seleção baseada no desempate técnico. Somente a seleção ou troca explícita atualiza `last_used_at`.

## Factory e auditoria

`AffiliationFactory` fornece os estados `global()`, `onCampus()`, `server()`, `student()`, `supervisor()`, `deactivated()` e `recentlyUsed()`. Após a Migration 10, `student()` também cria ou recebe um curso do mesmo campus.

O Spatie Activity Log registra criação e alterações relevantes nos dados fillable, incluindo tipo, campus, matrícula, e-mail e desativação/reativação. `last_used_at` não é fillable nem auditado; uma alteração isolada não cria atividade.

Na auditoria compartilhada, o Administrador do Sistema pode ver atividades de vínculos dos tipos Administrador do Sistema e Setor de Estágio. O Setor consulta vínculos locais de todos os tipos exceto Administrador do Sistema, conforme o campus do vínculo ativo selecionado. O histórico preserva o escopo de vínculos excluídos por meio dos campos registrados, inclusive quando uma atualização registrou somente campos modificados. Referências a usuário, campus e curso mostram identificação atual junto do ID quando disponíveis e autorizadas. A seleção ou troca de vínculo atualiza apenas a memória operacional de `last_used_at` e não é registrada como atividade. O histórico de e-mails mantém um snapshot separado do contexto afetado em `email_delivery_attempts.scope_context`; esse campo não guarda a seleção de vínculo nem depende da permanência do vínculo no banco.

## Validação antes da produção

Não há testes automatizados no repositório atualmente. Na preparação para produção, validar as regras de vínculo e escopo conforme [Testes automatizados](doc:testes-existentes).


## Dependências

- [`AffiliationType`](doc:enum-affiliationtype)
- [`campuses`](doc:migration-03-campuses)
- [`courses`](doc:migration-09-courses)
- [`course_id` em affiliations](doc:migration-10-course-id-em-affiliations)
- [Modelo de acesso](doc:modelo-de-dados-acesso)

## Gestão pelo Setor de Estágio

As telas compartilhadas de Usuários permitem cadastrar, consultar e editar vínculos de todos os tipos exceto Administrador do Sistema no campus ativo selecionado. O cadastro associa curso somente ao discente e nunca solicita matrícula de supervisor. Nome, CPF e login de contas existentes permanecem; dados profissionais opcionais de supervisor ficam no perfil compartilhado. A edição do vínculo mantém tipo, campus e curso; matrícula discente permanece única e matrícula de servidor preserva titularidade.

Setor e Administrador não podem desativar nem excluir vínculos da própria conta. Desativação e exclusão de outros vínculos autorizados exigem senha atual e confirmação. A exclusão é física, sem SoftDeletes, e só ocorre sem referências de cursos, solicitações, estágios, avaliações, templates, envios, notificações ou anexos. O perfil pessoal pertence à conta e permanece. Registros do Activity Log não impedem a exclusão e conservam os IDs e alterações históricos mesmo sem o vínculo existente.
