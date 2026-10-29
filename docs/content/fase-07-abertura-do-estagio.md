---
id: fase-07-abertura-do-estagio
title: Fase 07 — Abertura do estágio
description: Solicitação do discente, cadastros relacionados, análise e formalização inicial do estágio.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/estagio, sge/checklist
related: fluxos-principais, fase-08-estagio-em-andamento, migration-11-internship-types, migration-19-internship-requests, cadastros-pendentes-de-supervisor-e-concedente
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/ManageStudentInternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRegistration.php, https://github.com/sge-suite/sge/blob/master/app/Support/InternshipRequestSnapshots.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ProjectInternshipRequestEndDate.php, https://github.com/sge-suite/sge/blob/master/app/Support/InternshipRequestReceipt.php
updated: 2026-10-28
---
Base: [fluxo de abertura](doc:fluxos-principais#2-solicitacao) e [contrato da solicitação](doc:migration-19-internship-requests).

A abertura usa uma solicitação única por vínculo discente. O Discente pode salvar o rascunho incompleto e retomá-lo; enviar para análise é uma ação separada e exige todos os campos obrigatórios do caminho escolhido, consentimento e validações de domínio. Devoluções alteram a mesma solicitação e liberam somente as seções indicadas pelo Setor.

O formulário exibe o e-mail institucional do Setor de Estágio do campus para dúvidas. O botão copia somente o endereço e confirma a ação por toast; não abre um cliente de e-mail. Esse contato não muda os destinatários das notificações operacionais.

## Formulário e dados

- A seleção de tipo de estágio é limitada ao curso ativo do vínculo. O tipo informa os anos/semestres permitidos; o campo usa “Ano” quando todas as opções são anuais, “Semestre” quando todas são semestrais e “Ano ou semestre” quando há ambos. O Discente escolhe um deles, e o servidor confere a opção contra o JSONB do tipo.
- O Discente seleciona um orientador ativo do campus. O e-mail exibido junto ao nome é o do vínculo e ajuda a distinguir pessoas com nomes iguais. O Setor pode confirmar ou substituir o orientador no aceite.
- O co-orientador é um input de texto opcional, limitado a 255 caracteres, sem vínculo nem permissões. Integra a seção de estágio, a revisão e o comprovante; é copiado no aceite e nas correções aprovadas dessa seção. No estágio, o Setor pode editar o nome, exibido nas consultas e na auditoria. Em 20/10/2026, as colunas `co_advisor_name` foram aplicadas ao banco existente por migration temporária, depois removida; as migrations originais foram atualizadas, sem recriar tabelas.
- Ao salvar os dados pessoais no formulário, as alterações são gravadas em `user_personal_data` e também ficam no rascunho da solicitação. A tela Configurações → Dados pessoais mostra os mesmos dados atuais. O envio valida nome, CPF, e-mail, matrícula, RG, órgão e data de emissão, nascimento, telefone e endereço; então cria os snapshots do envio. Nome/CPF vêm da conta, enquanto e-mail e matrícula vêm do vínculo discente.
- A data de nascimento determina automaticamente a maioridade. Para menor de idade, o Discente escolhe entre menor e menor emancipado. Menor exige nome, CPF, parentesco e e-mail do responsável; menor emancipado envia prova privada para análise do Setor.
- Setor/área e atividades são obrigatórios. Jornada, pausas planejadas, remuneração e data inicial seguem as regras do tipo; a data proposta precisa respeitar sete dias corridos após o envio. A previsão de término usa a carga, jornada, margem configurada e calendário local disponível. Recálculos após alterações relevantes do estágio, pausas e exceções estão implementados; novos cálculos salvos preservam uma base reproduzível, e aditivos assinados aplicam novas vigências de jornada.
- A data inicial precisa cair em um dia com horas na jornada e não pode coincidir com feriado do local do estágio ou pausa. A regra é conferida ao avançar na jornada e nas Actions de salvamento/envio quando há dados suficientes; a edição contratual e o aceite de correções também verificam os bloqueios e pausas do estágio. O erro identifica o campo da data, sem deslocar automaticamente o início escolhido.

## Concedente e supervisor

A abertura aceita uma concedente ou um supervisor já cadastrados, ou uma proposta de cadastro completa. CPF/CNPJ repetido em outro campus não autoriza reutilização. As propostas pendentes seguem em registros tipados e podem ser analisadas depois do envio da abertura; o Setor precisa associar os cadastros aprovados antes do aceite do estágio.

As duas etapas começam pela busca por nome ou documento com Scout/Meilisearch, sem exigir que o Discente saiba se há cadastro. A busca de concedentes usa o índice `granting_parties`, com filtros de campus, atividade e cidade; a de supervisores usa `users`, restringindo os resultados a pessoas com vínculo ativo de Supervisor no campus. Os registros retornados também passam pelos escopos atuais do banco antes da exibição. A busca de nomes aceita acentos ou sua ausência: “tres passos” encontra “Três Passos”. CPF/CNPJ não recebe tolerância a erros de digitação.

Na etapa da concedente, o filtro opcional de cidade fica sempre exposto, fora de accordion e antes do seletor “Onde você fará o estágio?”; a busca de cidades usa Scout/Meilisearch e filtra pelo atributo `state`. As opções da concedente mostram nome e CPF/CNPJ; sem filtro de cidade também identificam a cidade, sem repetir essa informação quando o filtro está ativo. “Não encontrei a concedente/supervisor” abre o preenchimento de uma proposta, reaproveitando o termo da busca quando aplicável. “Voltar para busca” mantém os dados ainda não associados; “Trocar concedente/supervisor” inicia a escolha de outro cadastro.

A escolha de orientador pelo discente e as escolhas de orientador, supervisor e concedente na análise do Setor também pesquisam pelo Meilisearch. Esses selects recebem até 20 opções elegíveis por resposta, com ID e rótulo, sem carregar o catálogo no HTML. A seleção atual é recuperada por consulta pontual autorizada e permanece fora da página de resultados quando necessário, inclusive nas associações históricas já permitidas. A existência de orientadores e a validação da escolha são consultadas separadamente. O carregamento não refaz todo o formulário, e respostas de buscas anteriores são ignoradas. A pesquisa não grava o rascunho nem amplia o acesso aos cadastros.

No preenchimento da proposta, sair do campo CPF/CNPJ confere os cadastros elegíveis. Uma concedente encontrada é selecionada automaticamente; havendo várias unidades com o mesmo documento, a tela volta à seleção e pede a escolha da unidade. O CPF do supervisor só provoca seleção automática quando há vínculo ativo de Supervisor no campus; a existência de uma conta ou de outro papel não basta. A tela explica a mudança e apresenta os dados para conferência, preservando o cargo/função informado. Não cria nem envia uma proposta duplicada. As conferências são repetidas ao salvar e ao enviar, inclusive para rascunhos anteriores e cadastros que se tornem disponíveis durante o preenchimento. A seleção não altera os dados institucionais nem cria vínculos automaticamente.

A proposta de concedente muda conforme o documento: CPF exige nome, documento, endereço completo, telefone e e-mail; CNPJ exige razão social, documento, representante, cargo, telefone, e-mail e cidade. UF/cidade são escolhidas pelo catálogo. Conselho, credenciamento e área de atuação não são exigidos nessa proposta.

A proposta de supervisor não cadastrado exige nome, CPF, telefone, e-mail, cargo/função e uma qualificação completa: formação na área ou experiência profissional. Para supervisor existente, o Discente informa somente o cargo/função. O perfil pode conter várias qualificações em `supervisor_qualifications`; no aceite, o Setor seleciona a que vale para aquele estágio, com seleção automática quando houver apenas uma. A escolha fica congelada em `supervisor_snapshot`.

## Recibo do envio

O e-mail de confirmação mantém uma cópia dos dados do envio, organizada em tabelas. A seção “Curso e estágio” contém somente curso, nome do tipo, orientador e co-orientador quando informados. Não inclui pesos, valores dos conceitos, carga obrigatória, limites de jornada, margem de segurança ou e-mail do orientador. Esses parâmetros continuam nas regras e snapshots do sistema; a apresentação do recibo não altera cálculos nem entregas históricas já reservadas. Veja o [contrato de e-mails](doc:e-mails-notificacoes-e-entregas#recibo-da-solicitacao-de-estagio).

## Análise, correção e formalização

- O Setor clica em “Iniciar análise” no topo da solicitação enviada. Somente em `under_review` pode associar ou recusar pedidos de concedente/supervisor, aprovar ou devolver o comprovante de emancipação e aceitar, recusar ou devolver a solicitação com mensagem por seção. As Actions revalidam o estado após bloquear o registro na transação; uma chamada direta não contorna a etapa.
- Uma solicitação aceita ainda não liberada pode voltar a `under_review` por “Retomar análise” antes de uma nova decisão, inclusive a devolução por vencimento da data do documento. Solicitações com pendência aguardam o reenvio do discente; o reenvio volta para `submitted` e exige iniciar a análise novamente. Estados finais e estágios liberados permanecem somente para consulta nesse fluxo.
- Recusa e desistência preservam o histórico. Desistir exige senha atual e só é permitido antes de existir estágio formalizado.
- Salvar uma correção mantém a pendência aberta; somente o reenvio explícito e completo a devolve à fila de análise. O Setor aprova novamente antes de aplicar dados corrigidos ao estágio.
- No primeiro aceite, o sistema cria o estágio na mesma transação, associa-o à solicitação e copia os dados aprovados, as qualificações selecionadas e os endereços históricos. Um novo aceite após correção atualiza apenas os grupos aprovados do estágio ainda não liberado.
- Devolução antes da liberação cancela documentos de formalização gerados ou aguardando assinatura, com o motivo da correção; atestados e documentos assinados permanecem no histórico. Após novo aceite, o Setor pode emitir novamente com os dados atuais; baixar uma emissão anterior preserva seus dados originais. Assinatura e liberação são feitas por botões no detalhe do estágio, após as conferências.
- Avisos individuais de decisão e correção usam notificação interna e e-mail em fila após commit. O Setor recebe um resumo interno diário das solicitações que aguardam análise.

## Evidência de emancipação

Cada envio de comprovante gera registro próprio e mídia privada; novos arquivos não substituem os anteriores. Apenas o Discente proprietário e o Setor autorizado acessam o arquivo. Aprovação registra a validação institucional; devolução exige motivo e reabre a seção de capacidade civil. O aceite emancipado exige aprovação da evidência mais recente.

## Pendências

- [x] Recalcular a previsão após alterações relevantes, pausas e exceções do estágio.
- [x] Integrar novas vigências de jornada após aditivos assinados e congelar as entradas para reproduzir cada cálculo, conforme D-019.
- [x] Integrar geração, disponibilização, assinatura e reemissão de documentos.
- [ ] Concluir validação automatizada na preparação para produção, conforme [Testes automatizados](doc:testes-existentes).

## Verificação registrada

Nesta entrega foram verificados Pint, compilação da cache de views, inspeção das rotas de estágio e `git diff --check`. Não foram criados nem executados testes Pest; a suíte automatizada foi removida por decisão explícita do responsável. Não foi executada migration em banco persistente.

## Próxima fase

[Fase 08 — Estágio em andamento](doc:fase-08-estagio-em-andamento)


O formulário mantém a proteção de alterações não salvas sem o cartão de gravação. A informação de última gravação permanece no rodapé, junto às orientações para salvar antes de sair. Salvar o rascunho ou avançar com gravação concluída atualiza a referência da proteção; buscar concedentes/supervisores ou sincronizar campos com Livewire não significa que os dados foram gravados. Sair da página, fechar/recarregar a aba ou trocar vínculo com alterações pendentes aciona a proteção de saída. Não há salvamento automático. Ao reabrir um rascunho, a tela inicia na primeira etapa incompleta dos dados salvos; se as etapas estiverem preenchidas, abre a revisão.


## Retomada e indicadores de preenchimento

A retomada é calculada a cada abertura, usando as mesmas validações das etapas e os dados disponíveis no servidor; não há coluna de última etapa, preferência de navegador ou cópia de dados pessoais em armazenamento local. A conferência para indicadores não altera os valores nem grava o rascunho e não apresenta erros antes da tentativa de avançar. Cadastros existentes precisam continuar ativos e elegíveis no campus, e a etapa de capacidade civil considera o comprovante exigido e sua situação.

Em rascunho, a primeira etapa editável incompleta recebe o foco inicial; se todas estiverem preenchidas, a revisão é aberta. Em devolução, somente seções liberadas entram na conferência e na contagem; início previsto pertence à etapa de jornada. A primeira correção incompleta tem prioridade e, se todas já têm campos válidos, a primeira seção indicada para correção continua sendo aberta para conferência. As marcações “Corrigir” permanecem até o reenvio, sem presumir que a orientação foi atendida somente porque os campos são válidos. Seções não liberadas continuam em consulta.

`form-step-navigation` reutiliza `x-select` no celular e mostra estados por etapa no desktop: Preenchida, Incompleta, Corrigir, Consulta e Revisar/Aguardando preenchimento. `form-step-progress` conta as etapas obrigatórias editáveis que passaram na validação, sem incluir a revisão. A posição atual permanece identificada separadamente. Os indicadores são atualizados nas interações com o servidor, inclusive ao salvar ou avançar; não significam gravação, envio ou aprovação. A proteção de alterações não salvas permanece independente. Solicitações somente para consulta continuam abrindo na revisão, sem revalidar dados históricos como um rascunho atual.


## Conferência prévia do aceite pelo Setor

Solicitações em análise apresentam uma lista de requisitos conhecidos antes do aceite: vínculo discente, tipo ativo do curso, concedente e supervisor associados a cadastros ativos do campus, orientador escolhido, qualificação do supervisor quando necessária e comprovante mais recente de emancipação aprovado e anexado quando exigido. A qualificação histórica é preservada quando o aceite de uma correção não altera a seção do supervisor. Cada pendência leva à seção pertinente para associação, escolha, análise do comprovante ou revisão dos dados. A escolha de orientador e qualificação atualiza a conferência sem gravar a decisão.

“Aceitar e formalizar” fica indisponível enquanto houver pendências conhecidas na lista. A lista é preliminar e não certifica que todas as regras de domínio foram atendidas: a Action transacional, as validações dos Models e as Policies continuam decidindo o aceite e revalidando dados atuais. Devolução e recusa mantêm seus fluxos. Nenhuma conferência grava, envia avisos ou aprova cadastros automaticamente.
