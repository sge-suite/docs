---
title: SGE — Enums e migrations
description: Portal de compatibilidade para as referências separadas de enums e migrations do SGE.
type: documentation-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/banco-de-dados
  - sge/planejamento
aliases:
  - Referência técnica de enums e migrations
---
Esta nota permanece como ponto de entrada para links antigos. A documentação foi separada para que cada decisão possa ser localizada e marcada independentemente:

- [[SGE - Enums|Enums]] — conjuntos fechados de valores e checklist de implementação.
- [[SGE - Migrations|Migrations]] — ordem, dependências, campos, FKs, índices e checklist de banco.

> [!info] Regra de navegação
> Use a nota do enum ou da migration como fonte de verdade. Este arquivo é apenas um portal; não duplique aqui a lista de cases ou o contrato de tabelas.

## Convenções

- **Enum:** conjunto pequeno e estável, usado no código e na regra de negócio.
- **Tabela:** entidade com cadastro, histórico ou configuração própria.
- **JSONB:** regras configuráveis ou snapshots históricos.
- **Timestamp:** ciclo de vida simples, quando basta saber se algo está ativo ou desativado.

## Voltar ao plano

- [[SGE - Guia de desenvolvimento]]
- [[SGE - Backlog e decisões]]
- [[SGE - Domínio e modelo de dados]]
