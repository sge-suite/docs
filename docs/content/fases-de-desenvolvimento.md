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
Esta lista registra a sequência e o estado atuais. A aplicação já implementa administração global e local, solicitação e análise da abertura, documentos e assinaturas, execução e cancelamento do estágio, avaliação do supervisor, notas do orientador e conclusão. As fases continuam em andamento quando ainda há validação, integrações ou funcionalidades específicas pendentes; cada estado usa o mesmo marcador de checklist e um rótulo explícito.

## Ordem atual

- [x] [00 — Preparação](doc:fase-00-preparacao) — **Concluída:** preparação do ambiente e fluxo de trabalho.
- [ ] [01 — Fundação de dados](doc:fase-01-fundacao-de-dados) — **Em andamento:** schema, Models, relações e factories implementados; validação de produção permanece no checklist.
- [ ] [02 — Conta e contexto](doc:fase-02-conta-e-contexto) — **Em andamento:** contexto de vínculo, criação e gestão administrativa de contas, segurança e dados pessoais implementados; validações restantes estão no checklist.
- [x] [03 — Activity Log](doc:fase-03-activity-log) — **Concluída:** autoria por vínculo, registro de mudanças e consultas administrativas com escopo limitado implementados.
- [ ] [04 — Integração de e-mail](doc:fase-04-integracao-de-email) — **Em andamento:** pipeline em fila, avisos de abertura, avaliação, documentos, execução, cancelamento e conclusão implementados; validação operacional, outros escopos de consulta e retenção institucional seguem pendentes.

- [ ] [05 — Administração](doc:fase-05-administracao) — **Em andamento:** administração global e gestão local de campi, cursos, tipos, usuários, vínculos e cadastros implementadas; validação automatizada permanece pendente.
- [ ] [06 — Documentos](doc:fase-06-documentos) — **Em andamento:** templates, emissão, reprodução DOCX/PDF, assinatura e avisos individualizados implementados; registro operacional de documentos externos implementado; validação operacional pendente.
- [ ] [07 — Abertura do estágio](doc:fase-07-abertura-do-estagio) — **Em andamento:** rascunho, envio, análise, correção, cadastros pendentes, aceite e integração documental implementados; base reproduzível dos novos cálculos implementada; validação operacional pendente.
- [ ] [08 — Estágio em andamento](doc:fase-08-estagio-em-andamento) — **Em andamento:** pausas, calendário, liberação, sincronização, avisos, cancelamento e previsão atualizada implementados; vigências formais de jornada e base reproduzível dos novos cálculos implementadas; avisos/resumos pendentes.
- [ ] [09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao) — **Em andamento:** avaliação, notas e conclusão implementadas; validação funcional e operacional permanece pendente.

## Próximas entregas de backend e integração

1. **Implementado:** resolver e validar o vínculo ativo, selecionar ou restaurar o contexto, disponibilizá-lo a Policies/Actions e registrar a autoria nas alterações Eloquent.
2. **Concluído:** Models de negócio registram autoria pelo vínculo, valores anteriores/novos e exclusão de segredos no Activity Log. A suíte automatizada foi removida e será retomada na preparação para produção.
3. **Em andamento:** o pipeline com filas, idempotência e histórico atende fluxos administrativos e avisos de abertura, avaliação, assinatura, execução e cancelamento. A consulta operacional do Setor cobre o campus do estágio; retenção institucional e validações operacionais permanecem pendentes.
4. **Em andamento:** assinatura, liberação, execução, recálculo da previsão ao salvar alterações relevantes, avaliação e conclusão estão implementados. Novos cálculos salvos congelam as entradas para reprodução histórica, e aditivos assinados aplicam novas vigências de jornada. Validação operacional permanece pendente.
5. **Em andamento:** geração e reprodução DOCX/PDF e avisos de domínio estão integrados. O registro de documentos externos está implementado. Permanecem os avisos de término e resumos operacionais adicionais, além da validação de produção.

A seleção de vínculo estabelece o contexto para cada tela. As próximas entregas fecham as pendências listadas nas fases, sem reclassificar como futuras jornadas que já estão implementadas.

## Navegação

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Componentes técnicos](doc:componentes-tecnicos)
- [Enums](doc:enums)
- [Migrations](doc:migrations)
