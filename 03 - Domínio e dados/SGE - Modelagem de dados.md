---
title: SGE — Modelagem de dados
description: Índice dos diagramas conceituais e das convenções de modelagem de dados do SGE.
type: diagram-index
status: defined
tags:
  - sge/modelagem
  - sge/mermaid
  - sge/banco-de-dados
aliases:
  - Diagramas do modelo de dados
---
## Como usar este mapa

Este mapa é uma visão do que o SGE precisa guardar para acompanhar um estágio. Ele ajuda a perceber que uma solicitação, um estágio, documentos, avaliações e avisos são partes relacionadas do mesmo processo. Os nomes entre crases são nomes técnicos usados pela aplicação; não são passos que a pessoa usuária precisa executar.

Se a dúvida for sobre quem realiza uma tarefa, leia [[SGE - Pessoas e responsabilidades]]. Se for sobre a ordem das etapas, siga para [[SGE - Fluxos principais]].

## Visão de conjunto

```mermaid
flowchart LR
    U["`users`\nidentidade"] --> A["`affiliations`\ncontexto institucional"]
    C["`campuses`"] --> A
    C --> CO["`courses`"]
    CO --> IT["`internship_types`"]

    A --> I["`internships`\nprocesso e snapshots"]
    CO --> I
    IT --> I
    GP["`granting_parties`"] --> I
    AD["`addresses`"] --> I

    I --> GD["`generated_documents`"]
    TV["`template_versions`"] --> GD
    I --> SE["`supervisor_evaluations`"]
    I --> IP["`internship_pauses`"]

    I -. "rastreia" .-> AL["`activity_log`"]
    A --> N["`notifications`"]
    N --> EM["`email_messages`"]
    EM --> EDA["`email_delivery_attempts`"]
```

> [!info] Estratégia de visualização
> Use este mapa para se orientar. O [[SGE - Modelagem de dados.canvas|canvas da modelagem]] apresenta as áreas e dependências como cartões navegáveis no Quartz. Os diagramas Mermaid são a fonte conceitual de detalhe; as migrations fecham tipos, nulabilidade, índices e restrições.

## Leitura recomendada

1. [[SGE - Modelo de dados - Núcleo|Núcleo do domínio]] — FKs e entidades que compõem o processo de estágio.
2. [[SGE - Modelo de dados - Acesso|Conta, vínculos e escopo]] — identidade, contexto ativo e autorização.
3. [[SGE - Modelo de dados - Histórico|Histórico e snapshots]] — o que é referenciado e o que é congelado.
4. [[SGE - Domínio e modelo de dados|Especificação textual do domínio]] — campos, regras e status.
5. [[SGE - Ciclos de status|Ciclos de status]] — transições persistidas que incidem sobre os registros.

## Legenda de modelagem

| Notação | Significado |
| --- | --- |
| `FK` | Referência ao cadastro atual, usada para consultas, escopo, filtros e integridade. |
| `UK` | Restrição de unicidade; não é um dado histórico. |
| `jsonb` / snapshot | Cópia imutável dos valores usados no processo. Não é reescrita quando o cadastro muda. |
| Relação polimórfica | Referência por tipo e identificador, usada apenas onde o framework exige, como `media` e `activity_log`. |

## Convenções

- O nome da tabela de vínculo é `affiliations`; “vínculo” é o conceito funcional.
- Dados históricos em `jsonb` mantêm a FK da entidade de origem quando ela existir.
- `addresses` representa o endereço atual; documentos e estágios preservam snapshots do endereço utilizado.
- O modelo Mermaid é conceitual. Tipos, índices, nulabilidade e restrições devem ser definidos nas migrations.
- `affiliations.type`, vínculo ativo, campus/curso e estado do registro definem autorização. Gates e Policies aplicam a matriz institucional.

> [!warning] Escopo
> O modelo é conceitual. Alterações no domínio devem manter esta nota, [[SGE - Domínio e modelo de dados]] e os fluxos correspondentes sincronizados.
