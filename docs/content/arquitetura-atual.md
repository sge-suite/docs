---
id: arquitetura-atual
title: Arquitetura atual
description: Fotografia da arquitetura, dependências e infraestrutura atualmente presentes na aplicação.
type: architecture
status: observed
visibility: public
tags: sge/arquitetura, sge/implementacao
related: visao-geral, pessoas-e-responsabilidades, fluxos-principais, dominio-e-modelo-de-dados
source_refs: https://github.com/sge-suite/sge/blob/master/composer.json, https://github.com/sge-suite/sge/blob/master/compose.yaml, https://github.com/sge-suite/sge/blob/master/app/Providers/AppServiceProvider.php, https://github.com/sge-suite/sge/blob/master/app/Providers/FortifyServiceProvider.php, https://github.com/sge-suite/sge/blob/master/app/Models/User.php
diagram: arquitetura-atual-diagrama
---
## Leitura em linguagem simples

Esta página mostra como o SGE é montado por dentro. Quem usa o sistema não precisa conhecer estas tecnologias para solicitar, acompanhar ou avaliar um estágio. Em termos simples: há uma tela para as pessoas, regras que conferem cada ação, um banco que guarda as informações e serviços que executam tarefas como calcular datas ou preparar documentos.

Use esta página para saber o que já existe e o que ainda está sendo planejado. Para entender o processo de estágio sem detalhes técnicos, comece por [Visão geral](doc:visao-geral), [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) e [Fluxos principais](doc:fluxos-principais).

## Stack

A implementação atual utiliza:

- Laravel 13.
- PHP `^8.3 (o ambiente de desenvolvimento atual usa PHP 8.5).
- Livewire 4 e Flux UI.
- Tailwind CSS e Vite.
- PostgreSQL.
- Laravel Fortify.
- Spatie Activitylog.
- Spatie Medialibrary.
- Laravel Scout e Meilisearch.

## Dependências do domínio

- O `composer.json` atual não declara PhpOffice/PhpWord, usado apenas quando a geração DOCX for implementada;
- o helper de valores por extenso importa Brick Math, mas o pacote não está declarado diretamente no `composer.json`.

## Organização do código

{{diagram:arquitetura-atual-diagrama}}

## Componentes observados

| Área                    | Situação    | Evidência                                                                            |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------ |
| Autenticação            | ✅          | Fortify, páginas Livewire e rotas protegidas                                         |
| Usuários                | Parcial     | Model, autenticação, configurações de conta e provisionamento por `admin:create`; não há telas de administração de usuários                                            |
| Autorização             | Parcial     | Contexto de vínculo ativo e autorização de gestão global de campi; faltam autorizações das jornadas operacionais e interfaces locais |
| Auditoria               | ✅          | Spatie Activitylog, autoria pelo vínculo ativo e campos pessoais/profissionais auditados                  |
| Infraestrutura de mídia | Parcial     | Spatie Medialibrary disponível; Models e schema de templates/versões existem, mas upload e geração DOCX seguem pendentes |
| Estágios                | Parcial     | Models, migrations, validações e auditoria existem; faltam Actions, Policies completas e jornadas da aplicação |
| Administração de campi   | Parcial     | Páginas Livewire para Administrador do Sistema, controller e Scout/Meilisearch; interface local ainda pendente |
| Relatórios              | Planejado   | Devem consumir o domínio e respeitar o escopo do vínculo ativo                       |

## Regras de arquitetura

> [!warning] Limite desta nota
> A arquitetura descrita aqui é a base da aplicação. Para o domínio e os fluxos, consulte [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).

- Regras de negócio importantes devem ficar em Services, Actions ou objetos de domínio, evitando controllers grandes.
- Autorização deve ser centralizada em Gates e Policies.
- A autorização é derivada do vínculo ativo, `AffiliationType`, campus/curso e estado do registro; a decisão fica no código e nos testes.
- Alterações persistentes devem ser feitas por migrations.
- Integrações externas devem ser encapsuladas em Services e testadas isoladamente.
- Cálculos determinísticos ficam em Services puros; autorização, transação e efeitos colaterais ficam em Actions/Policies.
- Decisões que alterem o domínio devem manter os modelos e fluxos correspondentes sincronizados.
