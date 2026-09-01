---
title: SGE — Convenções da documentação
description: Regras para manter fontes de verdade, estados, links internos e referências de código consistentes.
type: documentation-standard
status: maintained
tags:
  - sge/documentacao
  - sge/desenvolvimento
  - sge/qualidade
aliases:
  - Convenções do vault SGE
---
## Fonte de verdade por assunto

| Assunto | Fonte principal | Material complementar |
| --- | --- | --- |
| Regras funcionais de domínio | [[SGE - Domínio e modelo de dados]] | [[SGE - Fluxos principais]], [[SGE - Glossário]] |
| Estados e transições | [[SGE - Ciclos de status]] | enum e fluxo correspondentes |
| Esquema, índices e FKs | notas de migration | diagramas conceituais |
| Decisão aprovada | [[SGE - Backlog e decisões]] | notas de implementação relacionadas |
| Estado do código existente | nota técnica com `code_path` | teste apontado por `test_path` |

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

Toda nota Markdown deve possuir `title`, `description`, `type`, `status` e `tags`.

O repositório Laravel é irmão deste vault, em `../sge`. Para manter os links portáveis, use caminhos relativos a essa raiz:

```yaml
code_path: app/Enums/InternshipStatus.php
test_path: tests/Unit/Enums/InternshipStatusTest.php
```

Nunca grave um caminho absoluto de máquina em `code_path` ou `test_path`. O verificador usa `../sge` por padrão; quando necessário, a raiz pode ser alterada temporariamente por `SGE_SOURCE_ROOT`.

## Fronteira de publicação no Quartz

O Quartz publica `index.md` e as áreas `01` a `06`, mas ignora materiais de descoberta que não descrevem o novo SGE. Portanto:

- notas publicadas não devem linkar ou incorporar materiais excluídos da publicação;
- notas internas podem linkar para a documentação pública;
- `description` é exibida pelo Quartz e deve explicar a nota sem depender de contexto interno;
- o plugin `article-title` já renderiza o título da nota, então as páginas públicas não devem repetir o H1 do frontmatter no corpo.

## Checklist de alteração

1. Atualize a fonte principal e as notas derivadas afetadas.
2. Verifique links e frontmatter com `npm run docs:check`.
3. Execute `npm run quartz -- build -d .` quando a alteração afetar conteúdo publicado.
4. Atualize o checklist da fase e a matriz de testes quando houver código novo.
