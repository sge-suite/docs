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
Esta lista mostra a ordem atual de execução; a numeração acompanha essa sequência. As migrations e Models de domínio estão implementados; agora o trabalho avança pelas bases de backend que serão reutilizadas pelos fluxos e telas.

## Ordem atual

- [x] [00 — Preparação](doc:fase-00-preparacao)
- [x] [01 — Fundação de dados](doc:fase-01-fundacao-de-dados) — migrations, Models, factories e cobertura de banco concluídos.
- [ ] **Próxima: [02 — Conta e contexto](doc:fase-02-conta-e-contexto)** — resolver e selecionar o vínculo ativo para estabelecer o contexto e a autoria das ações.
- [ ] [03 — Activity Log](doc:fase-03-activity-log) — aplicar auditoria consistente a todas as entidades de negócio usando o vínculo ativo.
- [ ] [04 — Integração de e-mail](doc:fase-04-integracao-de-email) — simplificar preparação, transporte, tentativas e reprocessamento depois da auditoria.
- [ ] [05 — Administração](doc:fase-05-administracao) — implementar backend e interface seguindo a hierarquia de perfis, do Administrador do Sistema para baixo.
- [ ] [06 — Documentos](doc:fase-06-documentos) — fechar validação, geração e assinatura com serviços de backend reutilizáveis.
- [ ] [07 — Abertura do estágio](doc:fase-07-abertura-do-estagio) — completar Actions e regras transacionais antes e junto do formulário.
- [ ] [08 — Estágio em andamento](doc:fase-08-estagio-em-andamento) — concluir cálculos, transições, notificações e schedules antes das telas correspondentes.
- [ ] [09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao) — finalizar autorização, cálculo e transições de avaliação e conclusão.

## Trabalho de backend antes das telas de domínio

1. Criar resolução do vínculo ativo, contexto de autorização e seleção de vínculo com testes.
2. Cobrir as entidades de negócio no Activity Log com autoria pelo vínculo ativo, alterações úteis e proteção de dados sensíveis.
3. Fechar a integração de e-mail: preparação por finalidade, transporte, registro de tentativas, envio após commit, reprocessamento e idempotência.
4. Implementar Services puros e Actions transacionais para cálculos, formalização, correções, cancelamentos e associações dos cadastros pendentes.
5. Preparar validação e geração DOCX, notificações e Jobs idempotentes, com testes de concorrência, falhas e efeitos após commit.

As tarefas de backend sem dependência visual podem avançar antes das telas. A seleção de vínculo é a primeira interface compartilhada; depois, cada conjunto de telas acompanha seu backend e percorre os perfis do nível administrativo mais amplo aos papéis de campus, estágio e curso, e então aos participantes do estágio.

## Navegação

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Componentes técnicos](doc:componentes-tecnicos)
- [Enums](doc:enums)
- [Migrations](doc:migrations)
