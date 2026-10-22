---
id: ciclos-de-status
title: Ciclos de status
description: Situações exibidas pelo SGE ao longo da solicitação, do estágio, dos documentos e da avaliação.
type: user-guide
status: observed
visibility: public
tags: sge/dominio, sge/status, sge/fluxos
related: fluxos-principais, pessoas-e-responsabilidades, glossario
source_refs:
---
> [!info] Estado da página
> Os ciclos abaixo descrevem os status e as transições implementados. Início, pausa e retomada do estágio são sincronizados automaticamente; as operações documentais, liberação, conclusão manual e cancelamento são executadas por botões autorizados. A aprovação da avaliação com carga horária cumprida conclui o estágio na mesma transação.

Um estado indica em que ponto o processo está, como “Em análise” ou “Em andamento”. Ele não é um julgamento sobre a pessoa: mostra o que já aconteceu, o que ainda falta e quem pode agir em seguida.

## Solicitação de estágio

| Situação | Significado |
| --- | --- |
| Rascunho | O discente ainda está preenchendo e não enviou a solicitação. |
| Enviada | A solicitação aguarda análise. |
| Em análise | O Setor de Estágio está conferindo as informações. |
| Com pendência | Há uma correção para o discente responder. |
| Aceita | As informações foram aprovadas e o processo segue para formalização. |
| Recusada | O processo foi encerrado pelo Setor de Estágio antes da formalização. |
| Desistida | O discente encerrou a solicitação antes de existir um estágio formalizado. |

Uma solicitação devolvida para correção volta para análise após o novo envio. Ela não é aceita automaticamente.

A retirada pode acontecer antes do aceite. O diagrama mostra os pontos de retirada mais representativos para manter as relações rastreáveis; a regra vale para qualquer solicitação ainda não aceita.

## Estágio

| Situação | Significado |
| --- | --- |
| Em formalização | O estágio foi criado e os documentos estão sendo preparados. |
| Aguardando assinaturas | Os documentos foram encaminhados e aguardam conclusão e conferência das assinaturas. |
| Com pendência de correção | A solicitação de um estágio já criado foi devolvida para ajuste; o estágio volta à formalização quando o Setor aprova a correção. |
| Liberado | As assinaturas foram conferidas; o estágio aguarda ou alcançou sua data de início. |
| Em andamento | O estágio está em execução. |
| Pausado | Há uma pausa válida no período. |
| Concluído | A carga horária integral do estágio foi cumprida. |
| Cancelado | O processo foi encerrado sem conclusão. |

Uma pausa executada só é registrada para estágio em andamento ou pausado. Quando a pausa começa ou termina, a Action atualiza a situação imediatamente; o schedule diário também sincroniza datas que mudaram sem interação. Essas transições notificam o discente. A conclusão não acontece apenas porque a data prevista de término chegou: é preciso confirmar o cumprimento da carga horária.

O diagrama mostra os caminhos representativos de cancelamento antes e durante a execução. A regra completa é que um estágio ainda não concluído pode ser cancelado; as exceções e a autorização aplicável ficam registradas no histórico do processo.

## Documentos

| Situação | Significado |
| --- | --- |
| Gerado | O documento foi preparado pelo SGE. O registro operacional de documento externo ainda não está disponível. |
| Aguardando assinatura | Está disponível ou foi encaminhado para assinatura externa. |
| Assinado | A assinatura foi concluída e conferida. |
| Cancelado | O documento foi invalidado ou substituído. Isso não cancela automaticamente o estágio. |

## Avaliação do supervisor

| Situação | Significado |
| --- | --- |
| Rascunho | O supervisor pode preencher a avaliação aos poucos. |
| Enviada | A resposta foi enviada e aguarda análise. |
| Devolvida | O Setor de Estágio informou o motivo; o mesmo formulário pode ser corrigido e reenviado. |
| Aprovada | A avaliação foi aceita pelo Setor de Estágio. |
| Cancelada | A avaliação foi encerrada com motivo e permanece no histórico. |

A avaliação do supervisor e as notas do orientador formam o acompanhamento acadêmico do estágio. A aprovação com `hours_requirement_met = true` conclui o estágio automaticamente na mesma transação, após selecionar a avaliação vigente e recalcular as notas. Um pedido de cancelamento pendente deve ser decidido antes dessa aprovação. O Setor também pode confirmar a carga integral pelo botão de conclusão manual.

## Continue a leitura

- [Fluxos principais](doc:fluxos-principais) para ver a ordem das etapas.
- [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) para saber quem atua em cada situação.
- [Glossário](doc:glossario) para consultar os termos usados aqui.

O documento nasce `Generated`. Disponibilizar para assinatura exige local textual; avisar interessados é opcional e, quando marcado, exige ao menos um contato elegível. Conferir assinaturas muda para `Signed`; cancelar exige motivo. `Signed` e `Cancelled` são finais, e atestados não passam por assinatura.
