---
id: dominio-e-modelo-de-dados
title: Domínio e modelo de dados
description: Mapa de navegação das entidades, regras de persistência e ciclos do SGE.
type: data-model
status: in-progress
visibility: public
tags: sge/dominio, sge/modelagem, sge/banco-de-dados
related: glossario, pessoas-e-responsabilidades, modelo-de-dados-nucleo, modelo-de-dados-acesso, modelo-de-dados-historico, ciclos-de-status, modelagem-de-dados, fluxos-principais
source_refs:
diagram: dominio-modelo-diagrama
---
## Antes de olhar os dados

Esta página explica como o sistema organiza as informações para que cada etapa tenha um responsável e um histórico confiável. Não é preciso conhecer banco de dados para acompanhar a ideia: a pessoa inicia uma solicitação, o aceite cria o estágio, documentos e avaliações ficam ligados a ele e mudanças importantes permanecem registradas.

As expressões técnicas aparecem porque esta também é a referência da equipe que implementa o sistema. Sempre que elas forem necessárias, consulte o [glossário](doc:glossario). Para entender quem participa de cada etapa, leia [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades).

## Visão do domínio

Esta página é o ponto de entrada do modelo de dados. Os campos e relacionamentos detalhados ficam nos recortes especializados, evitando repetir contratos em várias notas.

{{diagram:dominio-modelo-diagrama}}

## Encontre a regra certa

| Pergunta | Fonte canônica |
| --- | --- |
| Quais entidades e FKs formam o estágio? | [Modelo de dados — Núcleo](doc:modelo-de-dados-nucleo) |
| Como a pessoa escolhe um contexto e recebe acesso? | [Modelo de dados — Acesso](doc:modelo-de-dados-acesso) |
| Quando usar FK, dado atual, snapshot ou log? | [Modelo de dados — Histórico](doc:modelo-de-dados-historico) |
| Quais estados existem e quem pode mudá-los? | [Ciclos de status](doc:ciclos-de-status) |
| Como as partes se conectam visualmente? | [Modelagem de dados](doc:modelagem-de-dados) |
| O que significa cada termo? | [Glossário](doc:glossario) |

## Regras que atravessam o modelo

- A pessoa possui uma conta e pode ter vários vínculos institucionais.
- O vínculo ativo define função, campus e curso usados por Gates e Policies.
- Solicitação, estágio, documento e avaliação possuem ciclos independentes.
- Cadastros atuais mantêm relacionamentos por FK; fatos históricos relevantes são congelados em snapshots.
- Alterações relevantes registram autoria e vínculo no Activity Log.
- Templates são versionados; documentos gerados preservam a versão e os dados usados, sem armazenar permanentemente o arquivo final.
- A jornada pactuada, os feriados e as pausas são registros próprios porque afetam a previsão de término; uma nova vigência de jornada só é criada por aditivo formalizado.

> [!tip] Leitura recomendada
> Para uma visão visual, comece em [Modelagem de dados](doc:modelagem-de-dados). Para implementar uma regra, vá ao recorte correspondente e confirme o fluxo em [Fluxos principais](doc:fluxos-principais).
