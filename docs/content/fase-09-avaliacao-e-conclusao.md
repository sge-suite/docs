---
id: fase-09-avaliacao-e-conclusao
title: Fase 09 — Avaliação e conclusão
description: Checklist de avaliações, notas, requisitos de encerramento e conclusão do estágio.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/avaliacao, sge/checklist
related: fluxos-principais, migration-18-supervisor-evaluations, backlog-e-decisoes
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/ManageSupervisorEvaluation.php, https://github.com/sge-suite/sge/blob/master/app/Actions/UpdateAdvisorGrades.php, https://github.com/sge-suite/sge/blob/master/app/Actions/NotifyInternshipEvaluationResults.php, https://github.com/sge-suite/sge/blob/master/resources/views/emails/internship-evaluation-result.blade.php
---
Base: [avaliação e conclusão](doc:fluxos-principais#6-acompanhamento-academico-e-conclusao). O ciclo de resposta, a origem dos pesos e o contrato do formulário fixo estão definidos na [modelagem final da avaliação](doc:migration-18-supervisor-evaluations).

O fluxo do supervisor, o cálculo e a conclusão estão implementados. A aprovação com carga horária cumprida conclui o estágio na mesma transação; o Setor também pode concluir manualmente, confirmando o cumprimento integral.

O formulário de avaliação exibe o e-mail institucional do Setor de Estágio do campus para dúvidas. O botão copia o endereço e confirma a ação por toast; esse contato não altera os destinatários das notificações da avaliação.

## Decisão antes do código

- [x] O Setor solicita manualmente no estágio liberado (`Released`, `InProgress` ou `Paused`), com curso/campus e supervisor ativos.
- [x] Mapear critérios, escala e regras condicionais do formulário fixo de avaliação.
- [x] Definir os pesos e valores dos conceitos por tipo de estágio, com congelamento no snapshot do estágio.
- [x] Reabrir o mesmo formulário quando devolvido e usar como vigente o aprovado mais recente.
- [x] Definir que o Setor de Estágio aprova ou devolve sem editar a resposta do supervisor.
- [x] Definir que o Orientador lança as notas de relatório e apresentação.
- [x] Definir que as três notas já são contribuições na escala dos pesos e que a nota final é sua soma.
- [x] Registrar a decisão em [D-009](doc:backlog-e-decisoes#d-009-ciclo-e-validade-da-avaliacao-do-supervisor).

## Implementação

- [x] Usar `EducationLevel` com “Graduação” e preparar a cópia da qualificação congelada em `supervisor_snapshot` pela Action `PrepareSupervisorEvaluationReference`, sem gravação automática.
- [x] Integrar a cópia à tela de avaliação, permitindo confirmar os dados de referência ou informar outros sem alterar o perfil.

- [x] Registrar a liberação no estágio e notificar o supervisor pelo vínculo e canal permitido.
- [x] Permitir salvamento explícito de rascunho em Livewire, com campos nulos até o preenchimento completo.
- [x] Validar campos obrigatórios e condicionais antes do envio conforme o ramo da carga horária.
- [x] Exibir ao supervisor sua lista de avaliações por estágio, sem exclusão física ou acesso ao Activity Log.
- [x] Congelar a resposta após o envio e reabrir o mesmo registro quando houver devolução.
- [x] Permitir aprovar ou devolver pelo Setor de Estágio, sem alterar respostas.
- [x] Devolver a resposta com motivo quando a carga horária não estiver cumprida e permitir cancelamento auditável pelo supervisor.
- [x] Selecionar em transação a avaliação aprovada mais recente.
- [x] Calcular nota do supervisor usando snapshot do tipo.
- [x] Implementar o lançamento, pelo Orientador, das notas de relatório e apresentação.
- [x] Calcular nota consolidada conforme pesos congelados.
- [x] Verificar carga horária e requisitos de encerramento.
- [x] Manter estágio em andamento enquanto a carga horária integral não estiver confirmada, sem bloqueá-lo por avaliações ou notas pendentes.
- [x] Concluir preservando notas, documentos, snapshots e histórico.
- [x] Notificar envolvidos sobre a conclusão.
- [x] Enviar ao vínculo discente o aceite da avaliação do supervisor com sua nota e a confirmação de conclusão, independentemente das notas acadêmicas.
- [x] Enviar separadamente a avaliação final ao vínculo discente apenas com as três notas preenchidas e válidas, usando a nota consolidada do sistema e reserva única por estágio.
- [x] Preservar destinatário/conteúdo nas tentativas e não emitir novo aviso automático por alteração posterior da nota final, conforme decisão do responsável.
- [ ] Definir, se necessário, política específica para avisos de retificação da nota final.

> [!warning] Nota mínima
> Não há nota mínima de aprovação configurada. Não criar corte acadêmico enquanto essa regra não for informada no tipo de estágio.

## Regra condicional e validação pendente

A primeira pergunta confirma a carga horária. “Não” exibe e grava somente horas faltantes positivas, até a carga exigida congelada no estágio; pode ser enviada, mas o Setor deve devolver com justificativa. “Sim” permite confirmar/editar a cópia profissional e preencher os dez critérios com valores do snapshot. A devolução reabre o mesmo registro, que pode ser reenviado como “Sim”. A aprovação com `hours_requirement_met = true` conclui o estágio automaticamente na mesma transação, após selecionar a avaliação vigente e recalcular as notas. Um pedido de cancelamento pendente deve ser decidido antes dessa aprovação. Não foram criados ou executados testes nesta entrega; validar funcionalmente autorização, concorrência e entrega real permanece pendente.

## Encerramento do roteiro atual

Os dois eventos e seus destinatários estão descritos no [contrato de e-mails](doc:e-mails-notificacoes-e-entregas#aceite-da-avaliacao-do-supervisor-e-conclusao-da-pratica). O legado confirma o aviso de supervisor/conclusão ao discente; a criação do aviso final e a ausência de novo envio automático após alterações foram confirmadas pelo responsável em 22/10/2026. As mensagens usam o nome do tipo de estágio congelado, identificação do estágio e tabelas de resultados, sem observações do supervisor nem ampliação das Policies. O aceite e o lançamento das notas reservam mensagens na transação e despacham o transporte após commit. A conclusão manual mantém seu aviso próprio e não simula aceite da avaliação.

Conferências desta alteração: Pint, análise estática dos PHP afetados e compilação Blade pelo Sail; renderização HTML/texto dos dois avisos com dados fictícios e inspeção visual local; validação de links e build da documentação. Não foram criados nem executados testes, migrations ou envios reais. Essas conferências não comprovam regras funcionais, autorização ou concorrência em execução; a validação operacional permanece pendente.

[Índice das fases de desenvolvimento](doc:fases-de-desenvolvimento)

A solicitação da avaliação permanece no detalhe do estágio, com atualização da tela e toast de enfileiramento, sem redirecionamento para o formulário. Os e-mails operacionais ficam disponíveis nos logs do Setor conforme o campus do estágio.

## Interface da avaliação

O formulário segue o padrão visual da solicitação do Discente: progresso, navegação lateral no desktop e seletor de etapa no celular, campos Flux e seletores personalizados `x-select`, rodapé com ações e revisão final com atalhos de edição. Carga horária cumprida usa cinco etapas (carga, qualificação, critérios, comentários e revisão); carga pendente usa somente carga e revisão. Avançar valida as etapas anteriores e salva o rascunho; o botão de rascunho permite salvar preenchimento parcial. Erros levam à etapa correspondente, com foco e rolagem respeitando redução de movimento. O envio continua sujeito às validações e permissões da Action. Respostas enviadas iniciam na consulta consolidada; o cancelamento permitido exige motivo em modal.

A listagem segue o padrão de linhas clicáveis com link real no identificador, sem botão separado de consulta. No contexto do Setor, a página da avaliação é uma consulta consolidada no padrão da análise da solicitação: dados do estágio e do supervisor, carga horária, qualificação, critérios, comentários, decisão e histórico de auditoria. O Setor não recebe navegação por etapas nem campos de resposta. O formulário por etapas permanece exclusivo da experiência do Supervisor autorizado.

## Consulta da avaliação no detalhe do estágio

O Setor vê no próprio estágio a lista de avaliações e seus estados, respostas e decisões, com link para abrir a análise de cada uma. Coordenação de Curso e Orientador veem somente a avaliação aprovada vigente, dentro dos estágios que já podem consultar. A Coordenação vê os dez critérios, seus valores e as sugestões à instituição; o Orientador vê os dados de formação e atuação e as observações, sem critérios ou sugestões. As demais observações da resposta ficam disponíveis aos dois. O Setor pode consultar todas as respostas e seus registros de análise. Discente e Direção de Ensino não recebem a avaliação no detalhe do estágio.

Essa consulta não concede acesso à revisão nem ao formulário. O Coordenador não aprova ou devolve respostas; o Orientador não altera a avaliação nem a nota do supervisor. A tela respeita o vínculo ativo selecionado e a relação do curso ou da orientação com o estágio.

No aceite, o e-mail do Supervisor reúne a aprovação e a confirmação de estágio concluído. O aviso de conclusão ao mesmo vínculo permanece somente interno nessa operação, evitando o segundo e-mail. Discente e Orientador mantêm seus fluxos próprios, e a nota final continua separada. Todos os novos e-mails identificam o nome e o vínculo/contexto destinatário, inclusive quando o endereço é compartilhado por papéis diferentes.


O preenchimento e a revisão da avaliação indicam alterações pendentes e gravação confirmada, com proteção ao sair da página ou trocar vínculo. As notas do orientador têm um escopo independente: salvar notas não libera a proteção de outro formulário pendente. O estado de gravação só é atualizado após sucesso da Action, sem confundir sincronização Livewire com persistência. As regras de envio, aprovação, acesso e cálculo permanecem as existentes.


## Retomada da avaliação e progresso de preenchimento

O Supervisor autorizado retoma o rascunho na primeira etapa incompleta das respostas salvas. Quando as etapas obrigatórias estão preenchidas, abre a revisão; comentários são opcionais e sua ausência não bloqueia essa retomada. Resposta com carga horária pendente usa somente carga/horas faltantes e revisão, sem contar qualificação, critérios ou comentários ocultos. A validação do preenchimento dessa resposta não significa que a carga horária tenha sido cumprida.

Em avaliação devolvida, o formulário prioriza a primeira etapa incompleta; se todas têm campos válidos, começa pela carga horária para conferir a devolução, mantendo a orientação do Setor e os estados “Corrigir”. Não há definição artificial de seções específicas para a devolução: a revisão existente usa justificativa livre e o Supervisor continua editando somente o que suas permissões já permitem.

Os componentes compartilhados `form-step-navigation` e `form-step-progress` distinguem posição, preenchimento e revisão, com os mesmos estados no seletor móvel. A barra conta somente etapas obrigatórias editáveis válidas; comentários opcionais e revisão não aumentam essa contagem. A conferência usa `validateStep`, sem gravar ou criar erros visuais antes da tentativa de avançar. A retomada não depende de dados guardados no navegador e não armazena novos campos no banco. Avaliações enviadas, aprovadas ou canceladas permanecem na consulta consolidada e não são revalidadas para edição. O envio e as decisões do Setor continuam sob as Actions e Policies existentes.


## Painel do Supervisor

O vínculo ativo de Supervisor recebe um painel próprio com avaliações devolvidas, rascunhos e enviadas ao Setor, com contadores e até cinco registros por situação, ordenados pela atualização mais antiga. Cada cartão identifica discente, matrícula, tipo de estágio congelado, estágio, curso e concedente, com acesso direto à avaliação. “Continuar avaliação” depende da Policy de edição; registros sem edição disponível oferecem consulta. A lista completa mantém o histórico de aprovadas e canceladas.

A consulta exige o vínculo de Supervisor selecionado e limita tanto a avaliação quanto o estágio ao mesmo vínculo, com avaliação liberada. Não mostra respostas, observações ou notas no painel, não amplia acesso e não cria novas notificações. O Setor e os demais papéis conservam seus painéis próprios.
