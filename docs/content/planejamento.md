---
id: planejamento
title: Planejamento
description: Índice da área de planejamento do SGE, organizada por desenvolvimento, decisões e integrações.
type: documentation-hub
status: in-progress
visibility: public
tags: sge/planejamento, sge/documentacao
related: backlog-e-decisoes, e-mails-notificacoes-e-entregas, geracao-de-documentos-docx-e-variaveis, fases-de-desenvolvimento, enums, migrations, componentes-tecnicos, convencoes-da-documentacao, matriz-de-autorizacao, perfis-e-responsabilidades-por-vinculo, painel-de-desenvolvimento
source_refs: https://github.com/sge-suite/sge/blob/master/routes/web.php, https://github.com/sge-suite/sge/blob/master/routes/settings.php, https://github.com/sge-suite/sge/blob/master/config/fortify.php
---
Esta área reúne o estado atual das implementações, as decisões de negócio e os contratos transversais do SGE. As páginas de fase distinguem comportamentos implementados de lacunas ainda em aberto.

## Estado geral

| Área | Status | Leitura correta |
| --- | --- | --- |
| Preparação do projeto | **Concluída** | Ambiente, qualidade e fluxo de trabalho inicial validados. |
| Conta e autenticação | **Implementada parcialmente** | Login, recuperação, contexto ativo, configurações próprias de senha/e-mail e dados pessoais de Discente/Supervisor estão disponíveis. Administração de contas e vínculos também está integrada; validação automatizada permanece pendente. |
| Componentes técnicos | **Implementados com pendências de validação** | Models, migrations, helpers, casts, enums, Actions, Policies e Activity Log atendem as jornadas implementadas. Validação de produção segue os checklists. |
| E-mail e documentos | **Implementada parcialmente** | Envio em fila, consulta administrativa e avisos de conta e vínculo, abertura, avaliação, assinatura, execução, cancelamento e conclusão estão integrados. Retenção institucional, validação operacional e escopos adicionais permanecem pendentes; registro de documento externo segue aberto. |
| Domínio de estágios | **Implementado com pendências específicas** | Abertura, correções, formalização, execução, avaliação, notas e conclusão têm interfaces e autorização. Vigências formais de jornada, reprodução histórica do cálculo, documentos externos, rescisão automática e aviso de término previsto permanecem pendentes. |

Os status individuais ficam nas páginas vinculadas e no [painel de desenvolvimento](doc:painel-de-desenvolvimento). Os campos `internship_office_email` no campus e `coordination_email` no curso são contatos institucionais exibidos em detalhes e formulários; não alteram a seleção atual de destinatários das notificações.

## Pastas

| Pasta                                      | Conteúdo                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [Painel de desenvolvimento](doc:painel-de-desenvolvimento)          | `Desenvolvimento/` — painel, fases, enums, migrations e componentes técnicos. |
| [Backlog e decisões](doc:backlog-e-decisoes)               | `Decisões/` — dúvidas, decisões aprovadas e hipóteses superadas.              |
| [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas) | `Integrações/` — contrato de e-mails, notificações e entregas.                |
| [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis) | `Integrações/` — geração, segurança e catálogo de variáveis DOCX.     |

## Acessos rápidos

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Fases](doc:fases-de-desenvolvimento)
- [Enums](doc:enums)
- [Migrations](doc:migrations)
- [Componentes técnicos](doc:componentes-tecnicos)
- [Backlog e decisões](doc:backlog-e-decisoes)
- [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas)
- [Geração DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis)
- [Convenções da documentação](doc:convencoes-da-documentacao)
- [Matriz de autorização](doc:matriz-de-autorizacao)
- [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo)

## Regra de navegação

- Trabalhe no nível mais específico possível: fase, enum, migration ou componente.
- Use o painel como índice de entrada, não como depósito de detalhes.
- Registre decisões na pasta `Decisões/` e contratos transversais na pasta `Integrações/`.
- Atualize o índice apenas quando uma pasta ou área nova for criada.
