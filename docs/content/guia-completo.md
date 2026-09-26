---
id: guia-completo
title: Guia completo do SGE
description: Referência única do Sistema de Gestão de Estágios, preparada para leitura contínua e exportação em PDF.
type: user-guide
status: defined
visibility: public
tags: sge/guia, sge/produto, sge/pdf
related: home, visao-geral, pessoas-e-responsabilidades, fluxos-principais, ciclos-de-status, glossario, planejamento, arquitetura-atual
source_refs: https://github.com/sge-suite/sge/blob/master/routes/web.php, https://github.com/sge-suite/sge/blob/master/routes/settings.php, https://github.com/sge-suite/sge/blob/master/config/fortify.php, https://github.com/sge-suite/sge/blob/master/composer.json
diagram: guia-completo-jornada
---
> [!abstract] Leitura única
> Esta é a versão consolidada da documentação do SGE. Ela foi escrita para leitura contínua e impressão em PDF: contém apenas um diagrama compacto, sem Canvas ou mapas grandes. As páginas vinculadas ao final aprofundam cada assunto quando necessário.

> [!info] Estado do produto
> Este guia combina o comportamento definido para o SGE com o estado atual do código. Uma regra marcada como **definida** é parte do produto planejado, mas pode ainda não estar disponível em uma tela. O estado detalhado aparece em [Planejamento](doc:planejamento).

## 1. O que é o SGE

O Sistema de Gestão de Estágios (SGE) centraliza a solicitação, a formalização, o acompanhamento e a conclusão de estágios. Ele reduz a dependência de formulários dispersos, e-mails e planilhas, deixando claro o que falta, quem precisa agir e qual informação está válida para cada processo.

O sistema trabalha com uma conta por pessoa e, quando aplicável, com um **vínculo** institucional. O vínculo informa a atuação da pessoa — por exemplo, discente, orientador ou integrante do Setor de Estágio — e limita o campus, o curso e as ações disponíveis naquele contexto.

## 2. Como interpretar este guia

| Marca | Significado |
| --- | --- |
| **Implementado** | O artefato já existe no código atual; ainda pode faltar integração com o domínio. |
| **Definido** | A regra foi aprovada para o produto, mas sua implementação completa ainda está pendente. |
| **Planejado** | O trabalho ainda não começou ou depende de decisão anterior. |

No estado atual, login, recuperação de senha, dashboard, perfil somente para consulta e alteração de senha estão disponíveis. O contexto de vínculo ativo, a seleção/troca de vínculo, o bootstrap do primeiro Administrador do Sistema por `admin:create` e o Activity Log Eloquent também estão implementados. A base de Models e migrations do domínio de estágios existe; cadastro de contas pela interface, convite e os fluxos operacionais de solicitação, documentação, execução, avaliação e conclusão ainda não estão disponíveis como jornadas completas.

## 3. Quem participa

| Pessoa ou setor | Responsabilidade principal | Limite importante |
| --- | --- | --- |
| Discente | Inicia a solicitação, responde correções e acompanha o próprio estágio. | Não aprova a própria solicitação nem confirma assinaturas. |
| Setor de Estágio | Analisa processos, formaliza, confere assinaturas, libera o estágio e trata pendências. | Não reescreve respostas do discente ou do supervisor. |
| Supervisor | Acompanha o discente no local de estágio e preenche a avaliação quando liberada. | Não aprova a própria avaliação nem lança notas acadêmicas. |
| Orientador | Acompanha a dimensão acadêmica e registra as notas sob sua responsabilidade. | Não substitui o supervisor na avaliação nem conduz a formalização. |
| Coordenador de curso | Consulta o acompanhamento do curso e emite o atestado de orientação previsto. | Não herda as tarefas operacionais do Setor de Estágio. |
| Administrador do Campus | Mantém cadastros e dados administrativos do próprio campus. | Não administra outros campi. |
| Administrador do Sistema | Mantém a estrutura institucional geral. | Não passa a operar estágios por ter esse vínculo. |
| Direção de Ensino | Consulta informações institucionais quando autorizada. | O escopo de relatórios ainda depende de definição institucional. |

## 4. Jornada do estágio

{{diagram:guia-completo-jornada}}

O fluxo completo admite correções sem criar outro processo: quando uma solicitação ou avaliação é devolvida, a mesma pessoa corrige e reenvia o mesmo registro. A decisão continua com o Setor de Estágio e o histórico preserva as alterações relevantes.

### 4.1 Solicitação e análise

O discente inicia a solicitação, pode salvá-la como rascunho e a envia quando os dados obrigatórios estiverem completos. O Setor de Estágio pode aceitar, recusar ou devolver a solicitação com orientação sobre o que precisa ser corrigido.

Antes do aceite, o processo valida os dados do estágio, da parte concedente, do supervisor, do curso, da jornada e, quando aplicável, da capacidade civil e do responsável legal. Um discente pode desistir antes de existir um estágio formalizado.

### 4.2 Formalização

Depois do aceite, o estágio nasce em formalização. O Setor prepara o documento aplicável, informa onde ele estará disponível para assinatura e seleciona os participantes que precisam ser avisados. A assinatura ocorre fora do SGE e precisa ser conferida antes da liberação.

O SGE registra o processo e suas referências, mas não guarda o arquivo DOCX/PDF final ou o documento assinado. Templates, versões, dados resolvidos e histórico são tratados separadamente para preservar rastreabilidade sem duplicar acervo documental externo.

### 4.3 Execução, mudanças e encerramento

Após a liberação, o estágio inicia na data planejada. Pausas suspendem o cômputo da carga horária e atualizam a previsão de término; mudanças de jornada exigem aditivo formalizado. Cancelamentos exigem motivo, decisão do Setor e preservação do histórico.

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
| Com pendência documental | Alguma informação ou documento precisa ser corrigido. |
| Liberado | As assinaturas foram conferidas; o estágio aguarda ou alcançou o início. |
| Em andamento | O estágio está em execução. |
| Pausado | Há uma pausa válida no período. |
| Concluído | A carga horária integral foi confirmada. |
| Cancelado | O processo terminou sem conclusão. |

### Documentos e avaliação

| Área | Situações | Regra central |
| --- | --- | --- |
| Documento | Gerado, aguardando assinatura, assinado, cancelado. | Cancelar um documento não cancela automaticamente o estágio. |
| Avaliação do supervisor | Rascunho, enviada, devolvida, aprovada, cancelada. | A aprovação exige carga horária cumprida e não conclui o estágio por si só. |

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
| Conta e autenticação | **Implementada parcialmente** | Contexto de vínculo e bootstrap do primeiro administrador existem; cadastro pela interface, convite e configurações pessoais ainda faltam. |
| Fundação técnica | **Implementada parcialmente** | Models e migrations de domínio existem; completar autorizações, Actions transacionais e integração das jornadas. |
| E-mails e documentos | **Estruturas implementadas; fluxos pendentes** | Transporte de e-mail, geração documental e assinatura ainda precisam ser integrados. |
| Domínio de estágios | **Base de dados implementada; fluxos pendentes** | Entidades e estados existem no backend; implementar jornadas, decisões e interfaces. |

A sequência é: 00 — preparação; 01 — fundação de dados; 02 — conta e contexto; 03 — Activity Log; 04 — integração de e-mail; 05 — administração; 06 — documentos; 07 — abertura do estágio; 08 — estágio em andamento; e 09 — avaliação e conclusão. O contexto de vínculo da Fase 02 e a implementação da auditoria Eloquent da Fase 03 estão no código; a Fase 04 é o próximo bloco ainda não iniciado.

## 8. Referência técnica resumida

O projeto atual usa Laravel 13, PHP 8.3 ou superior, Livewire 4, Flux UI, Tailwind CSS, Vite, PostgreSQL, Laravel Fortify, Spatie Activitylog, Spatie Medialibrary, Laravel Scout e Meilisearch. A aplicação já possui autenticação, rotas protegidas, configurações de perfil e segurança, filas, cache, auditoria e infraestrutura de mídia.

A base de Models e migrations do domínio de estágio já existe, assim como Policies básicas para vínculo e consulta de atividades. Ainda faltam autorizações e Actions para várias jornadas, interfaces funcionais, transporte de e-mail, geração documental e comandos agendados do domínio. O projeto já tem comandos Artisan de bootstrap e importação; `routes/console.php` ainda não agenda tarefas de domínio.

## 9. Onde aprofundar

- [Visão geral](doc:visao-geral) — objetivo e escopo do produto.
- [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) — explicação completa dos papéis.
- [Fluxos principais](doc:fluxos-principais) — jornada com todos os cenários.
- [Ciclos de status](doc:ciclos-de-status) — transições e significados detalhados.
- [Glossário](doc:glossario) — termos usados pelo SGE.
- [Planejamento](doc:planejamento) — estado dos blocos de trabalho.
- [Arquitetura atual](doc:arquitetura-atual) — tecnologias, infraestrutura e limites do código existente.
