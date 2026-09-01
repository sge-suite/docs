---
title: SGE — Perfis e responsabilidades por vínculo
description: Referência operacional das responsabilidades, escopos, limites e controles de cada AffiliationType.
type: authorization-reference
status: defined
tags:
  - sge/autorizacao
  - sge/affiliations
  - sge/policies
aliases:
  - Responsabilidades por vínculo
  - Perfis funcionais do SGE
---
Esta é a referência operacional para implementar as telas, Gates, Policies e testes de acesso. Ela detalha a [[SGE - Matriz de autorização|matriz resumida]]; não cria permissões configuráveis em banco. Para a explicação pública, sem termos de implementação, use [[SGE - Pessoas e responsabilidades]].

> [!warning] Regra de interpretação
> Uma ação só é permitida quando esta referência a atribui ao vínculo **e** a Policy confirma vínculo ativo, escopo, posse do registro e estado do fluxo. Ausência de atribuição significa acesso negado. Pontos marcados como “a confirmar” não devem virar tela ou permissão até decisão institucional.

## Regras comuns a todos os vínculos

- Cada pessoa autentica uma única conta e seleciona um `affiliations` ativo para operar. Trocar de vínculo troca o contexto; não soma acessos.
- Toda leitura e alteração verifica `AffiliationType`, campus, curso quando aplicável, posse ou relação com o registro e o status atual. Um vínculo desativado não inicia nem altera fluxos.
- Gates e Policies nativos do Laravel são a única camada de autorização. Não existem papéis, permissões ou exceções editáveis por interface.
- O Activity Log registra alterações relevantes. Discente e supervisor não o consultam; os demais o consultam somente quando a Policy do processo autorizar.
- Notificação interna e e-mail são canais diferentes. Quem possui conta recebe ambos quando for destinatário elegível; o Setor de Estágio recebe seu resumo operacional somente dentro do sistema.
- Informações privadas, inclusive prova de emancipação, nunca entram em e-mail, documento gerado ou Activity Log detalhado. O acesso depende de necessidade funcional explícita.

## Resumo de fronteiras

| Vínculo | Escopo-base | Atua diretamente no estágio? | Administração cadastral | Decisão final típica |
| --- | --- | --- | --- | --- |
| Administrador do Sistema | institucional/global | não, salvo atribuição futura explícita | campi e vínculos administrativos globais | ativação e estrutura institucional |
| Administrador do Campus | próprio campus | não, salvo outro vínculo ativo | pessoas, vínculos, cursos e tipos do campus | administração do campus |
| Setor de Estágio | campus ou escopo atribuído | sim | concedentes, pendências e templates | análise, formalização, liberação e avaliação |
| Coordenador | curso do vínculo | consulta acadêmica | não | atestado de orientação previsto |
| Orientador | próprios orientandos | sim, nas notas acadêmicas | não | lançamento de relatório e apresentação |
| Discente | próprio vínculo/processo | sim, na própria solicitação e pedidos | próprios dados permitidos | envio, correção, desistência e pedido de cancelamento |
| Supervisor | estágios sob sua supervisão | sim, na própria avaliação | não | envio ou cancelamento da própria avaliação |
| Direção de Ensino | institucional a confirmar | consulta, quando autorizada | não | nenhuma definida atualmente |

## Administrador do Sistema

### Finalidade e escopo

Mantém a estrutura institucional global. Seu vínculo pode não possuir campus e não o transforma, por si só, em operador acadêmico ou do Setor de Estágio.

### Ações permitidas

- criar, editar, ativar e desativar campi;
- criar e administrar vínculos de Administrador do Sistema e Administrador do Campus, respeitando a separação entre escopo global e de campus;
- iniciar o subfluxo de conta existente ou nova para esses vínculos e disparar o aviso de disponibilização do vínculo;
- consultar os dados administrativos indispensáveis para essas operações.

### Limites e proibições

- não analisa solicitação, não libera estágio, não confere assinatura, não preenche notas e não aprova avaliação apenas por ser administrador global;
- não atua por outro vínculo sem selecioná-lo explicitamente;
- não substitui o Setor de Estágio em seu escopo operacional;
- nenhuma consulta a dados sensíveis ou a processos acadêmicos é presumida: precisa de Policy específica ou de outro vínculo ativo.

### Notificações e auditoria

Recebe apenas avisos administrativos que venham a ser definidos para a estrutura institucional. A criação, ativação, desativação e alteração de campus ou vínculo registra autoria e vínculo no Activity Log.

### Controles a implementar

`CampusPolicy` e `AffiliationPolicy` cobrem as operações globais. `Gate::before` pode reconhecer este vínculo somente para essas ações globais e nunca dispensar a validação de vínculo ativo. Os testes devem rejeitar administrador de campus, vínculo desativado e tentativa de operar estágio sem outro vínculo autorizado.

## Administrador do Campus

### Finalidade e escopo

Mantém cadastros e estrutura do próprio campus. Sua visibilidade é limitada ao `campus_id` do vínculo ativo.

### Ações permitidas

- editar nome, CNPJ, endereço, telefone, e-mail e representante do próprio campus;
- criar e administrar contas e vínculos dentro do campus, inclusive por meio do fluxo de reutilização de conta existente;
- criar e editar cursos, atribuir os dois coordenadores previstos e administrar tipos de estágio do próprio campus;
- ativar ou desativar vínculos do próprio escopo, sem apagar histórico;
- consultar os dados administrativos necessários para essas tarefas.

### Limites e proibições

- não cria outro campus, não altera seu ciclo de ativação e não acessa registros de campus alheio;
- não cria nem administra Administrador do Sistema;
- não assume análise de solicitações, documentos, liberação, avaliações ou notas sem também possuir e selecionar o vínculo correspondente;
- não modifica dados pessoais do discente fora do fluxo cadastral autorizado nem contorna snapshots históricos.

### Notificações e auditoria

Ao adicionar vínculo a uma conta, o destinatário recebe o aviso previsto para conta nova ou existente. Alterações administrativas e de vínculo ficam auditadas; o administrador não recebe automaticamente os avisos operacionais de todos os estágios do campus.

### Controles a implementar

`CampusPolicy`, `AffiliationPolicy`, `CoursePolicy` e `InternshipTypePolicy` exigem o mesmo campus. Testes devem cobrir campus alheio, criação de Administrador do Sistema, vínculo desativado, duplicidade de pessoa e tentativa de operar recursos de estágio.

## Setor de Estágio

### Finalidade e escopo

É o vínculo operacional do estágio no campus ou escopo que lhe foi atribuído. Concentra análise humana, formalização e decisões administrativas do processo; não altera livremente respostas de outras pessoas.

### Ações permitidas

- analisar solicitação enviada, aceitar, recusar ou devolver com motivo e seções autorizadas para correção;
- analisar solicitações pendentes de cadastro de supervisor e parte concedente, criando ou associando o cadastro resultante;
- criar e manter partes concedentes autorizadas, templates DOCX e versões de template;
- criar o estágio após aceite, gerar documentos, informar o local genérico de assinatura e selecionar interessados elegíveis para aviso;
- conferir manualmente assinaturas externas, liberar o estágio e manter pendências documentais;
- registrar pausa, tratar substituição autorizada de orientador ou supervisor e gerar aditivo quando houver mudança contratual;
- aprovar ou recusar pedido de cancelamento, preservando documentos e histórico conforme o fluxo;
- liberar a avaliação do supervisor, aprovar ou devolver a resposta com motivo e validar a carga horária exigida;
- consultar o histórico operacional autorizado e emitir o resumo interno agrupado de pendências.

### Limites e proibições

- não edita a resposta enviada pelo discente: devolve e indica as seções que podem ser corrigidas;
- não edita conteúdo de avaliação do supervisor: somente aprova ou devolve;
- não altera jornada de modo direto ou temporário. Mudança de carga exige documento de aditivo e nova vigência apenas após assinaturas conferidas;
- não conclui estágio, cancela documento ou abre correção por automação temporal; essas decisões são manuais;
- não acessa provas privadas de emancipação fora da análise da solicitação nem divulga seus dados em comunicação ou documento.

### Notificações e auditoria

Recebe no sistema um resumo diário agrupado por campus e destinatário, sem e-mail operacional fragmentado. Suas decisões e mudanças registram vínculo responsável, motivo e efeitos no Activity Log. Avisos enviados a interessados de assinatura mantêm categorias e quantidade, nunca endereços de e-mail no log.

### Controles a implementar

`InternshipRequestPolicy`, `RegistrationRequestPolicy`, `GrantingPartyPolicy`, `TemplatePolicy`, `GeneratedDocumentPolicy`, `InternshipPolicy`, `InternshipPausePolicy`, `InternshipCancellationRequestPolicy` e `SupervisorEvaluationPolicy` restringem o escopo ao campus e às transições válidas. Testar, no mínimo, edição indevida de resposta, liberação sem assinatura confirmada, aprovação de avaliação com carga pendente e tentativa de alterar jornada sem aditivo.

## Coordenador de Curso

### Finalidade e escopo

Consulta o acompanhamento acadêmico do curso vinculado. Não se confunde com o Setor de Estágio e não recebe suas decisões operacionais por herança.

### Ações permitidas

- consultar estágios e informações acadêmicas autorizadas do próprio curso;
- emitir o atestado de orientação previsto no processo;
- exercer apenas outras ações acadêmicas que sejam atribuídas explicitamente por decisão futura e Policy correspondente.

### Limites e proibições

- não analisa nem aprova solicitações, documentos, assinaturas, cancelamentos ou avaliações do supervisor;
- não lança notas de relatório ou apresentação, que pertencem ao orientador responsável;
- não consulta estágio de outro curso pelo simples fato de ser coordenador e não edita vínculo, campus ou tipo sem vínculo administrativo próprio.

### Notificações e auditoria

Não possui aviso operacional recorrente definido. A emissão do atestado e eventuais consultas sensíveis autorizadas são auditáveis. Inclusão em avisos documentais ou novas responsabilidades depende de decisão explícita.

### Controles a implementar

`InternshipPolicy::viewCourse` e `OrientationCertificatePolicy` validam curso e campus do vínculo. Testar curso alheio, tentativa de decisão operacional e emissão de atestado sem relação de curso válida.

## Orientador

### Finalidade e escopo

Acompanha apenas os discentes para os quais é orientador no estágio. O escopo nasce da relação registrada no estágio, não de todos os estudantes do curso.

### Ações permitidas

- consultar dados e andamento dos próprios orientandos necessários ao acompanhamento;
- lançar ou alterar, quando o status permitir, as notas de relatório e apresentação na escala congelada do tipo de estágio;
- acompanhar a nota consolidada calculada pelo sistema;
- receber avisos de documento disponível para assinatura quando selecionado pelo Setor e alertas que exijam ação sua.

### Limites e proibições

- não aprova nem edita a avaliação respondida pelo supervisor;
- não altera a nota do supervisor, os pesos, os conceitos ou a fórmula congelada;
- não conclui, libera, pausa, cancela ou formaliza o estágio;
- não consulta orientandos de outro vínculo nem o Activity Log fora do necessário e autorizado.

### Notificações e auditoria

Recebe notificação interna e e-mail quando selecionado para assinatura ou quando tiver ação acadêmica atribuída. Cada lançamento de nota registra autor, vínculo, valor anterior e novo; o sistema recalcula a nota consolidada conforme as regras congeladas.

### Controles a implementar

`InternshipPolicy::viewAsAdvisor` e `InternshipGradePolicy` validam a relação de orientação, campus, estado do estágio e limites da escala. Testar lançamento em orientando alheio, nota fora do peso, estágio cancelado ou nota já bloqueada por regra de conclusão.

## Discente

### Finalidade e escopo

Opera exclusivamente a própria solicitação e o próprio estágio, dentro do curso do vínculo ativo. Uma pessoa com dois cursos usa vínculos separados e não mistura os processos.

### Ações permitidas

- alterar a própria senha e e-mail de login; como discente, também atualizar RG, nascimento e endereço atuais permitidos;
- criar, salvar progressivamente e editar a própria solicitação em `Draft`;
- enviar a solicitação, responder uma devolução nas seções liberadas e acompanhar o resultado da análise;
- registrar a capacidade civil, informar responsável quando necessário e enviar comprovante privado de emancipação pelo SGE;
- consultar seus estágios, notificações, documentos que lhe forem disponibilizados e a previsão de término;
- desistir da solicitação não formalizada ou solicitar cancelamento do estágio com motivo, nos estados permitidos.

### Limites e proibições

- não aceita, recusa, libera ou conclui o próprio estágio;
- não cadastra definitivamente parte concedente ou supervisor, não escolhe template e não confirma assinaturas externas;
- não altera jornada após a formalização, avaliações, notas, snapshots, status ou data prevista diretamente;
- não exclui solicitações, estágios, evidências ou cancelamentos e não consulta o Activity Log;
- não acessa processo de outro discente, mesmo que pertença ao mesmo curso.

### Notificações e auditoria

Recebe notificação interna e e-mail sobre fatos temporais do próprio estágio, devoluções, decisões e assinatura quando selecionado. A evidência de emancipação permanece privada; o histórico registra o evento de envio e análise sem expor arquivo ou metadados.

### Controles a implementar

`InternshipRequestPolicy`, `InternshipPolicy`, `EmancipationEvidencePolicy` e `InternshipCancellationRequestPolicy` verificam posse pelo `affiliation_id`, curso, estado e seções liberadas. Testar acesso cruzado entre discentes, envio incompleto fora de `Draft`, edição após envio e leitura de Activity Log.

## Supervisor

### Finalidade e escopo

Responde pela avaliação dos estágios em que está formalmente vinculado como supervisor. Não é aprovador nem operador do processo de estágio.

### Ações permitidas

- consultar os próprios estágios e avaliações liberadas;
- criar ou continuar a avaliação em `Draft`, com salvamento progressivo;
- enviar a avaliação completa como `Submitted`;
- editar integralmente a mesma avaliação quando estiver `Returned` e reenviá-la;
- cancelar a própria avaliação `Submitted` ou `Returned`, com motivo, preservando o registro;
- receber aviso para preencher ou corrigir avaliação e, quando selecionado, aviso de documento disponível para assinatura.

### Limites e proibições

- não aprova a própria avaliação, não muda o status para `Approved` e não edita resposta depois de enviada, salvo retorno do Setor;
- não altera estágio, jornada, pausas, documentos, notas ou avaliação de outro supervisor;
- não exclui formulários e não consulta o Activity Log;
- não tem acesso a dados privados sem relação com a supervisão, incluindo evidências de emancipação.

### Notificações e auditoria

Quando tiver conta, recebe notificação interna e e-mail pelos fatos que exigirem ação. O Activity Log preserva valores e transições, mas não é exposto na interface do supervisor.

### Controles a implementar

`SupervisorEvaluationPolicy` valida a relação de supervisão, estado do estágio e transição do formulário. Testar avaliação de estágio alheio, edição em `Submitted` ou `Approved`, aprovação própria, cancelamento fora dos estados permitidos e leitura do log.

## Direção de Ensino

### Finalidade e escopo

É um vínculo institucional de consulta. O escopo exato de campus e os relatórios que poderá acessar ainda dependem de confirmação institucional.

### Ações atualmente permitidas

- consultar informações gerais e relatórios somente quando uma Policy definir expressamente o escopo institucional aplicável.

### Limites e proibições

- não possui criação, edição, aprovação, liberação, assinatura, lançamento de nota ou cancelamento definidos;
- não deve receber acesso operacional por analogia com Administrador, Coordenador ou Setor de Estágio;
- enquanto o escopo não estiver definido, a Policy nega qualquer consulta que não seja pública ou estritamente necessária à própria conta.

### Notificações e auditoria

Não há notificações operacionais definidas. Consultas a relatórios ou dados sensíveis autorizados devem registrar o vínculo e a finalidade conforme a política de auditoria a ser definida.

### Controles a implementar

Criar `TeachingDirectionReportPolicy` somente após confirmar relatórios, abrangência e necessidade de dados pessoais. Os testes atuais devem provar ausência de permissão de escrita e negar acesso a relatórios fora do escopo ainda não decidido.

## Mapa de implementação e testes

| Área protegida | Policy principal | Decisão obrigatória |
| --- | --- | --- |
| conta, vínculo, campus, curso e tipo | `AffiliationPolicy`, `CampusPolicy`, `CoursePolicy`, `InternshipTypePolicy` | tipo do vínculo e mesmo campus/curso |
| solicitação e evidência de emancipação | `InternshipRequestPolicy`, `EmancipationEvidencePolicy` | posse do discente ou análise pelo Setor |
| estágio, pausa, aditivo e cancelamento | `InternshipPolicy`, `InternshipPausePolicy`, `InternshipCancellationRequestPolicy` | relação com estágio, estado e fluxo documental |
| documentos e assinaturas | `GeneratedDocumentPolicy`, `TemplatePolicy` | Setor no escopo; destinatário apenas visualiza o que lhe foi disponibilizado |
| avaliação e notas | `SupervisorEvaluationPolicy`, `InternshipGradePolicy` | supervisor, Setor ou orientador correto; estado e relação válidos |
| relatórios institucionais | Policy específica de relatório | somente quando o vínculo e o escopo tiverem sido definidos |

Cada ação deve ter testes positivos e negativos: vínculo correto, tipo errado, campus/curso errado, relação inexistente, vínculo desativado e status inválido. A [[SGE - Fase 05 - Administração|Fase 05]] implementa primeiro a base de contexto e as Policies administrativas; as fases de estágio, documentos e avaliação acrescentam as Policies de domínio acima.

## Pendências institucionais que bloqueiam novas permissões

- definir o escopo e a lista de relatórios da Direção de Ensino;
- confirmar se o Coordenador terá alguma ação acadêmica além de consulta por curso e emissão de atestado de orientação;
- confirmar quais dados e relatórios poderão ser visualizados por cada vínculo sem relação direta com o estágio;
- definir a política de auditoria para consultas sensíveis, caso ela exija registros além do Activity Log de alterações.
