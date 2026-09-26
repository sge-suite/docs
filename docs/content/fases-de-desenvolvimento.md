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
Esta lista registra a sequência e o estado atuais. A fundação de dados está concluída. O contexto de vínculo ativo e o comando `admin:create` da Fase 02 estão implementados; a criação de contas pela interface, o convite inicial e partes das configurações próprias ainda estão pendentes. A cobertura Eloquent da Fase 03 e sua validação pela suíte completa estão concluídas.

## Ordem atual

- [x] [00 — Preparação](doc:fase-00-preparacao)
- [x] [01 — Fundação de dados](doc:fase-01-fundacao-de-dados) — migrations, Models, factories e cobertura de banco concluídos.
- **02 — Conta e contexto (em andamento):** contexto ativo, seleção e bootstrap do primeiro Administrador do Sistema implementados; cadastro pela interface, convite e configurações pessoais seguem pendentes.
- [x] **03 — Activity Log (concluída):** cobertura Eloquent das entidades de negócio, autoria por vínculo ativo e proteção de dados sensíveis implementadas e validadas pela suíte completa via Sail.
- **Próxima fase a iniciar: [04 — Integração de e-mail](doc:fase-04-integracao-de-email)** — implementar preparação, transporte, tentativas e reprocessamento.

- [ ] [05 — Administração](doc:fase-05-administracao) — implementar backend e interface seguindo a hierarquia de perfis, do Administrador do Sistema para baixo.
- [ ] [06 — Documentos](doc:fase-06-documentos) — fechar validação, geração e assinatura com serviços de backend reutilizáveis.
- [ ] [07 — Abertura do estágio](doc:fase-07-abertura-do-estagio) — completar Actions e regras transacionais antes e junto do formulário.
- [ ] [08 — Estágio em andamento](doc:fase-08-estagio-em-andamento) — concluir cálculos, transições, notificações e schedules antes das telas correspondentes.
- [ ] [09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao) — finalizar autorização, cálculo e transições de avaliação e conclusão.

## Trabalho de backend antes das telas de domínio

1. **Implementado:** resolver e validar o vínculo ativo, selecionar ou restaurar o contexto, disponibilizá-lo a Policies/Actions e registrar a autoria nas alterações Eloquent.
2. **Concluído:** cobertura dos Models de negócio no Activity Log com autoria pelo vínculo, valores anteriores/novos, exclusão de segredos e validação pela suíte completa.
3. **Próximo bloco:** integrar e-mail com preparação por finalidade, transporte, tentativas, envio após commit, reprocessamento e idempotência.
4. Implementar Services puros e Actions transacionais para cálculos, formalização, correções, cancelamentos e associações dos cadastros pendentes.
5. Preparar validação e geração DOCX, notificações e Jobs idempotentes, com testes de concorrência, falhas e efeitos após commit.

A seleção de vínculo já é a primeira interface compartilhada e estabelece o contexto para as próximas telas. Cada conjunto funcional seguirá com seu backend, começando pelos perfis administrativos mais amplos e avançando aos papéis de campus, estágio, curso e participantes.

## Navegação

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Componentes técnicos](doc:componentes-tecnicos)
- [Enums](doc:enums)
- [Migrations](doc:migrations)
