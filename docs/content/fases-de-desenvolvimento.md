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
Esta lista registra a sequência e o estado atuais. A fundação de dados está concluída. Contexto de vínculo, criação administrativa pelo terminal, configurações de senha/e-mail, auditoria Eloquent e gestão global de campi estão implementados; administração de usuários pela interface e outras edições pessoais seguem pendentes.

## Ordem atual

- [x] [00 — Preparação](doc:fase-00-preparacao)
- [x] [01 — Fundação de dados](doc:fase-01-fundacao-de-dados) — migrations, Models, factories e cobertura de banco concluídos.
- **02 — Conta e contexto (em andamento):** contexto ativo, seleção/troca, `admin:create`, alteração própria de senha/e-mail e avisos correspondentes implementados; cadastro pela interface e edição de outros dados pessoais pendentes.
- **[03 — Activity Log](doc:fase-03-activity-log) (concluída):** auditoria Eloquent, autoria por vínculo e registro dos campos pessoais e profissionais de `UserPersonalData` implementados.
- **[04 — Integração de e-mail](doc:fase-04-integracao-de-email) (em andamento):** backend de reserva, envio em fila, transporte e reprocessamento implementado; integração nos fluxos de domínio e telas administrativas pendente.

- [ ] [05 — Administração](doc:fase-05-administracao) — backend de campi e interface Livewire do Administrador do Sistema concluídos; implementar a interface local e as demais operações administrativas seguindo a hierarquia de perfis.
- [ ] [06 — Documentos](doc:fase-06-documentos) — fechar validação, geração e assinatura com serviços de backend reutilizáveis.
- [ ] [07 — Abertura do estágio](doc:fase-07-abertura-do-estagio) — completar Actions e regras transacionais antes e junto do formulário.
- [ ] [08 — Estágio em andamento](doc:fase-08-estagio-em-andamento) — concluir cálculos, transições, notificações e schedules antes das telas correspondentes.
- [ ] [09 — Avaliação e conclusão](doc:fase-09-avaliacao-e-conclusao) — finalizar autorização, cálculo e transições de avaliação e conclusão.

## Trabalho de backend antes das telas de domínio

1. **Implementado:** resolver e validar o vínculo ativo, selecionar ou restaurar o contexto, disponibilizá-lo a Policies/Actions e registrar a autoria nas alterações Eloquent.
2. **Concluído:** cobertura dos Models de negócio no Activity Log com autoria pelo vínculo, valores anteriores/novos, exclusão de segredos e validação pela suíte completa.
3. **Em andamento:** o backend de e-mail com filas, idempotência e reprocessamento já atende à criação de conta, novo vínculo e troca de e-mail. Faltam notificações de domínio, outros fluxos e a interface administrativa de consulta/reenvio.
4. Implementar Services puros e Actions transacionais para cálculos, formalização, correções, cancelamentos e associações dos cadastros pendentes.
5. Preparar validação e geração DOCX, notificações e Jobs idempotentes, com testes de concorrência, falhas e efeitos após commit.

A seleção de vínculo já é a primeira interface compartilhada e estabelece o contexto para as próximas telas. Cada conjunto funcional seguirá com seu backend, começando pelos perfis administrativos mais amplos e avançando aos papéis de campus, estágio, curso e participantes.

## Navegação

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Componentes técnicos](doc:componentes-tecnicos)
- [Enums](doc:enums)
- [Migrations](doc:migrations)
