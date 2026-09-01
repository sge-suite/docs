---
title: SGE — Fase 03 — Fundação de dados
description: Checklist da fundação de dados, enums, migrations, modelos e catálogos básicos.
type: development-phase
status: planned
order: 3
tags:
  - sge/desenvolvimento
  - sge/banco-de-dados
  - sge/checklist
---
> [!info] Ordem
> Execute as migrations na ordem do [[SGE - Migrations|índice de migrations]]. Cada enum tem seu próprio checklist no [[SGE - Enums|índice de enums]].

## Base já existente

- [x] [[SGE - Migration - Base 01 - Users|Migration base de usuários]].
- [x] [[SGE - Migration - Base 02 - Cache|Migration base de cache]].
- [x] [[SGE - Migration - Base 03 - Jobs|Migration base de filas]].
- [x] [[SGE - Migration - Base 04 - Activity log|Migration base de auditoria]].
- [x] [[SGE - Migration - Base 05 - Media|Migration base de mídia]].
- [x] Decidir que não haverá migration de permissões; autorização será por vínculos, Gates e Policies.

> [!warning] Implementado não significa encerrado
> As migrations base existem no código, mas suas integrações com o domínio, políticas de segurança, testes de schema e decisões de transição continuam sendo acompanhadas nas notas individuais.

## Dados cadastrais

- [ ] Implementar e testar [[SGE - Enum - AffiliationType|`AffiliationType`]], [[SGE - Enum - PartyDocumentType|`PartyDocumentType`]] e demais enums estáveis.
- [ ] Concluir [[SGE - Migration - 01 - Addresses|`addresses`]].
- [ ] Concluir [[SGE - Migration - 02 - User personal data|`user_personal_data`]].
- [ ] Concluir [[SGE - Migration - 03 - Campuses|`campuses`]].
- [ ] Concluir [[SGE - Migration - 04 - Affiliations|`affiliations`]].
- [ ] Concluir [[SGE - Migration - 09 - Courses|`courses`]].
- [ ] Concluir [[SGE - Migration - 10 - Affiliation course|`course_id` em affiliations]].
- [ ] Concluir [[SGE - Migration - 11 - Internship types|`internship_types`]].
- [ ] Concluir [[SGE - Migration - 12 - Granting parties|`granting_parties`]].

## Regras de dados

- [ ] Preservar endereço atual sem apagar snapshots históricos.
- [ ] Garantir CPF único e imutável pela configuração do usuário.
- [ ] Normalizar CPF, CNPJ, CEP, UF e e-mails.
- [ ] Permitir múltiplos vínculos por pessoa sem trocar campus dentro do vínculo.
- [ ] Exigir curso em vínculo discente e respeitar escopo do campus.
- [ ] Congelar regras do tipo de estágio por FK e snapshot no estágio.
- [ ] Criar factories e testes para cenários completos, incompletos, ativos e desativados.

## Componentes que sustentam a fundação

- [ ] Confirmar [[SGE - Casts|casts]] nos Models corretos.
- [ ] Usar [[SGE - Helpers|helpers]] somente para formatação/normalização, sem regra de autorização.
- [ ] Reutilizar [[SGE - Concerns|concerns]] para validações compartilhadas.
- [ ] Cobrir as lacunas em [[SGE - Testes existentes|testes existentes]].

## Critério de saída

- [ ] Todas as migrations 01–04 e 09–12 passam em banco limpo.
- [ ] Modelos, relações, casts, índices e autorização básica estão cobertos.

## Próxima fase

[[SGE - Fase 04 - Conta e contexto|Fase 04 — Conta, autenticação e contexto]]
