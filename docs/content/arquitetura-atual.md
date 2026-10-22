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

Use esta página para saber o que já existe e quais lacunas técnicas continuam abertas. Para entender o processo sem detalhes técnicos, comece por [Visão geral](doc:visao-geral), [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) e [Fluxos principais](doc:fluxos-principais).

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

- `phpoffice/phpword` está declarado em `composer.json` e dá suporte à geração DOCX;
- o helper de valores por extenso importa Brick Math, mas o pacote não está declarado diretamente no `composer.json`.

## Organização do código

{{diagram:arquitetura-atual-diagrama}}

## Componentes observados

| Área                    | Situação    | Evidência                                                                            |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------ |
| Autenticação            | ✅          | Fortify, páginas Livewire e rotas protegidas                                         |
| Usuários                | Parcial     | Administração de contas e vínculos por Administrador do Sistema e Setor de Estágio, importação CSV e perfil pessoal de Discente/Supervisor implementados; outros campos e processos permanecem separados por vínculo. |
| Autorização             | Parcial     | Policies por recurso cobrem administração, cursos, documentos, cadastros, solicitações, estágio, avaliação, feriados e auditoria, sempre conforme vínculo ativo e escopo aplicável; validação automatizada permanece pendente. |
| Auditoria               | ✅          | Spatie Activitylog, autoria pelo vínculo ativo e campos pessoais/profissionais auditados                  |
| Infraestrutura de mídia | Parcial     | Spatie Medialibrary armazena versões privadas de templates e comprovantes; geração DOCX/PDF usa snapshots e arquivos temporários privados. Registro de documentos externos permanece pendente. |
| Estágios                | Parcial     | Abertura, correções, formalização, assinaturas, liberação, pausas, sincronização de execução, cancelamento, avaliação, notas e conclusão têm Actions, Policies e interfaces. Vigências formais de jornada e reprodução histórica do cálculo permanecem pendentes. |
| Administração            | Parcial     | Gestão global e por campus de campi, cursos, tipos de estágio, concedentes, contas/vínculos, calendário, documentos e consultas administrativas implementadas. |
| Relatórios              | Planejado   | Devem consumir o domínio e respeitar o escopo do vínculo ativo                       |

## Regras de arquitetura

> [!warning] Limite desta nota
> A arquitetura descrita aqui é a base da aplicação. Para o domínio e os fluxos, consulte [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).

- Regras de negócio importantes devem ficar em Services, Actions ou objetos de domínio, evitando controllers grandes.
- Autorização deve ser centralizada em Gates e Policies.
- A autorização é derivada do vínculo ativo, `AffiliationType`, campus/curso e estado do registro; a decisão fica no código. A cobertura automatizada será retomada na preparação para produção.
- Alterações persistentes devem ser feitas por migrations.
- Integrações externas devem ser encapsuladas em Services/Support; a validação automatizada isolada fica para a preparação para produção.
- Cálculos determinísticos ficam em Services puros; autorização, transação e efeitos colaterais ficam em Actions/Policies.
- Decisões que alterem o domínio devem manter os modelos e fluxos correspondentes sincronizados.
