---
id: fase-03-fundacao-de-dados
title: Fase 03 — Fundação de dados
description: Checklist da fundação de dados, enums, migrations, modelos e catálogos básicos.
type: development-phase
status: planned
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

> [!warning] Implementado não significa encerrado
> As migrations base existem no código, mas suas integrações com o domínio, políticas de segurança, testes de schema e decisões de transição continuam sendo acompanhadas nas notas individuais.

## Dados cadastrais

- [x] Criar e testar as classes dos enums estáveis; a integração com Models, migrations e fluxos continua nas etapas específicas.
- [x] Concluir [`cities`](doc:migration-01a-cities), executar `php artisan cities:fetch` quando necessário e carregar o catálogo com `CitySeeder` sem rede.
- [ ] Concluir [`addresses`](doc:migration-01-addresses).
- [ ] Concluir [`user_personal_data`](doc:migration-02-user-personal-data).
- [ ] Concluir [`campuses`](doc:migration-03-campuses).
- [ ] Concluir [`affiliations`](doc:migration-04-affiliations).
- [ ] Concluir [`courses`](doc:migration-09-courses).
- [ ] Concluir [`course_id` em affiliations](doc:migration-10-course-id-em-affiliations).
- [ ] Concluir [`internship_types`](doc:migration-11-internship-types).
- [ ] Concluir [`granting_parties`](doc:migration-12-granting-parties).
- [ ] Concluir [`holidays`](doc:migration-22-holidays) e suas exceções por estágio.

## Regras de dados

- [ ] Preservar linhas de endereço usadas historicamente; alterações criam nova linha quando necessário.
- [ ] Garantir CPF único e imutável pela configuração do usuário.
- [ ] Normalizar CPF, CNPJ, CEP, UF e e-mails.
- [ ] Permitir múltiplos vínculos por pessoa sem trocar campus dentro do vínculo.
- [ ] Exigir curso em vínculo discente e respeitar escopo do campus.
- [ ] Congelar regras do tipo de estágio por FK e snapshot no estágio.
- [ ] Criar factories e testes para cenários completos, incompletos, ativos e desativados.

## Componentes que sustentam a fundação

- [ ] Confirmar [casts](doc:casts) nos Models corretos.
- [ ] Usar [helpers](doc:helpers) somente para formatação/normalização, sem regra de autorização.
- [ ] Reutilizar [concerns](doc:concerns) para validações compartilhadas.
- [ ] Cobrir as lacunas em [testes existentes](doc:testes-existentes).

## Critério de saída

- [ ] Todas as migrations 01–04 e 09–12 passam em banco limpo.
- [ ] Modelos, relações, casts, índices e autorização básica estão cobertos.

## Próxima fase

[Fase 04 — Conta, autenticação e contexto](doc:fase-04-conta-e-contexto)
