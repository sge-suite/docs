---
id: matriz-de-autorizacao
title: Matriz de autorização
description: Resumo navegável de responsabilidades por vínculo institucional; o detalhamento operacional fica na referência de perfis.
type: authorization-reference
status: observed
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
| Setor de Estágio | Próprio campus | Dados do próprio campus, cursos, tipos, concedentes e gestão local de usuários/vínculos; análise de abertura e cadastros pendentes; auditoria administrativa e e-mails do próprio campus; consulta de e-mails operacionais dos estágios do campus. | Estágios, documentos, avaliações, pendências e liberação. | Não cria campi nem altera seu ciclo de ativação; não gerencia vínculos de Administrador do Sistema, contas externas ou dados de acesso de outros administradores; não consulta logs administrativos globais. Aprova/devolve avaliação sem editar a resposta. |
| Coordenador | Cursos que referenciam o vínculo titular/substituto e próprios orientandos no campus | Consulta acadêmica, consulta de notas como orientador e emissão/download do atestado, com template vigente automático e DOCX/PDF. | Nenhuma decisão operacional do Setor; não lança notas como coordenador. | Não pode emitir os demais tipos, manter templates, cancelar emissões ou acessar dados fora do contexto autorizado. |
| Orientador               | Próprios orientandos                   | Consulta e lançamento das notas sob sua responsabilidade.                   | Avaliação acadêmica que lhe for atribuída.                | Não opera estágios fora dos próprios orientandos.                                       |
| Discente                 | Próprio vínculo e processos permitidos | RG, órgão emissor, emissão, nascimento, telefone compartilhado e endereço atual próprios; rascunho e correções do próprio estágio.                  | Não aprova registros.                                     | Não altera CPF, dados alheios ou registros já congelados.                               |
| Supervisor               | Próprios estágios vinculados           | Cargo/função, qualificações múltiplas e telefone compartilhado próprios; Draft, envio, cancelamento permitido e edição da própria avaliação devolvida. | Não aprova a própria resposta.                            | `Submitted` bloqueia edição; `Returned` reabre o mesmo formulário; `Approved` é imutável. |
| Direção de Ensino        | Campus do vínculo ativo                 | Consulta de estágios e painel resumido, incluindo quantidade de concluídos. | Nenhuma.                                                  | Somente leitura; relatórios detalhados e exportação ficam para etapa futura.             |

## Regras transversais

- Toda ação valida usuário autenticado, vínculo ativo, `AffiliationType`, campus/curso e estado do registro.
- Vínculo desativado preserva consulta histórica autorizada, mas não permite iniciar ou alterar fluxos.
- Campus desativado preserva consulta e vínculos, mas congela as alterações em seus recursos; configurações pessoais continuam disponíveis.
- Nenhuma Policy ultrapassa o escopo de campus ou curso do vínculo.
- Auditoria e e-mails compartilham telas entre Administrador do Sistema e Setor de Estágio. A auditoria segue os escopos administrativos próprios; o Setor consulta e-mails de cadastro/alterações do campus e mensagens operacionais de estágios associados ao mesmo campus, conforme Policies. Nenhum dos perfis amplia seu escopo pelo endereço de e-mail do destinatário.
- Nova tentativa de e-mail exige `EmailDeliveryAttemptPolicy::retry`, separada de `view`: Administrador somente no escopo administrativo existente; Setor somente no escopo do próprio campus ativo. Ambos exigem vínculo ativo selecionado e preservado desde a abertura da tela. Outros vínculos não recebem a ação. Campus desativado mantém apenas consulta histórica pelo Setor. A operação exige última falha, menos de três tentativas totais e snapshot utilizável; preserva destinatário/conteúdo e registra o vínculo do novo solicitante. Ver [repetição de transporte](doc:e-mails-notificacoes-e-entregas#nova-tentativa-de-transporte-29-10-2026).
- A mesma pessoa pode atuar por mais de um vínculo; a sessão escolhe apenas um contexto por vez.
- Não há permissões/roles editáveis pelo banco ou interface. Exceções exigem mudança explícita de enum, Policy, teste e documentação.

## Referências

- [Tipos de vínculo](doc:enum-affiliationtype)
- [Detalhamento operacional por vínculo](doc:perfis-e-responsabilidades-por-vinculo)
- [Fase de administração](doc:fase-05-administracao)
- [Trilhas funcionais por vínculo](doc:pessoas-e-responsabilidades)
- [Decisão sobre avaliação](doc:backlog-e-decisoes#d-009-ciclo-e-validade-da-avaliacao-do-supervisor)

## Configuração própria de dados pessoais

Implementada na aba Dados pessoais, com perfil único por conta. Exige identidade autenticada e vínculo ativo selecionado de Discente ou Supervisor; não soma permissões de outros vínculos. Discente não altera campos profissionais; Supervisor não altera RG, nascimento ou endereço. Nome, CPF, login, senha, emancipação e dados de outras pessoas não são aceitos. Policy, Form Request e Action revalidam a autorização, inclusive dentro da transação; o identificador de contexto do formulário serve somente para recusar submissão após troca de vínculo. Campos omitidos são preservados e opcionais vazios podem ser limpos. O endereço atual é exclusivo e alterações preservam referências e snapshots históricos. Campus inativo mantém esta configuração pessoal disponível.

## Gestão de tipos de estágio

- Somente o vínculo ativo selecionado de Setor de Estágio lista, consulta, cadastra, edita, desativa, reativa e exclui tipos do próprio campus, derivado pelo curso; o vínculo global de Administrador do Sistema não concede acesso a esse catálogo.
- Cadastro e troca de curso exigem curso ativo local. Edição permite manter o curso atual desativado; reativação exige curso ativo. Campus desativado permite somente leitura.
- Desativação e exclusão exigem senha atual e confirmação; reativação exige confirmação. A exclusão física só é permitida sem estágios ou solicitações vinculados. Mudanças do catálogo preservam snapshots de estágios formalizados.
- Policies, requisições HTTP, componentes Livewire e Action revalidam o escopo; campus, situação e snapshots não são campos livres do formulário.

## Gestão de usuários e vínculos

- As telas `users.*` são compartilhadas pelos vínculos ativos de Administrador do Sistema e Setor de Estágio; o Setor fica limitado ao campus selecionado.
- O Setor pode cadastrar e editar todos os tipos de vínculo exceto Administrador do Sistema. Tipo, campus e curso são preservados na edição. Supervisor não possui matrícula; seus dados profissionais são opcionais e compartilhados pela conta.
- A consulta explícita de CPF no cadastro pode identificar conta de outro campus ou sem vínculo para acrescentar vínculo local. Listagem, detalhes, opções de matrícula e edição não expõem vínculos externos.
- O Setor pode editar os próprios dados de acesso mesmo quando possui também um vínculo de Administrador do Sistema; a exceção não permite editar contas de outros administradores.
- Desativação e exclusão exigem senha atual e confirmação para ambos os perfis administrativos. O vínculo selecionado na sessão não pode ser desativado nem excluído; vínculos não selecionados da própria conta seguem as mesmas permissões, escopo e regras aplicáveis aos demais vínculos. A exclusão exige ausência de referências.
- Dados pessoais da conta e auditoria são preservados na exclusão do vínculo. Exclusão de conta e reativação de vínculos de outras pessoas continuam exclusivas do Administrador do Sistema; o Setor pode reativar um vínculo local próprio, respeitando confirmação, escopo e duplicidade.

## Gestão direta de partes concedentes

Somente o vínculo ativo selecionado de Setor de Estágio lista, consulta, cadastra, edita, desativa, reativa e exclui concedentes do próprio campus. Administrador do Sistema e outros perfis não herdam acesso a esse catálogo. Campus desativado permite somente consulta; vínculo desativado não autoriza acesso. Desativação e exclusão exigem senha atual e confirmação, e reativação exige confirmação. Exclusão física acompanhada do endereço próprio exige ausência de estágios, solicitações de estágio e solicitações de cadastro vinculados. Edição pode manter concedente desativada, sem alterar campus ou situação. Novas associações exigem cadastro ativo, preservando as existentes e seus snapshots. `GrantingPartyPolicy` protege rotas, ações transacionais e requisições Livewire. A concedente não recebe conta nem permissão de autoaprovação.

## Calendário de feriados

Somente o Administrador do Sistema ativo selecionado cadastra, altera, exclui/restaura feriados e recorrências, mantém importações, revisa pendências e consulta a auditoria do calendário. Setor de Estágio ativo selecionado tem somente leitura de todos os feriados e recorrências, sem restrição automática por UF, município ou campus. Não há propriedade de calendário por campus. Os filtros são opcionais; o cálculo inicial do estágio usa feriados nacionais, estaduais e municipais aplicáveis à cidade do endereço histórico do local de trabalho. Outros perfis não recebem acesso. Ver [Calendário de feriados](doc:calendario-de-feriados).

## Abertura de estágio implementada — 16/10/2026

Discente lista e consulta somente solicitações do vínculo selecionado; cria/edita no campus e curso ativos, envia com validação completa e ciência, corrige apenas seções liberadas e desiste somente antes de haver estágio. Nem outro vínculo da mesma conta herda a posse. Policies e Actions revalidam identidade, contexto, curso/campus, disponibilidade das opções e estado; as mutações relêem e bloqueiam os registros em transação. Rascunhos e Activity Log não são expostos ao Setor ou a outros discentes pela nova caixa.

Setor do campus consulta solicitações enviadas, aprova/associa cadastros locais, analisa a última evidência, devolve grupos com mensagem por seção, recusa antes da formalização e aceita confirmando ou alterando o orientador escolhido pelo Discente. Para supervisor já cadastrado, seleciona a qualificação congelada no estágio. Campus inativo permite consulta, bloqueando decisões. Coordenador, Supervisor e Administrador do Sistema não herdam essas permissões. O comprovante é privado do proprietário e do Setor do campus; e-mails/auditoria não recebem arquivo ou metadados.

## Avaliação do supervisor implementada

Somente Setor de Estágio ativo selecionado no campus solicita a avaliação no estágio elegível e revisa respostas liberadas. Somente Supervisor ativo selecionado responsável pelo estágio consulta e responde sua avaliação após liberação; a posse pertence ao vínculo, inclusive quando a conta possui outros vínculos. Coordenador, Discente, Orientador, Direção e Administrador não recebem formulário nem revisão por analogia. Consulta acadêmica já autorizada da resposta aprovada permanece separada.

No detalhe do estágio, Setor consulta todas as avaliações, incluindo estado e histórico, e pode abrir a análise. Coordenação e Orientador consultam somente a avaliação aprovada vigente dentro do seu escopo: a Coordenação vê critérios, valores e sugestões à instituição; o Orientador vê formação, atuação e observações. Ambos veem as demais observações da resposta; somente o Setor vê observações da análise e cancelamento. Discente e Direção de Ensino não veem a avaliação. Consulta não concede poderes de revisão.

Ações relêem e bloqueiam vínculo, estágio, curso, campus, supervisor e resposta e revalidam estado/escopo. Curso/campus inativo e estágio fora de `Released`, `InProgress` ou `Paused` bloqueiam mutações. “Não” grava somente horas faltantes até a carga exigida no snapshot e deve ser devolvido com justificativa; aprovação é proibida. Setor não altera respostas. Cancelamento de `Submitted`/`Returned` pelo proprietário exige motivo. A aprovação com `hours_requirement_met = true` conclui o estágio automaticamente na mesma transação, após selecionar a avaliação vigente e recalcular as notas. Um pedido de cancelamento pendente deve ser decidido antes dessa aprovação.

## Consulta e lançamento de notas

O Setor de Estágio ativo selecionado consulta supervisor, relatório, apresentação e nota consolidada dos estágios autorizados do próprio campus, no detalhe e nos resumos da listagem e do painel, inclusive responsivos. Não lança nem altera notas. A consulta usa valores e pesos já registrados, mostra “Pendente” para ausências e preserva zero; permanece disponível no histórico de campus/curso desativado e de estágios concluídos ou cancelados conforme a permissão de visualizar o estágio. Outro campus continua negado.

Somente o vínculo selecionado de Orientador exatamente associado ao estágio continua autorizado a lançar relatório e apresentação, observadas as restrições de edição existentes. Um vínculo adicional de Orientador na mesma conta não permite ao Setor editar pela tela ou por chamada direta a `saveGrades`/`UpdateAdvisorGrades`. Coordenador, Orientador, Discente, Supervisor e Direção de Ensino mantêm suas permissões atuais. A consulta de notas não amplia acesso às respostas, critérios ou observações da avaliação do supervisor e não altera cálculo ou notificações.

## Operações de ciclo e assinatura

Somente o Setor ativo selecionado do campus pode disponibilizar documentos, conferir assinaturas, liberar, concluir ou cancelar o estágio. Toda gravação relê e bloqueia vínculo, estágio, curso e campus, revalida a Policy e registra autoria. Liberação exige documentos principais vigentes assinados; conclusão manual exige confirmação da carga horária. Discente só solicita/retira cancelamento do próprio estágio não encerrado. Assinados, cancelados e pedidos finais não são reabertos por este fluxo.
