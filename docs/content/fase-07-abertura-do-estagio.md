---
id: fase-07-abertura-do-estagio
title: Fase 07 — Abertura do estágio
description: Solicitação do discente, cadastros relacionados, análise e formalização inicial do estágio.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/estagio, sge/checklist
related: fluxos-principais, fase-08-estagio-em-andamento, migration-11-internship-types, migration-19-internship-requests, cadastros-pendentes-de-supervisor-e-concedente
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/ManageStudentInternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ReviewInternshipRegistration.php, https://github.com/sge-suite/sge/blob/master/app/Support/InternshipRequestSnapshots.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ProjectInternshipRequestEndDate.php
---
Base: [fluxo de abertura](doc:fluxos-principais#2-solicitacao) e [contrato da solicitação](doc:migration-19-internship-requests).

A abertura usa uma solicitação única por vínculo discente. O Discente pode salvar o rascunho incompleto e retomá-lo; enviar para análise é uma ação separada e exige todos os campos obrigatórios do caminho escolhido, consentimento e validações de domínio. Devoluções alteram a mesma solicitação e liberam somente as seções indicadas pelo Setor.

## Formulário e dados

- A seleção de tipo de estágio é limitada ao curso ativo do vínculo. O tipo informa os anos/semestres permitidos; o Discente escolhe um deles, e o servidor confere a opção contra o JSONB do tipo.
- O Discente seleciona um orientador ativo do campus. O e-mail exibido junto ao nome é o do vínculo e ajuda a distinguir pessoas com nomes iguais. O Setor pode confirmar ou substituir o orientador no aceite.
- O co-orientador é um input de texto opcional, limitado a 255 caracteres, sem vínculo nem permissões. Integra a seção de estágio, a revisão e o comprovante; é copiado no aceite e nas correções aprovadas dessa seção. No estágio, o Setor pode editar o nome, exibido nas consultas e na auditoria. Em 20/10/2026, as colunas `co_advisor_name` foram aplicadas ao banco existente por migration temporária, depois removida; as migrations originais foram atualizadas, sem recriar tabelas.
- Ao salvar os dados pessoais no formulário, as alterações são gravadas em `user_personal_data` e também ficam no rascunho da solicitação. A tela Configurações → Dados pessoais mostra os mesmos dados atuais. O envio valida nome, CPF, e-mail, matrícula, RG, órgão e data de emissão, nascimento, telefone e endereço; então cria os snapshots do envio. Nome/CPF vêm da conta, enquanto e-mail e matrícula vêm do vínculo discente.
- A data de nascimento determina automaticamente a maioridade. Para menor de idade, o Discente escolhe entre menor e menor emancipado. Menor exige nome, CPF, parentesco e e-mail do responsável; menor emancipado envia prova privada para análise do Setor.
- Setor/área e atividades são obrigatórios. Jornada, pausas planejadas, remuneração e data inicial seguem as regras do tipo; a data proposta precisa respeitar sete dias corridos após o envio. A previsão de término usa a carga, jornada, margem configurada e calendário local disponível. A base historicamente reproduzível e recálculos após alterações futuras continuam pendentes.

## Concedente e supervisor

A abertura aceita uma concedente ou um supervisor já cadastrados, ou uma proposta de cadastro completa. CPF/CNPJ repetido em outro campus não autoriza reutilização. As propostas pendentes seguem em registros tipados e podem ser analisadas depois do envio da abertura; o Setor precisa associar os cadastros aprovados antes do aceite do estágio.

A proposta de concedente muda conforme o documento: CPF exige nome, documento, endereço completo, telefone e e-mail; CNPJ exige razão social, documento, representante, cargo, telefone, e-mail e cidade. UF/cidade são escolhidas pelo catálogo. Conselho, credenciamento e área de atuação não são exigidos nessa proposta.

A proposta de supervisor não cadastrado exige nome, CPF, telefone, e-mail, cargo/função e uma qualificação completa: formação na área ou experiência profissional. Para supervisor existente, o Discente informa somente o cargo/função. O perfil pode conter várias qualificações em `supervisor_qualifications`; no aceite, o Setor seleciona a que vale para aquele estágio, com seleção automática quando houver apenas uma. A escolha fica congelada em `supervisor_snapshot`.

## Análise, correção e formalização

- O Setor analisa a solicitação no escopo do campus, associa concedente e supervisor aprovados, confere a última evidência de emancipação e pode aceitar, recusar ou devolver com mensagem por seção.
- Recusa e desistência preservam o histórico. Desistir exige senha atual e só é permitido antes de existir estágio formalizado.
- Salvar uma correção mantém a pendência aberta; somente o reenvio explícito e completo a devolve à fila de análise. O Setor aprova novamente antes de aplicar dados corrigidos ao estágio.
- No primeiro aceite, o sistema cria o estágio na mesma transação, associa-o à solicitação e copia os dados aprovados, as qualificações selecionadas e os endereços históricos. Um novo aceite após correção atualiza apenas os grupos aprovados do estágio ainda não liberado.
- Devolução antes da liberação cancela documentos de formalização gerados ou aguardando assinatura, com o motivo da correção; atestados e documentos assinados permanecem no histórico. Após novo aceite, o Setor pode emitir novamente com os dados atuais; baixar uma emissão anterior preserva seus dados originais. Assinatura e liberação são feitas por botões no detalhe do estágio, após as conferências.
- Avisos individuais de decisão e correção usam notificação interna e e-mail em fila após commit. O Setor recebe um resumo interno diário das solicitações que aguardam análise.

## Evidência de emancipação

Cada envio de comprovante gera registro próprio e mídia privada; novos arquivos não substituem os anteriores. Apenas o Discente proprietário e o Setor autorizado acessam o arquivo. Aprovação registra a validação institucional; devolução exige motivo e reabre a seção de capacidade civil. O aceite emancipado exige aprovação da evidência mais recente.

## Pendências

- [ ] Recalcular e documentar datas quando pausas ou aditivos futuros forem formalizados, com entradas historicamente reproduzíveis conforme D-019.
- [ ] Integrar geração, disponibilização, assinatura e reemissão de documentos.
- [ ] Concluir validação automatizada na preparação para produção, conforme [Testes automatizados](doc:testes-existentes).

## Verificação registrada

Nesta entrega foram verificados Pint, compilação da cache de views, inspeção das rotas de estágio e `git diff --check`. Não foram criados nem executados testes Pest; a suíte automatizada foi removida por decisão explícita do responsável. Não foi executada migration em banco persistente.

## Próxima fase

[Fase 08 — Estágio em andamento](doc:fase-08-estagio-em-andamento)
