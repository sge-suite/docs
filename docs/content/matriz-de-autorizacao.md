---
id: matriz-de-autorizacao
title: Matriz de autorização
description: Resumo navegável de responsabilidades por vínculo institucional; o detalhamento operacional fica na referência de perfis.
type: authorization-reference
status: defined
visibility: public
tags: sge/autorizacao, sge/desenvolvimento, sge/policies
related: perfis-e-responsabilidades-por-vinculo, enum-affiliationtype, fase-05-administracao, pessoas-e-responsabilidades, backlog-e-decisoes
source_refs:
---
> [!info] Leitura rápida
> Esta é a visão resumida. Para telas, ações, limites, notificações e testes de cada `AffiliationType`, consulte [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo). A matriz orienta Gates e Policies, mas não substitui a validação do vínculo ativo, escopo e estado do registro.

| Vínculo                  | Escopo principal                       | Pode iniciar/editar                                                         | Pode analisar/aprovar                                     | Limites importantes                                                                     |
| ------------------------ | -------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Administrador do Sistema | Global                                 | Todos os campos dos campi e vínculos administrativos previstos em Policy; consulta auditoria e e-mails administrativos. | Administração global prevista em Policy.                  | Histórico exige vínculo ativo selecionado e permanece limitado a campi, contas e vínculos administrativos; não representa operação acadêmica do campus.              |
| Setor de Estágio | Próprio campus | Dados do próprio campus, cursos e gestão local de usuários/vínculos; dados de acesso de contas locais e dados profissionais opcionais de supervisor; auditoria e e-mails de cadastro e alterações dentro do escopo local; demais fluxos previstos em Policy. | Estágios, documentos, avaliações, pendências e liberação. | Não cria campi nem altera seu ciclo de ativação; não gerencia vínculos de Administrador do Sistema, contas externas ou dados de acesso de outros administradores; não consulta logs administrativos gerais. Aprova/devolve avaliação sem editar a resposta. |
| Coordenador              | Cursos que referenciam o vínculo       | Consultas e atestado de orientação previsto.                                | Ações acadêmicas explicitamente atribuídas ao curso.      | Não recebe automaticamente a análise operacional do Setor de Estágio.                   |
| Orientador               | Próprios orientandos                   | Consulta e lançamento das notas sob sua responsabilidade.                   | Avaliação acadêmica que lhe for atribuída.                | Não opera estágios fora dos próprios orientandos.                                       |
| Discente                 | Próprio vínculo e processos permitidos | Perfil permitido, rascunho e correções do próprio estágio.                  | Não aprova registros.                                     | Não altera CPF, dados alheios ou registros já congelados.                               |
| Supervisor               | Próprios estágios vinculados           | Draft, envio, cancelamento permitido e edição da própria avaliação devolvida. | Não aprova a própria resposta.                            | `Submitted` bloqueia edição; `Returned` reabre o mesmo formulário; `Approved` é imutável. |
| Direção de Ensino        | Escopo institucional a confirmar       | Consultas e relatórios autorizados.                                         | A definir por decisão institucional.                      | Não presumir poder de edição ou aprovação sem Policy explícita.                         |

## Regras transversais

- Toda ação valida usuário autenticado, vínculo ativo, `AffiliationType`, campus/curso e estado do registro.
- Vínculo desativado preserva consulta histórica autorizada, mas não permite iniciar ou alterar fluxos.
- Campus desativado preserva consulta e vínculos, mas congela as alterações em seus recursos; configurações pessoais continuam disponíveis.
- Nenhuma Policy ultrapassa o escopo de campus ou curso do vínculo.
- Auditoria e e-mails compartilham telas entre Administrador do Sistema e Setor de Estágio. O Setor consulta somente campus, cursos, contas e vínculos locais autorizados e e-mails de cadastro e alterações com contexto persistido do campus; não herda consultas globais nem acesso ao histórico de fluxos ainda sem Policy.
- A mesma pessoa pode atuar por mais de um vínculo; a sessão escolhe apenas um contexto por vez.
- Não há permissões/roles editáveis pelo banco ou interface. Exceções exigem mudança explícita de enum, Policy, teste e documentação.

## Referências

- [Tipos de vínculo](doc:enum-affiliationtype)
- [Detalhamento operacional por vínculo](doc:perfis-e-responsabilidades-por-vinculo)
- [Fase de administração](doc:fase-05-administracao)
- [Trilhas funcionais por vínculo](doc:pessoas-e-responsabilidades)
- [Decisão sobre avaliação](doc:backlog-e-decisoes#d-009-ciclo-e-validade-da-avaliacao-do-supervisor)

## Gestão de usuários e vínculos

- As telas `users.*` são compartilhadas pelos vínculos ativos de Administrador do Sistema e Setor de Estágio; o Setor fica limitado ao campus selecionado.
- O Setor pode cadastrar e editar todos os tipos de vínculo exceto Administrador do Sistema. Tipo, campus e curso são preservados na edição. Supervisor não possui matrícula; seus dados profissionais são opcionais e compartilhados pela conta.
- A consulta explícita de CPF no cadastro pode identificar conta de outro campus ou sem vínculo para acrescentar vínculo local. Listagem, detalhes, opções de matrícula e edição não expõem vínculos externos.
- O Setor pode editar os próprios dados de acesso mesmo quando possui também um vínculo de Administrador do Sistema; a exceção não permite editar contas de outros administradores.
- Desativação e exclusão exigem senha atual e confirmação para ambos os perfis administrativos. Nenhum deles pode desativar ou excluir vínculos da própria conta. O Setor só opera vínculos locais de outras pessoas; a exclusão exige ausência de referências.
- Dados pessoais da conta e auditoria são preservados na exclusão do vínculo. Exclusão de conta e reativação de vínculo continuam exclusivas do Administrador do Sistema.
