---
id: fase-08-estagio-em-andamento
title: Fase 08 — Estágio em andamento
description: Checklist de pausas, substituições, aditivos, cancelamento e histórico do estágio.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/estagio, sge/checklist
related: fluxos-principais, migration-17-internship-pauses, migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules, enum-internshipstatus, enum-generateddocumenttype, schedules, fase-09-avaliacao-e-conclusao
source_refs: https://github.com/sge-suite/sge/blob/master/routes/console.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ProjectInternshipEndDate.php, https://github.com/sge-suite/sge/blob/master/app/Actions/UpdateInternshipData.php, https://github.com/sge-suite/sge/blob/master/app/Console/Commands/SyncInternshipExecutionStatuses.php
updated: 2026-10-28
---
Base: [acompanhamento do estágio](doc:fluxos-principais#4-estagio-em-andamento).

As telas do Setor para editar o estágio, consultar a previsão e manter exceções de calendário estão disponíveis. O cálculo considera as regras copiadas para o estágio, pausas, calendário e exceções, e a previsão é atualizada ao salvar mudanças relevantes. Liberação, execução, cancelamento, avaliação e conclusão também estão implementados. A vigência de jornada por aditivo assinado e a reprodução de novos cálculos salvos estão implementadas. Permanecem pendentes os avisos/resumos adicionais.

Salvar a edição do estágio redireciona para seus detalhes, inclusive quando há recálculo por mudança de jornada, datas, pausas ou calendário. Quando a gravação cria um registro histórico de cálculo diferente do anterior, a página de detalhes abre uma vez o modal “Reproduzir cálculo” usando exatamente esse registro. O identificador é transmitido temporariamente pela sessão, associado ao estágio e ao vínculo atual, e consumido pelo componente autorizado do histórico. A reprodução usa a base imutável e confere sua integridade; salvar sem novo registro não abre o modal. O calendário da edição continua sendo uma prévia aberta pelo usuário. Erros de validação mantêm o formulário e seus valores para correção.

## Checklist

- [x] Liberar o estágio pelo Setor de Estágio somente após requisitos documentais e assinaturas.
- [x] Criar `internships:sync-execution-status`, diário e idempotente, para iniciar estágio liberado, pausar execução e retomar pausa encerrada.
- [x] Permitir que o Setor decida manualmente se registra a assinatura, cancela o documento ou abre correção da nova data após analisar o vencimento documental.
- [x] Registrar `internships:sync-execution-status` em `routes/console.php` às 00:05 com `onOneServer` e `withoutOverlapping`.
- [x] Implementar pausas com início/fim em data, motivo e validação de sobreposição; novos períodos só podem ser criados em `InProgress`.
- [x] Sincronizar o status imediatamente ao criar/alterar/remover pausa, além da reconciliação diária.
- [x] Usar calendário nacional, estadual e municipal persistido conforme a cidade/UF do endereço histórico do local de trabalho, sem dependência de rede no cálculo.
- [x] Permitir ao Setor de Estágio liberar ou bloquear uma data específica em `internship_calendar_overrides`, com motivo e auditoria; recessos, folgas, pontes e fechamentos devem ser representados por pausas, não por `holidays`.
- [x] Gravar a jornada inicial em `internships.weekly_hours`; antes da liberação, a edição do estágio pode alterar a jornada e recalcular a previsão. Depois da liberação, a jornada pactuada fica protegida.
- [x] Permitir nova vigência de jornada somente após aditivo com assinaturas conferidas; impedir sobreposição/lacuna e reescrita de dias passados.
- [x] Recalcular a previsão a partir das regras salvas no estágio, jornada, calendário, exceções, pausas e margem.
- [x] Persistir `internships.projected_end_date` após alterações relevantes do estágio e pausas; novos cálculos salvos congelam as entradas efetivas, o calendário resolvido e o resultado em evento imutável.
- [x] Permitir ao Setor substituir orientador ou supervisor ao editar o estágio, validando tipo, campus e vínculo disponível; a operação exige motivo.
- [x] Preservar vínculo anterior, novo vínculo e motivo da substituição no Activity Log; não existe tabela de vigências de participantes.
- [x] Gerar aditivo pelo fluxo documental comum quando houver template de aditivo disponível; sua emissão não cria automaticamente uma nova vigência de jornada.
- [x] Dar ao aditivo ciclo próprio de assinatura.
- [x] Implementar cancelamento com permissão, motivo, Activity Log e notificações.
- [x] Notificar o discente por e-mail após commit, quando o estágio inicia, pausa ou retoma.
- [x] Enviar ao Discente o aviso de término previsto por e-mail quando faltarem de um a sete dias corridos para a previsão persistida. Cada estágio e data prevista têm uma única reserva automática.
- [ ] Criar resumo diário interno, por campus e destinatário do Setor de Estágio, agrupando eventos temporais e pendências sem enviar e-mail ao Setor.
- [x] Disponibilizar telas do Setor para editar dados e regras congeladas do estágio, consultar o calendário projetado e registrar exceções em conjunto com as alterações salvas.
- [x] Permitir que o discente solicite cancelamento antes do início ou durante o andamento.
- [x] Definir a decisão do Setor de Estágio e os efeitos documentais da aprovação do cancelamento.
- [x] Registrar alterações do estágio e decisões no Activity Log; novos cálculos salvos possuem base versionada e reproduzível no evento específico do histórico.

## Referências

- [Migration de pausas](doc:migration-17-internship-pauses).
- [Status do estágio](doc:enum-internshipstatus).
- [Tipo de documento](doc:enum-generateddocumenttype).
- [Schedules](doc:schedules).

## Próxima fase

[Fase 09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao)

## Dependência de calendário

A base local, importação anual e gestão estão implementadas em [Calendário de feriados](doc:calendario-de-feriados). O cálculo da previsão considera feriados persistidos, exceções, pausas e regras copiadas para o estágio, sem chamada externa durante consultas. Alterar o tipo de estágio não muda o snapshot de regras já salvo no estágio. Alterações relevantes do próprio estágio recalculam a data prevista. O evento end_date_calculated agora congela explicitamente as entradas, as datas bloqueadas resolvidas, a versão do algoritmo, o fuso e o resultado. A reprodução usa somente esses dados, sem consultar o calendário atual. Eventos anteriores que não registraram essas entradas não são reconstruídos artificialmente.

## Liberação e cancelamento implementados

“Liberar estágio” exige todos os documentos principais vigentes assinados, grava data/vínculo e sincroniza imediatamente a execução conforme a data e as pausas. “Concluir estágio” exige confirmação da carga integral. O cancelamento pode partir do Discente ou ser iniciado pelo Setor; revisão, retirada e decisão são botões separados. A decisão exige motivo e data efetiva não futura. Cancela documentos não assinados e avaliações pendentes, preservando assinados, aprovadas, notas e histórico. Os envolvidos recebem e-mails personalizados por papel, com registro no histórico de entregas. A listagem do Setor identifica pedidos pendentes e permite filtrá-los. Pedidos de cancelamento pendentes entram no resumo diário interno do Setor, sem e-mail ao Setor. O resumo diário de eventos temporais e a geração automática de rescisão permanecem pendentes.

O aviso de término usa `projected_end_date`, com a margem já incorporada. A rotina diária considera estágios liberados, em andamento ou pausados, em campus ativo, com vínculo Discente ativo do mesmo campus e e-mail válido. Uma nova previsão pode gerar um aviso ao entrar na janela, inclusive quando já faltarem de um a seis dias. Uma data já reservada conserva seu histórico de entrega. O e-mail leva ao detalhe do próprio estágio e não gera notificação interna. Veja [Schedules](doc:schedules) e [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).

## Integrações de jornada e histórico — 23/10/2026

O Setor informa a nova jornada na emissão/registro do aditivo e a aplica pela conferência das assinaturas, sem reescrever dias passados. A proposta é congelada; divergência da previsão ou de outra vigência exige substituição do documento. O histórico de cálculos oferece reprodução das bases salvas a partir desta integração. As decisões sobre documento principal com data vencida usam a lista de documentos e o fluxo de correção existente. Veja os contratos de [vigências](doc:migration-23-internship-work-schedules), [documentos](doc:migration-16-generated-documents) e [cálculo](doc:service-internshipenddatecalculator).


## Conferência antes da liberação

O Setor autorizado a liberar vê os documentos principais vigentes, identificados por número, nome e versão quando disponíveis, com a situação individual das assinaturas. Ausência de documento principal e pedido de cancelamento pendente aparecem como impedimentos. A lista usa os mesmos filtros da liberação: documentos principais não cancelados, todos assinados, e nenhum pedido de cancelamento enviado ou em análise. Aditivos e documentos cancelados não entram nessa conferência.

Os atalhos levam à lista de documentos ou ao pedido de cancelamento. “Liberar estágio” fica indisponível enquanto houver impedimentos conhecidos; a lista pode ser atualizada manualmente e é atualizada por eventos de alteração do estágio/documentos. A conferência não assina documentos nem libera o estágio. A Action mantém a checagem final sob transação, e as permissões existentes continuam limitando o acesso.


## Consulta por término previsto e CSV da Coordenação

Em **Estágios**, use **Término previsto de** e **Término previsto até** isoladamente ou em conjunto. Os extremos são inclusivos e o fim do recorte deve ser igual ou posterior ao início. O recorte usa a previsão vigente (`projected_end_date`), recalculável durante o estágio. **Início previsto** é a data planejada de execução. **Liberação** é a confirmação do Setor para que a execução possa começar. **Conclusão registrada** é a transição para Concluído, após confirmação da carga, e seu horário depende da cobertura da auditoria.

A ordem inicial é por atualização mais recente. Ao ordenar por término previsto, a interface mostra primeiro as datas mais próximas ou mais distantes em ordem cronológica, com desempate pelo maior número do estágio. Os filtros e a busca podem ser combinados e constam na URL. Alterar ou limpar os filtros volta à primeira página. A busca por discente, matrícula e número permanece unificada. O Setor também pode buscar por protocolo e filtrar pedidos de cancelamento pendentes.

A lista do vínculo de Coordenação começa pelos cursos em que o vínculo está designado como titular ou substituto. **Incluir meus orientandos de outros cursos** amplia a consulta para os próprios orientandos no campus. **Baixar CSV dos cursos coordenados** está disponível na visão dos cursos coordenados. O arquivo usa os filtros, a busca e a ordem da lista em todas as páginas. O download revalida o vínculo selecionado e só consulta os cursos coordenados por ele.

O CSV mantém as 14 colunas do legado, nesta ordem.

| Colunas | Fonte no SGE |
| --- | --- |
| Curso, Matrícula, Nome do Aluno | Curso vinculado e matrícula e nome salvos no estágio. |
| Concedente, CNPJ da Concedente | Nome e documento no snapshot da concedente. A coluna CNPJ fica vazia para pessoa física ou dado ausente. |
| Data de Início, Data de Fim | Início previsto e término previsto, em dia/mês/ano. |
| Orientador, Supervisor, Status | Nome vinculado à orientação, nome do supervisor salvo no estágio e rótulo da situação atual. |
| Nota do Supervisor, Nota do Relatório, Nota da Apresentação, Nota Final | Contribuições registradas e nota consolidada oficial. As notas de relatório e apresentação seguem a permissão de consulta da orientação. Notas ausentes, restritas e componentes de peso zero ficam vazios. Uma nota atribuída igual a zero é exportada como zero. |

O arquivo usa vírgulas, UTF-8 com BOM, aspas e quebras de linha compatíveis com CSV. Para manter os zeros iniciais da **Matrícula**, importe essa coluna como **Texto** na planilha. A matrícula é gravada com os dígitos originais no arquivo. Textos que poderiam ser executados como fórmulas recebem um apóstrofo de proteção.

O controller legado aplicava `start_date >= início` e `end_date <= fim`. Esse recorte exige que o estágio inteiro caiba na janela. **Término previsto no período** também alcança estágios iniciados antes do limite quando o término previsto está dentro da janela. Compatibilidade de integrações com o recorte legado, CSV de contatos das concedentes e CSV/ZIP de migração ficam como decisões distintas de produto.

## Filtros complementares comparados com o legado

| Tela | Cobertura no SGE |
| --- | --- |
| Usuários | O legado tem busca e filtros de perfil e situação. O SGE mantém perfil e situação por vínculo e combina nome, CPF completo e e-mail de login completo em uma busca. |
| Cursos | Busca por nome como no legado. O SGE acrescenta situação do cadastro. |
| Tipos de estágio | Busca por nome e seleção de curso como no legado. O SGE acrescenta situação do cadastro. |
| Concedentes | O legado separa nome, documento e cidade na tela e combina nome e cidade na consulta. O SGE busca por nome ou CPF/CNPJ completo e oferece filtros próprios de UF, município, situação e curso com estágio iniciado para o Setor. |
| Avaliações do Supervisor | O legado incluía valores nulos em “Não cumprida”. O Setor agora distingue Cumprida, Não cumprida e Sem resposta, preservando a situação da avaliação na tabela. |
| E-mails | O legado buscava o nome do estagiário associado ao log. O SGE busca pelo endereço de destino registrado e mantém finalidade, situação e autorização do histórico. |
| Locais de estágio | O Discente já tem busca por nome, filtro por município e recorte opcional do próprio curso. O escopo é o cadastro ativo do campus. O detalhe exibe somente cursos com estágio iniciado, junto ao nome e município da concedente. A decisão de oferecer download dessa consulta é separada. |

## Relatórios de estágio

A tela **Indicadores** está no menu do Setor de Estágios e da Coordenação. O Setor consulta o campus do vínculo selecionado. A Coordenação consulta os cursos em que o vínculo está designado como titular ou substituto. A seção **Fluxo documental e acompanhamento** é exclusiva do Setor.

O seletor de indicador usa o componente personalizado `<x-select>` pesquisável com opções agrupadas (`:groups`) e rolagem automática para a opção selecionada. Todos os recortes oferecem filtros de curso, tipo de estágio e período (`De · <data do indicador>` e `Até · <data do indicador>`, com limites inclusivos). O filtro de situação atual aparece apenas nos indicadores com múltiplas situações. Os **5 cartões de resumo geral** no topo (*Total no recorte*, *Em execução ou liberados*, *Concluídos*, *Estágios aditivados* e *Cancelados*) consideram sempre o **Início previsto**; quando o indicador selecionado usa outra data de referência no filtro de período, a legenda abaixo dos filtros deixa essa diferença explícita.

### Gráficos, modais e exportação

As visualizações são renderizadas em **SVG + Alpine.js** (`resources/views/components/internships/indicator-chart.blade.php`), sem biblioteca externa de gráficos, acompanhando o tema claro/escuro do Flux e a cor da marca (`--color-brand`):

- **Rosca (`donut`):** *Situação geral dos estágios* e *Cancelamentos por motivo*, com destaque sincronizado entre fatia e lista e total/percentual exibido no centro.
- **Linha com área (`line`):** *Tempo médio de tramitação por mês* e *Tramitação dos aditivos por mês*, com tooltip no cabeçalho de altura fixa e 4 cartões de estatísticas (**Tramitação média**, **Mediana** via `PERCENTILE_CONT(0.5)`, **Menor tempo** e **Maior tempo**).
- **Histograma colorido (`column`):** *Distribuição das notas finais*, com cores por faixa de desempenho, tooltip fixo e 4 cartões (**Média geral**, **Nota máxima**, **Nota mínima** e **Concluídos com nota**, exibidos também em *Desempenho (notas médias) por curso*).
- **Rosca consolidada + barras empilhadas por curso (`stacked`):** *Encaminhamento dentro do prazo por curso* e *Conclusão dentro do prazo por curso*, combinando o percentual geral no centro da rosca, os 3 cartões (*No prazo*, *Fora do prazo*, *Sem dados*) e o comparativo por curso.
- **Barras horizontais (`bar`):** *Estagiários por curso*, *Carga de orientação por docente*, *Principais concedentes*, *Concedentes por curso*, *Supervisores com mais estagiários (top 5)* e *Desempenho (notas médias) por curso*.

Clicar diretamente em qualquer linha, fatia, coluna, ponto ou cartão abre o **modal de Consulta de registros** (`max-w-7xl`), com tabela paginada de células alinhadas ao topo (`align-top`) e linhas clicáveis para navegar direto ao estágio (`Livewire.navigate`). O botão **Exportar dados** abre o modal de CSV com escolha entre **Registros detalhados** e **Resumo consolidado por grupo**, respeitando todos os filtros ativos. O botão **Como é calculado** (`InternshipIndicators::methodology`) abre um modal em linguagem acessível explicando, para o indicador ativo, quais dados entram na conta, como o cálculo é feito, qual data o período filtra e observações relevantes.

| Indicador | Unidade, período e fontes |
| --- | --- |
| Estagiários por curso | Estudantes únicos por curso, pelo identificador da conta do vínculo Discente. O resumo exibe também o total de estágios e o detalhe lista todos os estágios do grupo. Período pelo início previsto. |
| Carga de orientação por docente | Estágios atribuídos por docente, agrupados pela conta do vínculo de orientação atual. Ausências aparecem em “Orientador não identificado”. Período pelo início previsto. |
| Principais concedentes | Estágios por unidade do cadastro de concedentes. A ausência de associação aparece em grupo próprio. Período pelo início previsto. |
| Concedentes por curso | Unidades do cadastro de concedentes distintas por curso, junto ao total de estágios do curso. Período pelo início previsto. |
| Supervisores com mais estagiários (top 5) | Até cinco supervisores em ordem de estudantes únicos (sem cálculo de média), agrupados por conta. Período pelo início previsto. |
| Distribuição das notas finais | Estágios atualmente Concluídos, pelo início previsto. Usa `consolidated_grade` (0 a 10), agrupando em faixas inteiras (`0 a <1` … `9 a <10`), grupo próprio para `10` e coluna separada para `Sem nota`. |
| Desempenho (notas médias) por curso | Média de `consolidated_grade` dos estágios Concluídos por curso, pelo início previsto. Zeros entram na média; estágios sem nota são contabilizados à parte. |
| Situação geral dos estágios | Um estágio por situação atual, com período pelo início previsto. |
| Cancelamentos por motivo | Estágios Cancelados agrupados pelo motivo consolidado (`report_reason`) ou pela justificativa original (`reason`) normalizada (sem diferenciar maiúsculas/minúsculas ou espaços extras). Período pela data efetiva. O Setor pode selecionar motivos semelhantes e unificá-los via `UnifyCancellationReasons` sem sobrescrever a justificativa original. |
| Encaminhamento dentro do prazo por curso | Estágios por curso e total consolidado, com período pelo início previsto. Combina a liberação inicial (`released_at <= planned_start_date`) e a conferência tempestiva de eventuais aditivos assinados. |
| Conclusão dentro do prazo por curso | Estágios Concluídos comparando a data da transição auditada para `Completed` no `activity_log` com `projected_end_date`. Período pela data de conclusão (ou término previsto quando ausente). |
| Tempo médio de tramitação por mês | Dias corridos (`EXTRACT(EPOCH) / 86400`) da criação do estágio até `released_at`, agrupados pelo mês de criação. Intervalos ausentes ou invertidos ficam fora da média e contabilizados como sem dados. |
| Tramitação dos aditivos por mês | Um aditivo vigente (não cancelado) por linha. Duração em dias corridos entre a emissão/registro e a primeira conferência de assinatura no `activity_log`. Período e agrupamento pela data de emissão/registro. |

### Prazo da liberação e cobertura histórica

- **Encaminhamento no prazo (`release_deadline`):** considera **No prazo** quando a data de liberação inicial (`released_at::date`) é igual ou anterior ao início previsto (`planned_start_date`) **e** nenhum aditivo assinado foi conferido após a data de término vigente antes do aditivo. Para determinar essa data de referência de cada aditivo, o cálculo consulta em ordem: `previous_projected_end_date` no `snapshot` do documento, `previous_projected_end_date` no log `external_document_registered`, a alteração de `projected_end_date` registrada no `activity_log` do estágio em até 60 segundos da conferência do aditivo, `starts_on` do aditivo e, por último, o `projected_end_date` atual do estágio. Estágios sem `released_at` ficam em **Sem dados**.
- **Conclusão no prazo (`completion_deadline`):** considera **No prazo** quando a data da transição auditada para `Completed` é igual ou anterior a `projected_end_date`; **Fora do prazo** quando posterior; e **Sem dados** quando não há evento auditado de conclusão.
- Diferente do legado (que classificava todo estágio com aditivo como atrasado), aditivos conferidos antes do término previsto vigente não contam como atraso. Os **Estágios aditivados** (com pelo menos um aditivo assinado) aparecem no cartão de resumo geral no topo da tela.
- A impressão/exportação em PDF continua pendente de definição de layout; atualmente a exportação é feita em CSV (detalhado ou resumido).
