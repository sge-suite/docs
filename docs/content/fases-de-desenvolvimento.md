---
id: fases-de-desenvolvimento
title: Fases de desenvolvimento
description: Ordem atual das entregas, do backend compartilhado às interfaces por perfil.
type: development-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/checklist
related: fase-00-preparacao, fase-04-integracao-de-email, fase-01-fundacao-de-dados, fase-02-conta-e-contexto, fase-05-administracao, fase-06-documentos, fase-07-abertura-do-estagio, fase-08-estagio-em-andamento, fase-09-avaliacao-e-conclusao, fase-03-activity-log, componentes-tecnicos, enums, migrations
source_refs:
---
Esta lista registra a sequência e o estado atuais. A fundação de dados está concluída. Contexto de vínculo, criação administrativa por terminal e interface, configurações de senha/e-mail e dados pessoais, auditoria Eloquent, gestão de campi, usuários e vínculos, e as telas locais do Setor estão implementados. A abertura do estágio inclui rascunho, envio, análise, correção e criação do estágio no aceite; documentação, execução, avaliação e conclusão seguem em andamento.

## Ordem atual

- [x] [00 — Preparação](doc:fase-00-preparacao)
- [ ] [01 — Fundação de dados](doc:fase-01-fundacao-de-dados) — migrations, Models e factories concluídos; testes automatizados serão retomados antes da produção.
- **02 — Conta e contexto (em andamento):** contexto ativo, seleção/troca, `admin:create`, gestão de contas/vínculos administrativos, alteração própria de senha/e-mail e avisos correspondentes implementados; edição própria de dados pessoais de Discente e Supervisor, com telefone compartilhado e endereço com busca por CEP, implementada. As verificações pendentes da fase continuam em seu checklist.
- **[03 — Activity Log](doc:fase-03-activity-log) (concluída):** auditoria Eloquent, autoria por vínculo, registro dos campos pessoais e profissionais de `UserPersonalData` e consulta administrativa com escopo limitado implementados.
- **[04 — Integração de e-mail](doc:fase-04-integracao-de-email) (em andamento):** backend de reserva, envio em fila, conteúdo renderizado das mensagens administrativas e consulta de e-mails compartilhada por Administrador do Sistema e Setor de Estágio, com escopos distintos, implementados; integração das notificações operacionais de domínio, outros escopos e retenção continuam pendentes.

- [ ] [05 — Administração](doc:fase-05-administracao) — gestão global de campi, contas/vínculos administrativos e painel do Administrador do Sistema concluídos; Meu campus, cursos, usuários/vínculos locais e consultas locais de Logs implementados para o Setor de Estágio; tipos de estágio e demais operações administrativas pendentes.
- [ ] [06 — Documentos](doc:fase-06-documentos) — templates e geração/reprodução DOCX/PDF implementados; assinatura e avisos individualizados implementados; concluir documentos externos.
- [ ] [07 — Abertura do estágio](doc:fase-07-abertura-do-estagio) — envio, análise, correções, cadastros pendentes e aceite estão implementados; falta concluir a integração documental e os requisitos de histórico do cálculo.
- [ ] [08 — Estágio em andamento](doc:fase-08-estagio-em-andamento) — concluir cálculos, transições, notificações e schedules antes das telas correspondentes.
- [ ] [09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao) — autorização, cálculo, avaliação e conclusão implementados; validação funcional permanece pendente.

## Próximas entregas de backend e integração

1. **Implementado:** resolver e validar o vínculo ativo, selecionar ou restaurar o contexto, disponibilizá-lo a Policies/Actions e registrar a autoria nas alterações Eloquent.
2. **Concluído:** Models de negócio registram autoria pelo vínculo, valores anteriores/novos e exclusão de segredos no Activity Log. A suíte automatizada foi removida e será retomada na preparação para produção.
3. **Em andamento:** o backend de e-mail com filas, idempotência e reprocessamento atende criação de conta, vínculos administrativos, alterações administrativas e troca de e-mail. A consulta de envios é compartilhada por Administrador do Sistema e Setor de Estágio, limitada ao escopo de cada vínculo ativo selecionado. Os avisos de decisão/correção da abertura estão integrados; notificações de outros eventos, escopos para outros vínculos e política de retenção continuam pendentes.
4. Completar assinatura, avisos documentais, liberação, recálculos posteriores e reprodução histórica da previsão; geração/reprodução DOCX/PDF, abertura, correções e associações estão implementadas.
5. Integrar as notificações documentais e concluir os Jobs idempotentes pendentes. Seus testes de concorrência, falhas e efeitos após commit ficam para a preparação para produção.

A seleção de vínculo estabelece o contexto para cada tela. A próxima sequência prioriza documento, execução do estágio, avaliação e conclusão, completando os fluxos a partir do estágio criado no aceite.

## Navegação

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Componentes técnicos](doc:componentes-tecnicos)
- [Enums](doc:enums)
- [Migrations](doc:migrations)
