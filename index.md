---
title: SGE — Documentação
description: Visão pública do Sistema de Gestão de Estágios.
type: documentation-hub
status: defined
tags:
  - sge/documentacao
aliases:
  - Índice do SGE
---
> [!abstract] Sobre o SGE
> O Sistema de Gestão de Estágios organiza a solicitação, a formalização, o acompanhamento e a conclusão de estágios. Esta documentação apresenta o funcionamento do produto em linguagem clara para estudantes, instituições e demais pessoas interessadas.

## Comece por aqui

| Se você quer… | Leia primeiro | Depois consulte |
| --- | --- | --- |
| entender o SGE | [[SGE - Visão geral]] | [[SGE - Pessoas e responsabilidades]] |
| saber quem faz o quê | [[SGE - Pessoas e responsabilidades]] | [[SGE - Fluxos principais]] |
| acompanhar a jornada de um estágio | [[SGE - Fluxos principais]] | [[SGE - Ciclos de status]] |
| entender uma situação exibida pelo sistema | [[SGE - Ciclos de status]] | [[SGE - Glossário]] |
| consultar um termo | [[SGE - Glossário]] | [[SGE - Visão geral]] |
| acompanhar o desenvolvimento do novo SGE | [[SGE - Planejamento]] | [[SGE - Guia de desenvolvimento]] |

## Jornada do estágio

```mermaid
flowchart LR
    A[Acesso e vínculo] --> B[Solicitação e análise]
    B -->|pendência| B
    B -->|aceite| C[Documentos e formalização]
    C --> D[Estágio em andamento]
    D --> E[Acompanhamento acadêmico e conclusão]
```

O [[SGE - Fluxograma do estágio.canvas|fluxograma do estágio]] detalha a primeira parte dessa jornada. Os [[SGE - Fluxos principais|fluxos principais]] apresentam o processo completo em texto.

## Escopo desta documentação

Esta documentação apresenta o produto e o planejamento do novo SGE. Ela reúne papéis, etapas, regras de uso, modelo do sistema e decisões de desenvolvimento que fazem parte da solução atual.

> [!info] Código-fonte
> O código do SGE está no [repositório oficial](https://github.com/sge-suite/sge).
