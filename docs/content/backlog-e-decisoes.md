---
id: backlog-e-decisoes
title: Backlog e decisões
description: Decisões aprovadas e assuntos ainda pendentes no planejamento do SGE.
type: decisions
status: in-progress
visibility: public
tags: sge/decisoes, sge/backlog
related: e-mails-notificacoes-e-entregas, enum-evaluationstatus, enum-brazilianstate, enum-holidayscope, migration-01a-cities, migration-01-addresses, migration-18-supervisor-evaluations, fluxos-principais, migration-13-document-templates, migration-14-template-versions, migration-16-generated-documents, migration-12-granting-parties, glossario, modelo-de-dados-acesso, matriz-de-autorizacao, migration-11-internship-types, migration-15-internships, migration-19-internship-requests, migration-20-internship-request-corrections, migration-base-04-activity-log, helper-numbertowordshelper, migration-21-internship-cancellation-requests, migration-22-holidays, migration-22-internship-calendar-overrides, migration-23-internship-work-schedules, geracao-de-documentos-docx-e-variaveis, schedules, ciclos-de-status
source_refs:
---
## Próximas definições

- [ ] Confirmar perfis oficiais e responsabilidades.
- [x] Fechar o catálogo de placeholders e os critérios de validação dos templates.
- [ ] Definir política de retenção de documentos e auditoria.
- [ ] Criar testes de aceitação para os fluxos principais.
- [ ] Mapear os campos, critérios, escalas e regras condicionais dos formulários nativos de abertura e avaliação.

## Decisões registradas

### D-001 — Documentação versionada em Markdown com Mermaid

- **Status:** definido.
- **Decisão:** manter a documentação publicada em arquivos `.md`, com diagramas Mermaid versionados no repositório.
- **Motivo:** facilita navegação, versionamento, revisão e atualização durante o desenvolvimento.

### D-002 — Papéis separados de vínculos

- **Status:** definido.
- **Decisão:** não tratar função institucional apenas como um campo fixo no usuário. Usar `affiliations` para permitir múltiplos contextos por pessoa, campus e função.
- **Motivo:** um usuário pode exercer funções diferentes em campi ou em momentos diferentes.

### D-004 — Dados pessoais fora de `internships`

- **Status:** definido.
- **Decisão:** CPF permanece em `users` como identificador único da conta. RG, data de nascimento, telefone, endereço atual e cargo/função ficam em `user_personal_data`, relacionado um-para-um com `users`; qualificações do supervisor ficam em várias linhas de `supervisor_qualifications`. Estágios preservam snapshots `jsonb` e endereços históricos como cópias independentes em `addresses`.
- **Motivo:** evita repetição de dados pessoais e mantém os documentos e estágios imunes a alterações posteriores no cadastro.

### D-005 — Configurações pessoais por tipo de vínculo

- **Status:** definido.
- **Decisão:** qualquer usuário pode alterar a própria senha e o e-mail de login; o nome não é editável. A troca de e-mail exige senha atual, duas entradas coincidentes do novo endereço, vínculo ativo e aviso para os e-mails antigo e novo. Quando a própria pessoa troca o endereço, os avisos deixam explícito que a alteração foi feita na própria conta e usam a assinatura do sistema; alterações solicitadas por outra pessoa identificam o vínculo responsável. A parte de acesso está implementada na aba Segurança. A aba Dados pessoais implementa a edição própria de RG, órgão emissor, emissão, nascimento e endereço no contexto Discente, e de cargo/função e qualificações múltiplas no contexto Supervisor. O telefone é compartilhado e pode ser editado nos dois contextos. A gravação exige identidade e vínculo ativo selecionado revalidados, recusa campos de outro contexto, preserva omissões e permite limpar opcionais. O perfil permanece único por conta, com endereço próprio e preservação de snapshots e referências históricas. Os campos profissionais servem apenas como referência opcional: podem guardar formação e experiência juntas; cada avaliação escolhe o ramo pertinente à área do estagiário, confirma a cópia ou recebe outros dados e conserva respostas independentes, sem sincronização posterior com o perfil. A abertura exige dados pessoais completos no envio; rascunhos parciais permanecem permitidos.
- **Motivo:** separa dados da conta de dados necessários ao estágio e restringe a edição aos usuários que realmente precisam desses campos.

### D-006 — Canvas espacial para diagramas Mermaid

- **Status:** definido.
- **Decisão:** manter os diagramas Mermaid em notas Markdown independentes e organizá-los em um canvas específico por meio de cards de arquivo.
- **Motivo:** preserva a renderização e a exportação dos diagramas, ao mesmo tempo que permite organizar fontes e artefatos no repositório.

### D-007 — Canvas do fluxograma com cards padronizados

- **Status:** definido.
- **Decisão:** o canvas do fluxograma usará cards de texto coloridos, grupos e conexões com cores por semântica. O JSON Canvas não possui formas nativas específicas para processo, decisão, documento ou banco de dados.
- **Motivo:** evita depender de recursos que não fazem parte do formato e mantém os diagramas compatíveis com o pipeline de publicação.

### D-008 — Trilhas separadas para notificações e e-mails

- **Status:** definido.
- **Decisão:** `notifications` registrará o aviso interno; `email_messages` preservará a mensagem preparada e `email_delivery_attempts` cada envio ou reenvio. Não haverá confirmação adicional de endereço de e-mail. Cada tentativa segue diretamente de `queued` para `sent` ou `failed`.
- **Motivo:** preserva conteúdo e histórico de entrega das notificações operacionais, sem armazenar tokens de recuperação e sem confundir leitura interna com aceite pelo SMTP.
- **Referência:** [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).

### D-009 — Ciclo e validade da avaliação do supervisor

- **Status:** definido.
- **Decisão:** o Setor de Estágio solicita explicitamente a avaliação no estágio elegível, registra a liberação e notifica o vínculo do supervisor responsável após commit. O supervisor não inicia avaliações. A primeira pergunta confirma a carga horária: em “Não”, informa somente horas faltantes positivas, limitadas à carga exigida no snapshot, sem qualificação, critérios ou comentários; a resposta pode ser `Submitted`, mas nunca `Approved`, devendo ser devolvida com justificativa. Em “Sim”, confirma ou edita uma cópia dos dados profissionais congelados e preenche os dez critérios com valores e pesos do snapshot, com comentários opcionais. `Draft` permite salvamento parcial; `Submitted` preserva respostas; `Returned` reabre o mesmo registro e permite reenvio como “Sim”. O Setor aprova ou devolve sem editar respostas. O supervisor pode cancelar `Submitted` ou `Returned` com motivo, preservando o registro. A aprovação seleciona em transação o `Approved` mais recente por `submitted_at` e `id`, recalcula as notas com `InternshipGradeCalculator` e conclui o estágio na mesma transação quando a carga horária está cumprida. A confirmação é obrigatória para aprovação e um pedido de cancelamento pendente bloqueia o encerramento. Pendências, devoluções e cancelamentos preservam a vigente anterior e suas notas. O `activity_log` preserva autoria, alterações e transições.
- **Motivo:** preserva um único formulário por estágio e supervisor, permite correção integral sem criar versões artificiais e mantém a auditoria de valores e estados fora da interface do supervisor.
- **Autorização:** a análise pertence ao vínculo `AffiliationType::InternshipOffice`; `AffiliationType::Coordinator` continua representando o coordenador de curso.
- **Referências:** [Enum — EvaluationStatus](doc:enum-evaluationstatus), [Migration de avaliações](doc:migration-18-supervisor-evaluations) e [fluxo de avaliação](doc:fluxos-principais#6-acompanhamento-academico-e-conclusao).

### D-010 — Templates DOCX versionados e saída sem arquivo final

- **Status:** definido.
- **Decisão:** templates DOCX serão cadastrados separadamente dos tipos de documento. O catálogo de variáveis é fixo no código e cada DOCX usa as variáveis necessárias. Cada arquivo diferente enviado e validado cria uma versão; cada geração usa a versão vigente selecionada e referencia exatamente a versão e a snapshot de dados usadas. Após uso, uma correção cria outra versão e a anterior permanece. Uma versão nunca usada pode ser excluída fisicamente com sua mídia. O SGE não armazena o arquivo DOCX/PDF final ou o documento assinado.
- **Motivo:** permite rastrear e, quando necessário, reproduzir a geração histórica sem misturar template, tipo documental e arquivo final.
- **Referências:** [Migration 13 — document_templates](doc:migration-13-document-templates), [Migration 14 — template_versions](doc:migration-14-template-versions) e [Migration 16 — generated_documents](doc:migration-16-generated-documents).

### D-011 — Solicitações pendentes são registros próprios

- **Status:** definido.
- **Decisão:** dados de supervisor ou parte concedente ainda não cadastrados serão salvos em estruturas próprias de solicitação, com origem, análise, decisão, motivo e associação ao cadastro resultante. Notificações apenas avisam o Setor de Estágio e apontam para a solicitação.
- **Motivo:** uma notificação não preserva adequadamente os dados, o histórico de análise e a decisão do cadastro.

### D-012 — Identificação e escopo de partes concedentes

- **Status:** definido e refletido no schema e nas validações dos Models.
- **Decisão:** `granting_parties` usa `document_type` (`CPF` ou `CNPJ`) e `document_number` normalizado, mas cada cadastro pertence a um campus por FK. Os cadastros são locais ao campus, inclusive para dados de conselho, credenciamento, contatos e endereço. O mesmo CPF ou CNPJ pode aparecer em mais de um cadastro e não terá unicidade global nem por campus. O CPF de uma concedente não é chave para associar ou mesclar uma conta em `users`. As solicitações de concedente também devem preservar o campus de origem, e sua aprovação deve resultar em uma concedente daquele campus.
- **Motivo:** algumas empresas exigem o CNPJ da matriz nas filiais e escolas estaduais podem compartilhar o CNPJ; pessoas físicas e seus dados de credenciamento também precisam permanecer no escopo institucional local.
- **Referências:** [Migration 12 — granting_parties](doc:migration-12-granting-parties) e [Glossário](doc:glossario).

### D-013 — Controle de acesso por vínculos e remoção das tabelas de permissão

- **Status:** definido.
- **Decisão:** remover as tabelas de permissões anteriormente previstas. A autorização será feita exclusivamente pelos recursos nativos do Laravel: Gates e Policies verificam vínculo ativo, `AffiliationType`, campus/curso, posse do registro e estado do fluxo. A matriz é estática no código e nos testes.
- **Motivo:** as regras são institucionais, determinísticas e tipadas. O vínculo já representa função e escopo, sem segunda fonte de verdade ou tabelas dinâmicas.
- **Referências:** [Modelo de dados — Acesso](doc:modelo-de-dados-acesso) e [Matriz de autorização](doc:matriz-de-autorizacao).

### D-014 — Pesos e conceitos pertencem ao tipo de estágio

- **Status:** definido.
- **Decisão:** cada tipo de estágio definirá a carga horária, os pesos da avaliação do supervisor, do relatório e da apresentação, e os valores numéricos dos conceitos da avaliação. Os três pesos devem totalizar 10. Na criação do estágio, essas regras serão copiadas para o snapshot do tipo; alterações posteriores no cadastro do tipo não recalcularão estágios já iniciados.
- **Motivo:** os critérios de conclusão variam por modalidade e precisam permanecer auditáveis no contexto em que o estágio foi realizado.
- **Referências:** [Migration 11 — internship_types](doc:migration-11-internship-types), [Migration 15 — internships](doc:migration-15-internships) e [Migration 18 — supervisor_evaluations](doc:migration-18-supervisor-evaluations).

### D-015 — Solicitação única e correções orientadas

- **Status:** definido.
- **Decisão:** o formulário nativo de abertura edita uma única solicitação de estágio vinculada ao `affiliation_id` do discente. Após o aceite, a solicitação é associada a um único estágio. Devoluções não criam outra solicitação nem versões completas de resposta: elas abrem um registro de correção com mensagem e seções afetadas. O discente altera somente as seções indicadas e reenvia a mesma solicitação. Todo reenvio volta obrigatoriamente para análise e aprovação formal do Setor de Estágio antes de gerar ou reemitir documentos. O `activity_log` preserva os valores alterados e o contexto da ação.
- **Motivo:** preserva um processo simples para o discente e deixa as correções visíveis e priorizadas para o Setor de Estágio, sem usar o log de auditoria como fonte do estado atual.
- **Referências:** [Migration 19 — internship_requests](doc:migration-19-internship-requests), [Migration 20 — internship_request_corrections](doc:migration-20-internship-request-corrections), [Migration base 04 — activity_log](doc:migration-base-04-activity-log) e [Fluxos principais](doc:fluxos-principais#2-solicitacao).

### D-016 — Parágrafo de remuneração gerado no documento

- **Status:** definido.
- **Decisão:** modelos com e sem remuneração são DOCXs separados, classificados por `document_templates.remuneration` (`paid`, `unpaid` ou `any`). O texto jurídico fica no arquivo; somente os valores de bolsa e auxílio usam variáveis. Não há parágrafo automático nem formatter de cláusulas. O Setor escolhe manualmente um modelo compatível com o estágio. O atestado único usa `any`.
- **Motivo:** o §1º é conhecido e estável; manter a regra em um único serviço evita multiplicar templates por combinações de remuneração. Já as diferenças estruturais de credenciamento justificam modelos próprios, sem automatismo de seleção.
- **Referências:** [Migration 12 — granting_parties](doc:migration-12-granting-parties), [Migration 13 — document_templates](doc:migration-13-document-templates), [Migration 16 — generated_documents](doc:migration-16-generated-documents) e [Helper — NumberToWordsHelper](doc:helper-numbertowordshelper).

### D-017 — Cancelamento solicitado pelo discente

- **Status:** definido.
- **Decisão:** antes de existir um estágio formalizado, o discente pode desistir cancelando a própria solicitação. Depois do aceite, pode solicitar cancelamento antes do início ou durante o estágio, sempre com motivo e histórico. O Setor de Estágio aprova ou recusa. A aprovação cancela documentos ainda não assinados, preserva documentos assinados, gera rescisão quando aplicável, cancela avaliações pendentes e mantém notas/avaliações aprovadas apenas como histórico, sem concluir o estágio.
- **Motivo:** a desistência é diferente de uma recusa do Setor e o cancelamento de estágio formalizado exige tratamento rastreável.
- **Referências:** [Migration 21 — internship_cancellation_requests](doc:migration-21-internship-cancellation-requests), [Fluxos principais](doc:fluxos-principais#4-estagio-em-andamento) e [Migration base 04 — activity_log](doc:migration-base-04-activity-log).

### D-018 — Emancipação exige comprovação e validação institucional

- **Status:** definido.
- **Decisão:** a data de nascimento determina automaticamente se o Discente é maior de idade; somente menores escolhem entre menor de idade e menor emancipado. Menor exige responsável legal. Menor emancipado envia o comprovante pelo próprio SGE, em upload privado vinculado à solicitação, e dispensa o responsável neste envio. Cada upload gera registro próprio, com vínculo do discente, instante, mídia privada e status de análise; novo envio não apaga o anterior. O envio cria pendência de verificação, não aprovação automática: o Setor confere manualmente e valida ou devolve com motivo. Se devolver por prova inválida, o discente envia nova prova ou muda para menor de idade e informa o responsável. A validação registra data, vínculo responsável e referência à mídia protegida. O arquivo não entra no `activity_log`, em mensagens de e-mail ou em documentos gerados e só é visível ao discente e ao Setor conforme necessidade.
- **Motivo:** o rádio deixa a interface clara para o discente e preserva a análise humana da prova, sem forçar os dados de responsável antes de o Setor apontar uma pendência.
- **Referências:** [Migration 02 — user_personal_data](doc:migration-02-user-personal-data) e [Migration 19 — internship_requests](doc:migration-19-internship-requests).

### D-019 — Previsão de término reproduzível

- **Status:** definido; cálculo e recálculos por mudanças do estágio, pausas e exceções implementados parcialmente.
- **Decisão:** a data prevista de término considera a jornada, a margem configurada e congelada no tipo de estágio, o calendário local aplicável ao endereço histórico do local de trabalho, pausas e exceções específicas do estágio. O cálculo limita o último dia às horas restantes. A integração de jornadas com novas vigências após aditivo assinado e o armazenamento de uma base integralmente reproduzível ainda estão pendentes.
- **Motivo:** mantém o cálculo rastreável e evita resultados inconsistentes após alterações de calendário, jornada ou pausa.
- **Referências:** [Service — InternshipEndDateCalculator](doc:service-internshipenddatecalculator), [Migration 22 — holidays](doc:migration-22-holidays) e [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules).

### D-020 — Motor DOCX local e catálogo canônico

- **Status:** emissão/reprodução, acompanhamento manual de assinaturas e avisos implementados; documentos externos pendentes.
- **Decisão:** gerar DOCX localmente com PHPWord, usando somente `${NOME_DA_VARIAVEL}` de um catálogo canônico. Uploads são inspecionados e versionados, com visualização aproximada do original; a emissão congela dados e versão e produz arquivo temporário. O download oferece DOCX padrão ou PDF convertido por LibreOffice privado, sem acervo de saídas. Atestados também possuem histórico e somente a coordenação titular/substituta os emite. Revisão jurídica e conferência visual permanecem necessárias.
- **Motivo:** permite validar os dados usados e preserva rastreabilidade sem armazenar documentos finais.
- **Referências:** [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis).

### D-021 — Reconciliação temporal por schedules idempotentes

- **Status:** parcialmente implementado.
- **Implementação atual:** `internships:sync-execution-status` reconcilia início, pausa e retomada; `holidays:prepare` mantém o calendário; `internship-requests:notify-office` resume solicitações e cancelamentos pendentes. Todos estão descritos em [Schedules](doc:schedules).
- **Pendências:** aviso ao discente sobre o término previsto e resumo diário dos eventos temporais do estágio ainda não estão implementados. O critério de sete dias continua em revisão.
- **Decisão:** a passagem do tempo não conclui ou cancela estágio/documento nem abre automaticamente correções. A aprovação da avaliação com carga horária cumprida pode concluir em transação; assinatura, cancelamento documental e reemissão continuam sob ação do Setor.
- **Motivo:** a passagem do tempo não pode depender de alguém acessar o sistema, mas decisões de conclusão, correção e reenvio ainda exigem regras e análise humanas. Restringir o escopo aos fatos temporais evita efeitos duplicados e processamento desnecessário.
- **Referências:** [Schedules](doc:schedules), [Ciclos de status](doc:ciclos-de-status) e [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).

### D-022 — Avisos de assinatura e término por canal adequado

- **Status:** avisos de assinatura e eventos de domínio implementados; lembrete de término e resumo temporal do Setor pendentes.
- **Decisão:** ao colocar um documento assinável em `awaiting_signature`, o Setor informa onde ele está disponível e escolhe os interessados elegíveis por checkboxes. Pessoas com vínculo recebem aviso interno e e-mail; o contato externo selecionado da concedente recebe somente e-mail. Não há destinatário digitado livremente nem nome de plataforma fixa. Os avisos atuais de fatos temporais cobrem início, pausa e retomada. O Setor recebe o resumo interno de solicitações e cancelamentos pendentes; um resumo de eventos temporais do estágio ainda depende de implementação. O aviso único de término previsto permanece pendente de decisão final.
- **Motivo:** a assinatura exige que o Setor comunique o local efetivo, que pode mudar de plataforma, sem transformar uma ferramenta externa em dependência do domínio. A separação de canais mantém o discente informado e evita que o Setor receba e-mails ou avisos fragmentados em excesso.
- **Referências:** [Migration 16 — generated_documents](doc:migration-16-generated-documents), [Schedules](doc:schedules) e [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas).

### D-023 — Jornada fixa, pausas e alteração somente por aditivo

- **Status:** parcialmente implementado.
- **Implementação atual:** a solicitação registra a jornada semanal; o Setor pode ajustá-la na gestão do estágio antes da liberação, e alterações relevantes recalculam a previsão. Depois da liberação, a edição atual mantém a jornada pactuada. Pausas têm período e motivo e não alteram a jornada. O tipo de documento `addendum`, sua emissão e conferência manual de assinatura estão disponíveis.
- **Pendência:** a integração que, após assinatura conferida, encerra a vigência anterior, grava uma nova linha em `internship_work_schedules` e recalcula a previsão ainda não está implementada. Não há alteração temporária de carga horária separada desse fluxo.
- **Motivo:** mantém o cálculo simples e rastreável, separa interrupção de execução de mudança contratual e impede que um ajuste informal reescreva a base de documentos ou de cálculos anteriores.
- **Referências:** [Migration 23 — internship_work_schedules](doc:migration-23-internship-work-schedules), [Migration 22A — internship_calendar_overrides](doc:migration-22-internship-calendar-overrides), [Service — InternshipEndDateCalculator](doc:service-internshipenddatecalculator) e [Fluxos principais](doc:fluxos-principais#4-estagio-em-andamento).


### D-024 — Administração local concentrada no Setor de Estágio

- **Status:** definido e aplicado à gestão de cursos, tipos de estágio, dados do próprio campus, usuários/vínculos locais e consultas locais de logs.
- **Decisão:** remover Administrador do Campus como perfil disponível e transferir suas responsabilidades locais ao Setor de Estágio (`InternshipOffice`). Esse vínculo administra dados do próprio campus, cursos, tipos de estágio, concedentes, documentos e operações de estágio pelas Policies específicas. A gestão local de pessoas e vínculos, análise de abertura, avaliação, calendário e gestão documental também estão implementadas. O Administrador do Sistema provisiona vínculos do Setor; gestão global de campi e consultas administrativas globais permanecem exclusivas do vínculo ativo selecionado de Administrador do Sistema, sem bypass global para recursos locais.
- **Motivo:** concentrar os cadastros e a operação local na equipe responsável pelos estágios, evitando um perfil adicional para tarefas da mesma equipe.
- **Compatibilidade:** nenhuma migration é criada ou alterada. O código interpreta vínculos existentes com `campus_administrator` como Setor de Estágio, preservando IDs, referências, desativação e snapshots históricos. Esse valor não pode ser usado em novos cadastros e não aparece como opção. Consultas administrativas e proteção contra duplicidade ativa incluem o legado. Seleção de contexto não reescreve o tipo persistido nem registra atividade.
- **Limites:** o campus vem do vínculo ativo e selecionado. Campus desativado permite somente consulta autorizada; vínculo desativado não concede acesso. Coordenadores opcionais devem ser ativos, distintos e do mesmo campus. Tipos de estágio exigem curso ativo no cadastro, na troca de curso e na reativação; edição pode manter a associação atual desativada e preserva snapshots formalizados. As regras de exclusão, referências históricas, senhas e autoria da auditoria permanecem vigentes. O Setor consulta a auditoria administrativa e e-mails do próprio campus; também consulta e-mails operacionais dos estágios do campus, conforme Policies e escopo de cada tela. Referências na auditoria identificam nomes atuais dentro do escopo, preservando IDs históricos.
- **Referências:** [Tipos de vínculo](doc:enum-affiliationtype), [Perfis e responsabilidades](doc:perfis-e-responsabilidades-por-vinculo), [Matriz de autorização](doc:matriz-de-autorizacao), [Fase 05](doc:fase-05-administracao) e [Cursos](doc:migration-09-courses).

### D-025 — Gestão direta e disponibilidade de partes concedentes

- **Status:** implementado.
- **Decisão:** gestão direta exclusiva do Setor de Estágio no campus selecionado, com `deactivated_at` independente da exclusão física. Desativação impede novas associações e preserva registros existentes. Exclusão física somente sem estágios, solicitações de estágio ou solicitações de cadastro associados; endereço é removido fisicamente na mesma transação, preservando referências compartilhadas ou históricas; auditoria é preservada. CPF/CNPJ não têm unicidade nem associam contas automaticamente.
- **Compatibilidade:** coluna adicionada à migration original, antes da implantação em produção; ambientes locais já migrados precisam de sincronização separada, sem descarte automático de dados.
- **Limites:** propostas de cadastro, aprovação/devolução e associação à solicitação estão implementadas; não há portal próprio da concedente. Logs incluem concedentes, tipos de estágio e endereços dos cadastros locais autorizados, com identificação histórica do proprietário. Desativação/exclusão exigem senha atual; campus inativo permite leitura.

### D-026 — Gestão de vínculos próprios fora do contexto selecionado

- **Status:** implementado.
- **Decisão:** a pessoa pode gerir seus próprios vínculos dentro das permissões e do escopo normal, inclusive desativar e excluir quando não houver referências. O vínculo selecionado na sessão permanece protegido contra desativação e exclusão para não invalidar o contexto em uso. O Setor pode reativar vínculo local próprio, com confirmação e verificação de duplicidade; reativação de vínculos de outras pessoas segue exclusiva do Administrador do Sistema.
- **Limites:** senha atual e confirmação continuam exigidas para desativar ou excluir; último Administrador do Sistema ativo, referências de negócio, campus e tipo fora do escopo continuam protegidos. A edição não altera tipo, campus ou curso.

- **Decisão:** Endereço, Campus e Concedente usam exclusão física. A exclusão Eloquent de qualquer proprietário atual de endereço remove a linha associada somente sem outras referências, preservando auditoria e histórico de terceiros. As migrations originais de Campus e Concedente foram ajustadas antes da produção; não há migration adicional de SoftDeletes para endereços.

### D-027 — Calendário anual automático e recorrência municipal fixa

- **Status:** implementado.
- **Decisão:** buscar nacionais e estaduais das 27 UFs na BrasilAPI para ano atual e dois seguintes, reaproveitando consultas concluídas e recuperando falhas. Todos os eventos aceitos bloqueiam o calendário, inclusive facultativos. Municípios não são importados; possuem cadastro avulso ou recorrência fixa editável. Nenhum cálculo de Páscoa ou regra móvel existe no SGE.
- **Manutenção:** calendário único, sem propriedade por campus. Somente Administrador do Sistema mantém ocorrências, recorrências, importações e revisão. Setor tem leitura de toda a base, sem restrição automática por UF ou cidade. A seleção territorial do cálculo inicial e sua repetição no aceite usam a cidade/UF do local de execução.
- **Compatibilidade:** migration original editada antes da produção, com todas as estruturas do calendário declaradas diretamente. Bancos existentes serão recriados pelo responsável com `migrate:fresh`; não haverá comando para adaptar schemas antigos.
- **Limites:** cálculo no envio/aceite, recálculos após alterações do estágio, pausas e exceções estão integrados. Não há snapshots versionados de todas as entradas nem vigências históricas de localização/jornada; o calendário global alterado não dispara recálculo automático. Soft delete e Activity Log não equivalem a calendário versionado reproduzível; a reprodução histórica completa de D-019 continua pendente.
- **Validação:** testes removidos por decisão explícita do projeto. Nesta etapa, usar formatação, sintaxe e compilação, sem criar ou executar testes.
- **Referências:** [Calendário de feriados](doc:calendario-de-feriados), [holidays](doc:migration-22-holidays) e [Testes](doc:testes-existentes).

### D-028 — Envio completo com cadastros pendentes e histórico da abertura

- **Status:** confirmado pelo responsável em 16/10/2026 e implementado nesta entrega.
- **Decisão:** dados pessoais completos são obrigatórios no envio; nulabilidade atende o preenchimento parcial do rascunho e o progresso salvo. Concedente e supervisor inexistentes seguem como pedidos tipados completos junto com o formulário; o Setor cria/seleciona os cadastros e associa as referências antes do aceite. O início proposto exige sete dias corridos após cada envio. O Discente escolhe um orientador ativo do campus; o Setor pode confirmar ou alterar esse vínculo no aceite. Para supervisor já cadastrado, o Setor escolhe qual qualificação do perfil será congelada no estágio.
- **Schema:** por decisão do responsável, os quatro snapshots JSONB, as FKs de endereços históricos e `decision_reason` ficam na Migration 19 original, e `city_id` fica na Migration 12B original. A migration aditiva foi removida; o responsável fará a recriação do banco com `migrate:fresh`. Nenhuma migration foi executada nesta adequação.
- **Histórico:** perfis continuam atuais e compartilhados; snapshots e endereços copiados preservam o envio. Endereços do estágio são novas cópias do local aprovado. Pedidos originais e suas decisões permanecem depois da associação. Correções não criam outra solicitação nem versões artificiais; salvar mantém a correção aberta, e reenviar explicitamente marca respondida e exige nova análise.
- **Limites:** cálculo e recálculos após mudanças relevantes, pausas e exceções usam o calendário local completo/revisado, sem chamadas externas. A vigência de jornada após aditivo e a base historicamente reproduzível de D-019 continuam pendentes; geração, assinatura e reemissão documental estão integradas em fase posterior. Nenhuma evidência privada ou seus metadados entram em auditoria, snapshot documental ou e-mail.

### D-029 — Gestão segura de templates e geração documental

- **Status:** gestão de templates e integração posterior com geração/reprodução implementadas.
- **Decisão:** reutilizar Migrations 13, 14 e 16 e coleção privada `template_file`, sem novas dependências. Classificação de remuneração na Migration 13 original, aplicada ao banco existente por migration temporária, sem fresh. Validar estrutura e marcadores no upload, sem confirmação posterior nem ação de disponibilizar. Cada arquivo aceito já é validado; tentativa recusada preserva a vigente e arquivo nunca é substituído. Versão usada não muda nem é removida. Excluir versão nunca usada remove mídia e pode fazer a anterior validada voltar a vigorar. Auditoria permanente de upload preserva a sequência numérica.
- **Catálogo:** sem obrigatoriedade ou classificação de variáveis, revisão 8 no código e guia consultável; o marcador de parágrafo composto foi substituído por modelos separados; somente três tipos existentes, sem variável de numeração pública. Variáveis sem fonte/contrato são reservadas e rejeitadas. Não inferir dados institucionais de vínculos ou inventar snapshots.
- **Escopo:** Setor consulta e mantém somente o próprio campus. O campus é definido pelo vínculo ativo no backend, sem seletor no formulário ou filtro de escopo na lista. Registros antigos sem campus são preservados, mas não recebem acesso por este fluxo. A regra de unicidade institucional do atestado permanece independente do filtro de acesso.
- **Exclusão do catálogo:** permitida quando nenhuma versão tiver sido usada por documentos, mediante autorização e senha atual; versões e arquivos sem uso são removidos na mesma operação, com limpeza de mídia após o commit e auditoria preservada.
- **Limites:** geração DOCX/PDF, prévias do template, assinatura manual e avisos estão integrados em fases posteriores. O registro de documentos externos sem arquivo permanece pendente. A revisão manual do original não certifica conteúdo jurídico automaticamente. Verificação sem criar ou executar testes, conforme solicitação do responsável.
- **Referência:** [Contrato e catálogo](doc:geracao-de-documentos-docx-e-variaveis).

### D-030 — Cadastro único de template de atestado de orientação

- **Status:** definido pelo responsável e implementado.
- **Decisão:** apenas um template lógico `orientation_certificate` em todo o sistema, incluindo registros desativados e todos os escopos. Impedir segunda criação e conversão de outro tipo enquanto existir o cadastro. O tipo do atestado existente é preservado; nome/descrição e disponibilidade podem ser mantidos conforme autorização.
- **Histórico:** conservar o versionamento do DOCX. Um cadastro único pode ter várias revisões; arquivos diferentes não substituem a versão anterior. A unicidade não limita os atestados que os coordenadores autorizados já podem emitir.
- **Autorização:** a regra não amplia escrita global ou acesso entre campi. Não expor identificação ou dados de um atestado de outro campus ao informar a indisponibilidade de novo cadastro.
- **Implementação:** lock transacional do catálogo e validação do Model, sem alteração de schema ou dependências. Verificação sem criar ou executar testes, conforme solicitação vigente.
- **Referências:** [GeneratedDocumentType](doc:enum-generateddocumenttype), [catálogo](doc:migration-13-document-templates) e [versões](doc:migration-14-template-versions).

As variáveis disponíveis do catálogo DOCX são comuns a todos os tipos e classificações de remuneração. O tipo classifica o template, sem restringir os marcadores aceitos no upload; o guia oferece busca global. Variáveis reservadas, sem origem implementada, continuam identificadas separadamente.

A vigência do template DOCX é um ponteiro operacional `current_version_id`, mantido no catálogo. Upload aprovado seleciona a nova versão; o Setor pode selecionar outra versão aprovada com confirmação, integridade do arquivo e auditoria. A troca preserva versões e documentos já vinculados. Excluir a vigente seleciona a maior versão aprovada restante; excluir outra versão não muda a seleção.
