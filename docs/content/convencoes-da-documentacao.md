---
id: convencoes-da-documentacao
title: Convenções da documentação
description: Regras para manter fontes de verdade, estados, links internos e referências de código consistentes.
type: documentation-standard
status: maintained
visibility: public
tags: sge/documentacao, sge/desenvolvimento, sge/qualidade
related: dominio-e-modelo-de-dados, fluxos-principais, glossario, ciclos-de-status, backlog-e-decisoes
source_refs:
---
## Fonte de verdade por assunto

| Assunto | Fonte principal | Material complementar |
| --- | --- | --- |
| Regras funcionais de domínio | [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) | [Fluxos principais](doc:fluxos-principais), [Glossário](doc:glossario) |
| Estados e transições | [Ciclos de status](doc:ciclos-de-status) | enum e fluxo correspondentes |
| Esquema, índices e FKs | notas de migration | diagramas conceituais |
| Decisão aprovada | [Backlog e decisões](doc:backlog-e-decisoes) | notas de implementação relacionadas |
| Estado do código existente | nota técnica com `source_refs` | código e testes apontados pela mesma lista |

Uma nota derivada deve linkar para a fonte principal em vez de repetir o contrato inteiro.

## Estados das notas

| Status | Uso |
| --- | --- |
| `planned` | Contrato ou trabalho ainda não iniciado. |
| `defined` | Regra aprovada, mas ainda não implementada. |
| `in-progress` | Conteúdo, implementação ou validação em curso. |
| `implemented` | Artefato de código existe; os checklists devem indicar integrações ou testes restantes. |
| `maintained` | Nota operacional ou histórica que continua válida e recebe revisões. |
| `observed` | Fotografia do estado atual, sem prometer comportamento futuro. |
| `completed` | Marco concluído e sem trabalho pendente próprio. |
| `archived` | Material preservado apenas para consulta histórica. |

Não marque uma fase como `completed` se seu checklist ainda tiver itens pendentes. Para uma nota de código, `implemented` pode coexistir com pendências de integração e testes, desde que o texto deixe isso explícito.

## Frontmatter e referências de código

Toda nota Markdown deve possuir `id`, `title`, `description`, `type`, `status` e `visibility`.

O repositório Laravel fica em `../../sge` a partir de `docs/`. Para manter os links portáveis, use referências relativas ao site:

```yaml
source_refs: ../../sge/app/Enums/InternshipStatus.php, ../../sge/tests/Unit/Enums/InternshipStatusTest.php
```

Nunca grave um caminho absoluto de máquina em `source_refs`. O comando `npm run check` valida a estrutura, os links e as referências disponíveis.

## Fronteira de publicação no Aurelius

O Aurelius publica as notas em `content/` e os diagramas em `diagrams/`, gerando páginas HTML, Markdown e uma API para consulta por agentes. Portanto:

- notas publicadas não devem linkar ou incorporar materiais excluídos da publicação;
- `visibility` registra a intenção de exposição da nota;
- `description` é exibida pelo Aurelius e deve explicar a nota sem depender de contexto interno;
- o título já é renderizado pela página, então as páginas públicas não devem repetir o H1 do frontmatter no corpo.

## Checklist de alteração

1. Atualize a fonte principal e as notas derivadas afetadas.
2. Verifique links e frontmatter com `npm run check`.
3. Execute `npm run build` quando a alteração afetar conteúdo publicado.
4. Atualize o checklist da fase e a matriz de testes quando houver código novo.
