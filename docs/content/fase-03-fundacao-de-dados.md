---
id: fase-03-fundacao-de-dados
title: Fase 03 — Fundação de dados
description: Checklist da fundação de dados, enums, migrations, modelos e catálogos básicos.
type: development-phase
status: completed
visibility: public
tags: sge/desenvolvimento, sge/banco-de-dados, sge/checklist
related: migrations, enums, migration-base-01-users, migration-base-02-cache, migration-base-03-jobs, migration-base-04-activity-log, migration-base-05-media, enum-affiliationtype, enum-brazilianstate, migration-01a-cities, migration-01-addresses, migration-02-user-personal-data, migration-03-campuses, migration-04-affiliations, migration-09-courses, migration-10-course-id-em-affiliations, migration-11-internship-types, migration-12-granting-parties, migration-22-holidays, migration-22-internship-calendar-overrides, casts, helpers, concerns, testes-existentes, fase-04-conta-e-contexto
source_refs:
---
> [!info] Ordem
> Execute as migrations na ordem do [índice de migrations](doc:migrations). Cada enum tem seu próprio checklist no [índice de enums](doc:enums).

## Base já existente

- [x] [Migration base de usuários](doc:migration-base-01-users).
- [x] [Migration base de cache](doc:migration-base-02-cache).
- [x] [Migration base de filas](doc:migration-base-03-jobs).
- [x] [Migration base de auditoria](doc:migration-base-04-activity-log).
- [x] [Migration base de mídia](doc:migration-base-05-media).
- [x] Decidir que não haverá migration de permissões; autorização será por vínculos, Gates e Policies.

> [!info] Escopo concluído
> A fundação de schema, Models, relações, factories e testes PostgreSQL das migrations implementadas está concluída. Policies, integração de Activity Log, Jobs e fluxos de tela continuam nas fases próprias.

## Dados cadastrais

- [x] Criar e testar as classes dos enums estáveis; a integração com Models, migrations e fluxos continua nas etapas específicas.
- [x] Concluir [`cities`](doc:migration-01a-cities), executar `php artisan cities:fetch` quando necessário e carregar o catálogo com `CitySeeder` sem rede.
- [x] Implementar a base backend de [`addresses`](doc:migration-01-addresses), incluindo cópia histórica.
- [ ] Implementar consulta de CEP no futuro fluxo de cadastro; endereço segue o contrato atual sem validação de formato do CEP.
- [x] Concluir [`user_personal_data`](doc:migration-02-user-personal-data).
- [x] Concluir [`campuses`](doc:migration-03-campuses).
- [x] Concluir [`affiliations`](doc:migration-04-affiliations).
- [x] Concluir [`courses`](doc:migration-09-courses).
- [x] Concluir [`course_id` em affiliations](doc:migration-10-course-id-em-affiliations).
- [x] Concluir [`internship_types`](doc:migration-11-internship-types).
- [x] Concluir [`granting_parties`](doc:migration-12-granting-parties).
- [x] Concluir [`holidays`](doc:migration-22-holidays).
- [x] Concluir exceções por estágio em [`internship_calendar_overrides`](doc:migration-22-internship-calendar-overrides).

## Regras de dados

- [x] Preservar linhas de endereço usadas historicamente; alterações criam nova linha quando necessário.
- [x] Garantir CPF único e normalizado na conta.
- [ ] Impedir alteração do CPF em futuros fluxos de configuração da conta; pertence à [Fase 04](doc:fase-04-conta-e-contexto).
- [x] Normalizar CPF, CNPJ, UF e e-mails pelos casts e validações aplicáveis; CEP não tem validação de formato.
- [x] Permitir múltiplos vínculos por pessoa sem trocar campus dentro do vínculo.
- [x] Exigir curso em vínculo discente e respeitar escopo do campus.
- [x] Congelar regras do tipo de estágio por FK e snapshot no estágio.
- [x] Criar factories e testes para cenários completos, incompletos, ativos e desativados.

## Componentes que sustentam a fundação

- [x] Confirmar [casts](doc:casts) nos Models corretos.
- [x] Usar [helpers](doc:helpers) somente para formatação/normalização, sem regra de autorização.
- [x] Reutilizar [concerns](doc:concerns) para validações compartilhadas.
- [x] Criar testes PostgreSQL para as migrations e Models; lacunas de autorização e fluxos estão mapeadas em [testes existentes](doc:testes-existentes).

## Critério de saída

- [x] As migrations implementadas passam na suíte PostgreSQL e seus Models, relações, casts, índices e validações têm testes.

## Próxima fase

[Fase 10 — Activity Log e backend transversal](doc:fase-10-servicos-transversais)
