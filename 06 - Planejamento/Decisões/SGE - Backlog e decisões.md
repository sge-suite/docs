---
title: SGE — Backlog e decisões
description: Decisões aprovadas e assuntos ainda pendentes no planejamento do SGE.
type: decisions
status: in-progress
tags:
  - sge/decisoes
  - sge/backlog
aliases:
  - Backlog do SGE
---
## Próximas definições

- [ ] Confirmar perfis oficiais e responsabilidades.
- [x] Fechar o catálogo de placeholders e os critérios de validação dos templates.
- [ ] Definir política de retenção de documentos e auditoria.
- [ ] Criar testes de aceitação para os fluxos principais.
- [ ] Mapear os campos, critérios, escalas e regras condicionais dos formulários nativos de abertura e avaliação.

## Decisões registradas

### D-001 — Documentação em Markdown com Mermaid

- **Status:** definido.
- **Decisão:** manter a documentação no vault do Obsidian em arquivos `.md`, com diagramas Mermaid.
- **Motivo:** facilita navegação, versionamento e atualização durante o desenvolvimento.

### D-002 — Papéis separados de vínculos

- **Status:** definido.
- **Decisão:** não tratar função institucional apenas como um campo fixo no usuário. Usar `affiliations` para permitir múltiplos contextos por pessoa, campus e função.
- **Motivo:** um usuário pode exercer funções diferentes em campi ou em momentos diferentes.

### D-004 — Dados pessoais fora de `internships`

- **Status:** definido.
- **Decisão:** CPF, RG, data de nascimento e endereço atual ficarão em `user_personal_data`, relacionado um-para-um com `users`; os estágios manterão FKs e snapshots `jsonb` para preservar o histórico.
- **Motivo:** evita repetição de dados pessoais e mantém os documentos e estágios imunes a alterações posteriores no cadastro.

### D-005 — Configurações pessoais por tipo de vínculo

- **Status:** definido.
- **Decisão:** qualquer usuário pode alterar a própria senha e e-mail de login; o nome não é editável. Somente o discente pode editar RG, data de nascimento e endereço atual pela própria conta.
- **Motivo:** separa dados da conta de dados necessários ao estágio e restringe a edição aos usuários que realmente precisam desses campos.

### D-006 — Canvas espacial para diagramas Mermaid

- **Status:** definido.
- **Decisão:** manter os diagramas Mermaid em notas Markdown independentes e organizá-los em um canvas específico por meio de cards de arquivo.
- **Motivo:** preserva a renderização e a exportação dos diagramas, ao mesmo tempo que permite navegação espacial no Obsidian.

### D-007 — Canvas do fluxograma com cards padronizados

- **Status:** definido.
- **Decisão:** o canvas do fluxograma usará cards de texto coloridos, grupos e conexões com cores por semântica. O JSON Canvas não possui formas nativas específicas para processo, decisão, documento ou banco de dados.
- **Motivo:** evita depender de recursos que não fazem parte do formato e mantém o arquivo compatível com o Obsidian.

### D-008 — Trilhas separadas para notificações e e-mails

- **Status:** definido.
- **Decisão:** `notifications` registrará o aviso interno; `email_messages` preservará a mensagem preparada e `email_delivery_attempts` cada envio ou reenvio. Não haverá verificação de e-mail nem `email_verification_challenges`. Cada tentativa segue diretamente de `queued` para `sent` ou `failed`.
- **Motivo:** preserva conteúdo e histórico de entrega das notificações operacionais, sem armazenar tokens de recuperação e sem confundir leitura interna com aceite pelo SMTP.
- **Referência:** [[SGE - E-mails, notificações e entregas]].

### D-009 — Ciclo e validade da avaliação do supervisor

- **Status:** definido.
- **Decisão:** após a liberação e notificação, o supervisor poderá salvar a avaliação como `Draft`, com campos ainda nulos. Em `Submitted`, `Returned`, `Approved` e `Cancelled`, todos os campos obrigatórios do caminho condicional escolhido estarão preenchidos. O Setor de Estágio poderá aprovar ou devolver, mas não editar respostas. `Returned` reabre o mesmo registro para edição integral e novo envio; cada alteração e transição fica no `activity_log`. O supervisor poderá cancelar um `Submitted` ou `Returned`, sem exclusão física e com motivo. A aprovação exige a confirmação de carga horária cumprida; se ela não estiver cumprida, o Setor devolve a resposta. A avaliação vigente será o `Approved` mais recente por data de envio.
- **Motivo:** preserva um único formulário por estágio e supervisor, permite correção integral sem criar versões artificiais e mantém a auditoria de valores e estados fora da interface do supervisor.
- **Autorização:** a análise pertence ao vínculo `AffiliationType::InternshipOffice`; `AffiliationType::Coordinator` continua representando o coordenador de curso.
- **Referências:** [[SGE - Enum - EvaluationStatus]], [[SGE - Migration - 18 - Evaluations|Migration de avaliações]] e [[SGE - Fluxos principais#6 Acompanhamento acadêmico e conclusão|fluxo de avaliação]].

### D-010 — Templates DOCX versionados e saída sem arquivo final

- **Status:** definido.
- **Decisão:** templates DOCX serão cadastrados separadamente dos tipos de documento. Depois de utilizado, um template não será editado: qualquer alteração cria uma nova versão. Cada documento gerado pelo SGE referencia a versão e a snapshot de dados usadas na geração; o SGE não armazena o arquivo DOCX/PDF final ou o documento assinado.
- **Motivo:** permite rastrear e, quando necessário, reproduzir a geração histórica sem misturar template, tipo documental e arquivo final.
- **Referências:** [[SGE - Migration - 13 - Document templates]], [[SGE - Migration - 14 - Template versions]] e [[SGE - Migration - 16 - Generated documents]].

### D-011 — Solicitações pendentes são registros próprios

- **Status:** definido.
- **Decisão:** dados de supervisor ou parte concedente ainda não cadastrados serão salvos em estruturas próprias de solicitação, com origem, análise, decisão, motivo e associação ao cadastro resultante. Notificações apenas avisam o Setor de Estágio e apontam para a solicitação.
- **Motivo:** uma notificação não preserva adequadamente os dados, o histórico de análise e a decisão do cadastro.

### D-012 — Identificação flexível de partes concedentes

- **Status:** definido.
- **Decisão:** `granting_parties` usará `document_type` (`CPF` ou `CNPJ`) e `document_number` normalizado. O CPF pode ser único; o CNPJ não será necessariamente único, pois unidades distintas podem compartilhá-lo e serão diferenciadas pelos demais dados cadastrais.
- **Motivo:** representa corretamente redes e unidades que usam o mesmo CNPJ sem impedir o fluxo de cadastro.
- **Referências:** [[SGE - Migration - 12 - Granting parties]] e [[SGE - Glossário]].

### D-013 — Controle de acesso por vínculos e remoção das tabelas de permissão

- **Status:** definido.
- **Decisão:** remover as tabelas de permissões anteriormente previstas. A autorização será feita exclusivamente pelos recursos nativos do Laravel: Gates e Policies verificam vínculo ativo, `AffiliationType`, campus/curso, posse do registro e estado do fluxo. A matriz é estática no código e nos testes.
- **Motivo:** as regras são institucionais, determinísticas e tipadas. O vínculo já representa função e escopo, sem segunda fonte de verdade ou tabelas dinâmicas.
- **Referências:** [[SGE - Modelo de dados - Acesso]] e [[SGE - Matriz de autorização]].

### D-014 — Pesos e conceitos pertencem ao tipo de estágio

- **Status:** definido.
- **Decisão:** cada tipo de estágio definirá a carga horária, os pesos da avaliação do supervisor, do relatório e da apresentação, e os valores numéricos dos conceitos da avaliação. Os três pesos devem totalizar 10. Na criação do estágio, essas regras serão copiadas para o snapshot do tipo; alterações posteriores no cadastro do tipo não recalcularão estágios já iniciados.
- **Motivo:** os critérios de conclusão variam por modalidade e precisam permanecer auditáveis no contexto em que o estágio foi realizado.
- **Referências:** [[SGE - Migration - 11 - Internship types]], [[SGE - Migration - 15 - Internships]] e [[SGE - Migration - 18 - Evaluations]].

### D-015 — Solicitação única e correções orientadas

- **Status:** definido.
- **Decisão:** o formulário nativo de abertura edita uma única solicitação de estágio vinculada ao `affiliation_id` do discente. Após o aceite, a solicitação é associada a um único estágio. Devoluções não criam outra solicitação nem versões completas de resposta: elas abrem um registro de correção com mensagem e seções afetadas. O discente altera somente as seções indicadas e reenvia a mesma solicitação. Todo reenvio volta obrigatoriamente para análise e aprovação formal do Setor de Estágio antes de gerar ou reemitir documentos. O `activity_log` preserva os valores alterados e o contexto da ação.
- **Motivo:** preserva um processo simples para o discente e deixa as correções visíveis e priorizadas para o Setor de Estágio, sem usar o log de auditoria como fonte do estado atual.
- **Referências:** [[SGE - Migration - 19 - Internship requests]], [[SGE - Migration - 20 - Internship request corrections]], [[SGE - Migration - Base 04 - Activity log]] e [[SGE - Fluxos principais#2 Solicitação]].

### D-016 — Parágrafo de remuneração gerado no documento

- **Status:** definido.
- **Decisão:** o template padrão usa o marcador descritivo `${PARAGRAFO_REMUNERACAO}`. `RemunerationParagraphFormatter` insere o §1º completo: remunerado, com bolsa e auxílio-transporte em moeda e por extenso; ou não remunerado. A condição é definida diretamente por `is_remunerated`; não haverá tabela de regras nem editor de texto neste momento. O número de processo de credenciamento é uma substituição de dado simples quando o template o solicitar. Quando houver diferenças relevantes de credenciamento, serão mantidos templates separados e o Setor de Estágio escolherá manualmente o modelo aplicável em cada geração.
- **Motivo:** o §1º é conhecido e estável; manter a regra em um único serviço evita multiplicar templates por combinações de remuneração. Já as diferenças estruturais de credenciamento justificam modelos próprios, sem automatismo de seleção.
- **Referências:** [[SGE - Migration - 12 - Granting parties]], [[SGE - Migration - 13 - Document templates]], [[SGE - Migration - 16 - Generated documents]] e [[SGE - Helper - NumberToWordsHelper]].

### D-017 — Cancelamento solicitado pelo discente

- **Status:** definido.
- **Decisão:** antes de existir um estágio formalizado, o discente pode desistir cancelando a própria solicitação. Depois do aceite, pode solicitar cancelamento antes do início ou durante o estágio, sempre com motivo e histórico. O Setor de Estágio aprova ou recusa. A aprovação cancela documentos ainda não assinados, preserva documentos assinados, gera rescisão quando aplicável, cancela avaliações pendentes e mantém notas/avaliações aprovadas apenas como histórico, sem concluir o estágio.
- **Motivo:** a desistência é diferente de uma recusa do Setor e o cancelamento de estágio formalizado exige tratamento rastreável.
- **Referências:** [[SGE - Migration - 21 - Internship cancellation requests]], [[SGE - Fluxos principais#4 Estágio em andamento]] e [[SGE - Migration - Base 04 - Activity log]].

### D-018 — Emancipação exige comprovação e validação institucional

- **Status:** definido.
- **Decisão:** o formulário terá rádio obrigatório com três opções: maior de idade, menor de idade e menor emancipado. Maior é conferido contra a data de nascimento; menor exige responsável legal. Menor emancipado envia o comprovante pelo próprio SGE, em upload privado vinculado à solicitação, e dispensa o responsável neste envio. Cada upload gera registro próprio, com vínculo do discente, instante, mídia privada e status de análise; novo envio não apaga o anterior. O envio cria pendência de verificação, não aprovação automática: o Setor confere manualmente e valida ou devolve com motivo. Se devolver por prova inválida, o discente envia nova prova ou muda para menor de idade e informa o responsável. A validação registra data, vínculo responsável e referência à mídia protegida. O arquivo não entra no `activity_log`, em mensagens de e-mail ou em documentos gerados e só é visível ao discente e ao Setor conforme necessidade.
- **Motivo:** o rádio deixa a interface clara para o discente e preserva a análise humana da prova, sem forçar os dados de responsável antes de o Setor apontar uma pendência.
- **Referências:** [[SGE - Migration - 02 - User personal data]] e [[SGE - Migration - 19 - Internship requests]].

### D-019 — Previsão de término reproduzível

- **Status:** definido.
- **Decisão:** a data prevista de término é calculada pela jornada válida, pela margem de sete dias corridos configurada e congelada no tipo de estágio, pelo calendário do campus e pelas pausas. Eventual nova vigência exige aditivo formalizado. O cálculo limita o último dia às horas restantes e persiste uma base reproduzível; não aceita horas restantes livres como fonte primária.
- **Motivo:** mantém o cálculo rastreável e evita resultados inconsistentes após alterações de calendário, jornada ou pausa.
- **Referências:** [[SGE - Service - InternshipEndDateCalculator]], [[SGE - Migration - 22 - Non-working dates]] e [[SGE - Migration - 23 - Internship work schedules]].

### D-020 — Motor DOCX local e catálogo canônico

- **Status:** definido.
- **Decisão:** gerar DOCX localmente com PHPWord, usando somente `${NOME_DA_VARIAVEL}` de um catálogo canônico. Uploads são inspecionados, renderizados e versionados; o resultado é temporário e não vira acervo. Cada template passa por revisão antes de ser ativado.
- **Motivo:** permite validar os dados usados e preserva rastreabilidade sem armazenar documentos finais.
- **Referências:** [[SGE - Geração de documentos DOCX e variáveis]].

### D-021 — Reconciliação temporal por schedules idempotentes

- **Status:** definido.
- **Decisão:** dois commands diários, no fuso institucional, reconciliarão a execução do estágio e enviarão o único lembrete de término previsto a sete dias. O primeiro inicia estágios liberados na data planejada, pausa estágios com pausa ativa e retoma os pausados cujo período terminou. O segundo avisa o discente e gera o resumo interno agrupado do Setor de Estágio. Assinaturas, cancelamento documental, pendência, correção e reemissão são tratados manualmente pelo Setor. Não haverá conclusão automática, cancelamento automático de documento, abertura automática de correção, recálculo diário da previsão nem varredura genérica de e-mails.
- **Motivo:** a passagem do tempo não pode depender de alguém acessar o sistema, mas decisões de conclusão, correção e reenvio ainda exigem regras e análise humanas. Restringir o escopo aos fatos temporais evita efeitos duplicados e processamento desnecessário.
- **Referências:** [[SGE - Schedules]], [[SGE - Ciclos de status]] e [[SGE - E-mails, notificações e entregas]].

### D-022 — Avisos de assinatura e término por canal adequado

- **Status:** definido.
- **Decisão:** ao colocar um documento assinável em `awaiting_signature`, o Setor informa em campo textual genérico onde ele está disponível e escolhe, por checkboxes, os interessados elegíveis que devem ser avisados. Pessoas com conta recebem notificação interna e e-mail; o contato externo selecionado da concedente recebe somente e-mail. Não há destinatário digitado livremente nem nome de plataforma hardcoded. O discente recebe notificação interna e e-mail pelos fatos temporais do próprio estágio e por um único lembrete sete dias antes da previsão vigente de término. O Setor recebe somente um resumo interno diário, por campus e destinatário, que agrupa eventos e pendências.
- **Motivo:** a assinatura exige que o Setor comunique o local efetivo, que pode mudar de plataforma, sem transformar uma ferramenta externa em dependência do domínio. A separação de canais mantém o discente informado e evita que o Setor receba e-mails ou avisos fragmentados em excesso.
- **Referências:** [[SGE - Migration - 16 - Generated documents]], [[SGE - Schedules]] e [[SGE - E-mails, notificações e entregas]].

### D-023 — Jornada fixa, pausas e alteração somente por aditivo

- **Status:** definido.
- **Decisão:** a solicitação define uma jornada semanal por carga horária em cada dia, sem registrar horários de entrada ou saída. Essa jornada permanece fixa durante a execução. Pausas são registradas normalmente no formulário: suspendem o cômputo e alteram a previsão de término, mas nunca distribuem ou modificam horas. Quando uma pausa não prevista precisar ter seus efeitos formalizados no instrumento do estágio, o Setor de Estágio gera um aditivo, conforme a análise do caso. Qualquer alteração de carga horária exige um documento de aditivo; somente depois de suas assinaturas serem conferidas pelo Setor o sistema encerra a vigência anterior, cria a nova e recalcula a previsão. Não há alteração temporária de carga horária como funcionalidade independente.
- **Motivo:** mantém o cálculo simples e rastreável, separa interrupção de execução de mudança contratual e impede que um ajuste informal reescreva a base de documentos ou de cálculos anteriores.
- **Referências:** [[SGE - Migration - 23 - Internship work schedules]], [[SGE - Service - InternshipEndDateCalculator]] e [[SGE - Fluxos principais#4 Estágio em andamento]].
