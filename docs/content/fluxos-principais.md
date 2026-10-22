---
id: fluxos-principais
title: Fluxos principais
description: Jornada pública de abertura, formalização, acompanhamento e conclusão de estágios.
type: functional-flows
status: observed
visibility: public
tags: sge/fluxos
related: pessoas-e-responsabilidades, ciclos-de-status, glossario
source_refs:
diagram: fluxos-principais-jornada
---
> [!info] Estado da página
> Esta página descreve os fluxos já implementados. Lacunas específicas, como registro de documentos externos, vigências formais de jornada após aditivo e avisos adicionais, permanecem nas [fases de desenvolvimento](doc:fases-de-desenvolvimento).

Para saber quem atua em cada etapa, consulte [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades); os status ficam em [Ciclos de status](doc:ciclos-de-status).

## Visão da jornada

{{diagram:fluxos-principais-jornada}}

O [fluxograma do estágio](../diagrams/fluxograma-do-estagio.html) oferece uma visão visual detalhada da solicitação até a liberação. Ele representa essa parte da jornada; esta página complementa o restante do processo.

## 1. Acesso e vínculo

Cada pessoa acessa o SGE com a própria conta e escolhe a atuação com que quer trabalhar. Essa atuação é o vínculo. Ela define as informações que a pessoa pode consultar e as ações que pode executar no campus ou curso correspondente.

Uma pessoa que possui mais de um vínculo pode trocar de contexto quando necessário. O sistema não mistura as permissões dessas atuações.

## 2. Solicitação

O Discente inicia e salva uma solicitação incompleta como rascunho; somente o envio completo inicia a análise. Seleciona o período acadêmico permitido pelo tipo e um orientador ativo do campus. Se a concedente ou o supervisor ainda não estiver cadastrado, pode enviar uma proposta tipada junto com a abertura; o Setor associa os registros antes de aceitar o estágio. Depois do envio, o Discente acompanha a situação e responde às correções pedidas pelo Setor.

Se a solicitação precisar de ajuste, o Setor informa o que deve ser corrigido. O discente trabalha na mesma solicitação e a reenvia para nova análise. Antes da formalização, também pode desistir do pedido.

## 3. Análise e formalização

O Setor de Estágio confere a solicitação. Pode aceitá-la, recusá-la ou devolvê-la com pendências. O aceite cria a etapa de formalização.

Na formalização, o Setor prepara o documento apropriado, informa onde ele estará disponível para assinatura e avisa os interessados selecionados. A assinatura acontece externamente e é conferida pelo Setor de Estágio. Somente depois dessa conferência o estágio é liberado.

Se uma informação importante precisar mudar antes da liberação, a correção é registrada no processo e o documento necessário pode ser emitido novamente. Um documento já assinado é preservado como histórico.

## 4. Estágio em andamento

O estágio inicia na data planejada depois de sua liberação. A previsão de término é calculada a partir da carga horária, da jornada, do calendário aplicável e das pausas registradas.

As operações disponíveis incluem:

- registrar uma pausa, com período e motivo;
- solicitar o cancelamento do estágio.

Uma pausa suspende o cômputo da carga horária e atualiza a previsão de término, mas não altera a jornada. O registro de novas vigências de jornada após aditivo assinado ainda não está integrado.

O discente pode solicitar cancelamento, sempre informando o motivo. O Setor de Estágio analisa o pedido e trata seus efeitos sobre documentos e acompanhamentos pendentes.

## 5. Avisos automáticos

Algumas situações são atualizadas pela passagem do tempo: o SGE inicia o estágio já liberado na data planejada, registra o início de uma pausa válida e retoma o estágio quando ela termina.

O sistema avisa o discente sobre início, pausas e retomada; também envia avisos de domínio para eventos implementados de avaliação, assinatura, cancelamento e conclusão. O aviso de término previsto ainda não está implementado. Esses avisos não substituem a análise humana: o sistema não confirma assinaturas, não decide cancelamentos e não conclui o estágio apenas pela chegada da previsão.

## 6. Acompanhamento acadêmico e conclusão

O Setor de Estágio solicita explicitamente a avaliação no detalhe do estágio formalmente liberado, em `Released`, `InProgress` ou `Paused`, com curso/campus e supervisor ativos. A liberação é registrada no estágio e, após commit, o vínculo supervisor recebe aviso interno e e-mail. A avaliação passa a aparecer na lista desse vínculo; o supervisor não inicia uma avaliação por conta própria.

A primeira pergunta é “A carga horária exigida para este estágio foi cumprida?”. Em “Não”, o supervisor informa somente quantas horas faltam, com valor positivo até a carga exigida no snapshot. Qualificação, critérios e comentários não são exibidos nem gravados. Essa resposta pode ser enviada, mas o Setor deve devolvê-la com justificativa e não pode aprová-la. A devolução reabre o mesmo formulário; posteriormente ele pode ser reenviado como “Sim”.

Em “Sim”, o supervisor confirma ou edita a cópia dos dados profissionais de referência, sem alterar perfil ou snapshot, e responde aos dez critérios com escala e pesos congelados no estágio. Os comentários são opcionais. O envio congela a resposta. O Setor do campus aprova ou devolve sem editar respostas; o supervisor pode cancelar uma resposta enviada ou devolvida com motivo, preservando seu histórico.

A aprovação seleciona em transação a avaliação aprovada mais recente e recalcula nota do supervisor e consolidada com `InternshipGradeCalculator`. Respostas pendentes, devolvidas e canceladas preservam a vigente anterior. A aprovação com `hours_requirement_met = true` conclui o estágio automaticamente na mesma transação, após selecionar a avaliação vigente e recalcular as notas. Um pedido de cancelamento pendente deve ser decidido antes dessa aprovação. O orientador continua registrando as notas acadêmicas sob sua responsabilidade.

O Setor também pode concluir manualmente pelo botão “Concluir estágio”, confirmando o cumprimento integral da carga horária. A avaliação e as notas são registros acadêmicos que acompanham o processo, mas não bloqueiam essa conclusão.

O vínculo discente recebe dois avisos acadêmicos separados: no aceite do Setor, a nota da avaliação do supervisor e a confirmação de estágio concluído; quando supervisor, relatório e apresentação estiverem preenchidos e válidos, as três notas e a nota final calculada pelo SGE. O primeiro não espera as notas do Orientador. O segundo é reservado uma única vez por estágio; alterações posteriores não geram novo aviso automático nem modificam o histórico. Os avisos internos e as permissões existentes continuam em vigor, sem envio adicional para endereços institucionais. Veja [gatilhos, conteúdo e destinatários](doc:e-mails-notificacoes-e-entregas#aceite-da-avaliacao-do-supervisor-e-conclusao-da-pratica).

## Continue a leitura

- [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) para conhecer os papéis.
- [Ciclos de status](doc:ciclos-de-status) para entender as situações do processo.
- [Glossário](doc:glossario) para consultar termos do SGE.

## Operações disponíveis na gestão

As mudanças de situação são ações por botões, com confirmação e efeitos próprios; não há seletor de status. O Setor disponibiliza documentos para assinatura, confere assinaturas, libera, conclui ou cancela o estágio. O Discente pode solicitar ou retirar cancelamento; o Setor inicia análise, aprova ou recusa com justificativa. Motivos podem ser digitados ou reaproveitados do histórico autorizado do campus. Cancelar preserva documentos assinados, avaliações aprovadas e notas, encerrando documentos não assinados e avaliações pendentes. A geração automática de rescisão continua pendente do contrato de variáveis.

O aviso de assinatura permite selecionar contatos elegíveis e escrever um complemento individual por destinatário. Pessoas com vínculo recebem aviso interno e e-mail; o contato cadastrado da concedente recebe somente e-mail. Não há destinatário livre. O local de assinatura é informado pelo Setor, sem plataforma fixa.

Nos formulários de abertura do estágio e avaliação do supervisor, o e-mail institucional do Setor de Estágio do campus é exibido para dúvidas e pode ser copiado por um botão com confirmação em toast. O e-mail institucional da Coordenação é exibido nos dados do curso. Esses endereços servem como contatos e não alteram atualmente os destinatários das notificações.
