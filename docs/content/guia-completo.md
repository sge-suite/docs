---
id: guia-completo
title: Guia completo do SGE
description: Referência única do Sistema de Gestão de Estágios, preparada para leitura contínua e exportação em PDF.
type: user-guide
status: observed
visibility: public
tags: sge/guia, sge/produto, sge/pdf
related: home, visao-geral, pessoas-e-responsabilidades, fluxos-principais, ciclos-de-status, glossario, planejamento, arquitetura-atual
source_refs: https://github.com/sge-suite/sge/blob/master/routes/web.php, https://github.com/sge-suite/sge/blob/master/routes/settings.php, https://github.com/sge-suite/sge/blob/master/config/fortify.php, https://github.com/sge-suite/sge/blob/master/composer.json
diagram: guia-completo-jornada
---
> [!abstract] Leitura única
> Esta é a versão consolidada da documentação do SGE. Ela foi escrita para leitura contínua e impressão em PDF: contém apenas um diagrama compacto, sem Canvas ou mapas grandes. As páginas vinculadas ao final aprofundam cada assunto quando necessário.

> [!info] Estado do produto
> Este guia descreve o comportamento implementado no código. Funcionalidades específicas ainda pendentes aparecem nas fases correspondentes; decisões futuras do produto estão separadas em [Planejamento](doc:planejamento).

## 1. O que é o SGE

O Sistema de Gestão de Estágios (SGE) centraliza a solicitação, a formalização, o acompanhamento e a conclusão de estágios. Ele reduz a dependência de formulários dispersos, e-mails e planilhas, deixando claro o que falta, quem precisa agir e qual informação está válida para cada processo.

O sistema trabalha com uma conta por pessoa e, quando aplicável, com um **vínculo** institucional. O vínculo informa a atuação da pessoa — por exemplo, discente, orientador ou integrante do Setor de Estágio — e limita o campus, o curso e as ações disponíveis naquele contexto.

## 2. Como interpretar este guia

| Marca | Significado |
| --- | --- |
| **Implementado** | O comportamento existe no código; validação automatizada ou operacional ainda pode estar pendente. |
| **Definido** | A regra foi aprovada para o produto, mas sua implementação completa ainda está pendente. |
| **Planejado** | O trabalho ainda não começou ou depende de decisão anterior. |

No estado atual, login, recuperação de senha, dashboard, seleção e troca de vínculo, configurações próprias de senha/e-mail e `admin:create` estão disponíveis. Em **Dados pessoais**, Discente e Supervisor editam os campos permitidos ao vínculo. A abertura cobre rascunho, envio, análise, correção, cadastros pendentes e aceite; o Setor associa referências aprovadas e cria o estágio. A gestão do estágio cobre documentos DOCX/PDF, assinaturas, liberação, calendário, pausas, sincronização temporal, cancelamento, avaliação, notas e conclusão. O Administrador do Sistema administra campi e vínculos globais; o Setor administra o próprio campus, cursos, tipos, concedentes, usuários/vínculos e operações de estágio. As ações respeitam o vínculo ativo selecionado e Policies por campus/curso/registro. Permanecem pendentes o registro operacional de documentos externos, a vigência de jornada após aditivo assinado, a reprodução integral do cálculo histórico, o aviso de término previsto e resumos temporais adicionais. Consulte [Fases de desenvolvimento](doc:fases-de-desenvolvimento) para a lista atualizada.

Campus e curso guardam, respectivamente, o e-mail institucional do Setor de Estágio e da Coordenação. Os endereços aparecem nos detalhes de campus/curso. O e-mail do Setor também é mostrado como contato para dúvidas nos formulários de abertura e avaliação do supervisor; nesses dois pontos, um botão copia o endereço e confirma por toast. Esses campos não substituem os endereços individuais usados pelas notificações atuais.

## 3. Quem participa

| Pessoa ou setor | Responsabilidade principal | Limite importante |
| --- | --- | --- |
| Discente | Inicia a solicitação, responde correções e acompanha o próprio estágio. | Não aprova a própria solicitação nem confirma assinaturas. |
| Setor de Estágio | Mantém dados e cursos do próprio campus; analisa processos, formaliza, confere assinaturas, libera o estágio e trata pendências. | Não administra outros campi nem reescreve respostas do discente ou do supervisor. |
| Supervisor | Acompanha o discente no local de estágio e preenche a avaliação quando liberada. | Não aprova a própria avaliação nem lança notas acadêmicas. |
| Orientador | Acompanha a dimensão acadêmica e registra as notas sob sua responsabilidade. | Não substitui o supervisor na avaliação nem conduz a formalização. |
| Coordenador de curso | Consulta o acompanhamento do curso e emite o atestado de orientação previsto. | Não herda as tarefas operacionais do Setor de Estágio. |
| Administrador do Sistema | Mantém a estrutura institucional geral. | Não passa a operar estágios por ter esse vínculo. |
| Direção de Ensino | Consulta informações institucionais quando autorizada. | O escopo de relatórios ainda depende de definição institucional. |

## 4. Jornada do estágio

{{diagram:guia-completo-jornada}}

O fluxo completo admite correções sem criar outro processo: quando uma solicitação ou avaliação é devolvida, a mesma pessoa corrige e reenvia o mesmo registro. A decisão continua com o Setor de Estágio e o histórico preserva as alterações relevantes.

### 4.1 Solicitação e análise

O Discente inicia a solicitação, pode salvá-la incompleta como rascunho e envia para análise somente quando os dados obrigatórios estiverem completos. Escolhe um período permitido pelo tipo de estágio e um orientador ativo do campus. Se a concedente ou o supervisor ainda não estiver cadastrado, pode enviar a proposta de cadastro completa junto com a abertura. O Setor analisa, associa os cadastros aprovados antes do aceite, aceita, recusa ou devolve com mensagens por seção. Um discente pode desistir antes de existir um estágio formalizado.

A data de nascimento determina a maioridade; somente menores escolhem entre menor e menor emancipado. O estágio exige sete dias corridos de antecedência em cada envio. Salvar dados pessoais na abertura atualiza o perfil compartilhado; o envio congela snapshots do processo.

### 4.2 Formalização

Depois do aceite, o estágio nasce em formalização. O Setor prepara o documento aplicável, informa onde ele estará disponível para assinatura e seleciona os participantes que precisam ser avisados. A assinatura ocorre fora do SGE e precisa ser conferida antes da liberação.

O SGE registra o processo e suas referências, mas não guarda o arquivo DOCX/PDF final ou o documento assinado. Templates, versões, dados resolvidos e histórico são tratados separadamente para preservar rastreabilidade sem duplicar acervo documental externo.

### 4.3 Execução, mudanças e encerramento

Após a liberação, o estágio passa automaticamente para em andamento na data planejada, ou para pausado se já houver uma pausa vigente. Pausas suspendem o cômputo da carga horária e atualizam a previsão de término; alterações dos dados do estágio, regras e exceções são salvas pelo Setor na edição e recalculam a previsão quando afetam o calendário. Mudanças formais de jornada ainda dependem do fluxo documental de aditivo. Cancelamentos exigem motivo, decisão do Setor e preservação do histórico.

O supervisor preenche a avaliação quando ela for liberada e o orientador registra as notas acadêmicas. A conclusão do estágio depende da confirmação de que a carga horária integral foi cumprida; a data prevista, as avaliações e as notas não concluem o estágio sozinhas.

## 5. Situações exibidas no processo

### Solicitação de estágio

| Situação | O que significa |
| --- | --- |
| Rascunho | O discente ainda está preenchendo e não enviou. |
| Enviada | A solicitação aguarda análise. |
| Em análise | O Setor de Estágio está conferindo as informações. |
| Com pendência | Há uma correção para o discente responder. |
| Aceita | O processo segue para formalização. |
| Recusada | O processo foi encerrado antes da formalização. |
| Desistida | O discente encerrou a solicitação antes da criação do estágio. |

### Estágio

| Situação | O que significa |
| --- | --- |
| Em formalização | O estágio foi criado e os documentos estão sendo preparados. |
| Aguardando assinaturas | Os documentos aguardam conclusão e conferência das assinaturas. |
| Com pendência de correção | Uma solicitação vinculada a estágio existente foi devolvida para ajuste; após a aprovação da correção, o estágio volta à formalização. |
| Liberado | As assinaturas foram conferidas; o estágio aguarda ou alcançou o início. |
| Em andamento | O estágio está em execução. |
| Pausado | Há uma pausa válida no período. |
| Concluído | A carga horária integral foi confirmada. |
| Cancelado | O processo terminou sem conclusão. |

### Documentos e avaliação

| Área | Situações | Regra central |
| --- | --- | --- |
| Documento | Gerado, aguardando assinatura, assinado, cancelado. | Cancelar um documento não cancela automaticamente o estágio. |
| Avaliação do supervisor | Rascunho, enviada, devolvida, aprovada, cancelada. | A aprovação exige carga horária cumprida e conclui o estágio na mesma transação. |

## 6. Regras de dados, segurança e privacidade

- Cada ação é autorizada pelo vínculo ativo, pelo escopo institucional, pela relação com o registro e pela situação do fluxo.
- Dados sensíveis, como CPF, dados de responsável legal e comprovantes de emancipação, têm acesso restrito e não devem aparecer em avisos gerais, e-mails, documentos gerados ou logs detalhados.
- Alterações relevantes preservam histórico. Dados usados em um estágio podem ser congelados em snapshots para que uma mudança posterior de cadastro não altere o processo já formalizado.
- Recuperação de senha usa o fluxo do Fortify. Tokens, URLs assinadas, senhas e credenciais nunca devem ser preservados em conteúdo, logs ou auditoria.
- Não há confirmação adicional de endereço de e-mail no escopo atual.
- Notificação dentro do sistema e envio de e-mail são trilhas separadas: uma falha de entrega não pode ocultar o aviso no SGE.

## 7. Estado atual e próximos blocos de trabalho

| Área | Estado | Próximo resultado esperado |
| --- | --- | --- |
| Preparação do projeto | **Concluída** | Manter ambiente, qualidade e fluxo de revisão. |
| Conta e autenticação | **Implementada parcialmente** | Contexto, `admin:create`, administração de contas/vínculos administrativos, alteração própria de senha/e-mail e avisos existem; edição própria de dados pessoais e qualificações também está disponível. |
| Fundação técnica | **Implementada parcialmente** | Schema, Models, Policies, Actions e interfaces para os fluxos atuais estão disponíveis; ficam pendentes validação de produção e lacunas específicas documentadas nas fases. |
| E-mails e documentos | **Implementada parcialmente** | Pipeline, consultas administrativas e avisos operacionais de abertura, avaliação, assinatura, execução, cancelamento e conclusão estão integrados; registro de documentos externos, escopos adicionais e retenção institucional pendentes. |
| Domínio de estágios | **Implementado com pendências** | Solicitação, análise, gestão, calendário, pausas, sincronização, documentos, assinatura, avaliação, conclusão e cancelamento estão disponíveis; vigências formais de jornada, histórico reproduzível, rescisão automática e aviso de término previsto pendentes. |

A sequência é: 00 — preparação; 01 — fundação de dados; 02 — conta e contexto; 03 — Activity Log; 04 — integração de e-mail; 05 — administração; 06 — documentos; 07 — abertura do estágio; 08 — estágio em andamento; e 09 — avaliação e conclusão. As funcionalidades de cada fase e seus itens pendentes estão resumidos no índice de [Fases de desenvolvimento](doc:fases-de-desenvolvimento).

## 8. Referência técnica resumida

O projeto atual usa Laravel 13, PHP `^8.3` (ambiente atual: PHP 8.5), Livewire 4, Flux UI, Tailwind CSS, Vite, PostgreSQL, Laravel Fortify, Spatie Activitylog, Spatie Medialibrary, Laravel Scout e Meilisearch. A aplicação já possui autenticação, rotas protegidas, configurações de perfil e segurança, filas, cache, auditoria e infraestrutura de mídia.

A base de Models, migrations, Actions e Policies cobre os fluxos implementados. Há transporte de e-mail em fila, gestão global e local, emissão/reprodução DOCX/PDF, assinaturas, liberação, execução, avaliação, conclusão e cancelamento. Documentos externos, vigências formais de jornada, reprodução integral do cálculo, rescisão automática e aviso de término previsto continuam pendentes. `routes/console.php` agenda limpeza de temporários, sincronização de status, preparação do calendário e resumo diário das solicitações pendentes.

## 9. Onde aprofundar

- [Visão geral](doc:visao-geral) — objetivo e escopo do produto.
- [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) — explicação completa dos papéis.
- [Fluxos principais](doc:fluxos-principais) — jornada com todos os cenários.
- [Ciclos de status](doc:ciclos-de-status) — transições e significados detalhados.
- [Glossário](doc:glossario) — termos usados pelo SGE.
- [Planejamento](doc:planejamento) — estado dos blocos de trabalho.
- [Arquitetura atual](doc:arquitetura-atual) — tecnologias, infraestrutura e limites do código existente.
