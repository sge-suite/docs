---
title: SGE — Matriz de autorização
description: Resumo navegável de responsabilidades por vínculo institucional; o detalhamento operacional fica na referência de perfis.
type: authorization-reference
status: defined
tags:
  - sge/autorizacao
  - sge/desenvolvimento
  - sge/policies
aliases:
  - Matriz de permissões do SGE
---
> [!info] Leitura rápida
> Esta é a visão resumida. Para telas, ações, limites, notificações e testes de cada `AffiliationType`, consulte [[SGE - Perfis e responsabilidades por vínculo]]. A matriz orienta Gates e Policies, mas não substitui a validação do vínculo ativo, escopo e estado do registro.

| Vínculo                  | Escopo principal                       | Pode iniciar/editar                                                         | Pode analisar/aprovar                                     | Limites importantes                                                                     |
| ------------------------ | -------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Administrador do Sistema | Global                                 | Campi e vínculos administrativos previstos em Policy.                       | Administração global prevista em Policy.                  | Não representa automaticamente operação acadêmica do campus.                            |
| Administrador do Campus  | Próprio campus                         | Dados cadastrais do campus, usuários, vínculos, cursos e tipos autorizados. | Administração do próprio escopo.                          | Não cria outros campi, não altera sua ativação e não cadastra Administrador do Sistema. |
| Setor de Estágio         | Campus ou escopo atribuído             | Templates, concedentes, solicitações pendentes e registros operacionais.    | Estágios, documentos, avaliações, pendências e liberação. | Aprova/devolve avaliação sem editar a resposta do supervisor.                           |
| Coordenador              | Curso do vínculo                       | Consultas e atestado de orientação previsto.                                | Ações acadêmicas explicitamente atribuídas ao curso.      | Não recebe automaticamente a análise operacional do Setor de Estágio.                   |
| Orientador               | Próprios orientandos                   | Consulta e lançamento das notas sob sua responsabilidade.                   | Avaliação acadêmica que lhe for atribuída.                | Não opera estágios fora dos próprios orientandos.                                       |
| Discente                 | Próprio vínculo e processos permitidos | Perfil permitido, rascunho e correções do próprio estágio.                  | Não aprova registros.                                     | Não altera CPF, dados alheios ou registros já congelados.                               |
| Supervisor               | Próprios estágios vinculados           | Draft, envio, cancelamento permitido e edição da própria avaliação devolvida. | Não aprova a própria resposta.                            | `Submitted` bloqueia edição; `Returned` reabre o mesmo formulário; `Approved` é imutável. |
| Direção de Ensino        | Escopo institucional a confirmar       | Consultas e relatórios autorizados.                                         | A definir por decisão institucional.                      | Não presumir poder de edição ou aprovação sem Policy explícita.                         |

## Regras transversais

- Toda ação valida usuário autenticado, vínculo ativo, `AffiliationType`, campus/curso e estado do registro.
- Vínculo desativado preserva consulta histórica autorizada, mas não permite iniciar ou alterar fluxos.
- Nenhuma Policy ultrapassa o escopo de campus ou curso do vínculo.
- A mesma pessoa pode atuar por mais de um vínculo; a sessão escolhe apenas um contexto por vez.
- Não há permissões/roles editáveis pelo banco ou interface. Exceções exigem mudança explícita de enum, Policy, teste e documentação.

## Referências

- [[SGE - Enum - AffiliationType|Tipos de vínculo]]
- [[SGE - Perfis e responsabilidades por vínculo|Detalhamento operacional por vínculo]]
- [[SGE - Fase 05 - Administração|Fase de administração]]
- [[SGE - Pessoas e responsabilidades|Trilhas funcionais por vínculo]]
- [[SGE - Backlog e decisões#D-009 — Ciclo e validade da avaliação do supervisor|Decisão sobre avaliação]]
