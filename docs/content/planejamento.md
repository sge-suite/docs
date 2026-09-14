---
id: planejamento
title: Planejamento
description: Índice da área de planejamento do SGE, organizada por desenvolvimento, decisões e integrações.
type: documentation-hub
status: in-progress
visibility: public
tags: sge/planejamento, sge/documentacao
related: backlog-e-decisoes, e-mails-notificacoes-e-entregas, geracao-de-documentos-docx-e-variaveis, fases-de-desenvolvimento, enums, migrations, componentes-tecnicos, convencoes-da-documentacao, matriz-de-autorizacao, perfis-e-responsabilidades-por-vinculo, painel-de-desenvolvimento
source_refs: ../../sge/routes/web.php, ../../sge/routes/settings.php, ../../sge/config/fortify.php
---
Esta área reúne a execução técnica, as decisões de negócio e os contratos transversais do novo SGE. Ela descreve o estado do planejamento e do código de apoio; não significa que todas as funcionalidades descritas já estejam disponíveis no sistema.

## Estado geral

| Área | Status | Leitura correta |
| --- | --- | --- |
| Preparação do projeto | **Concluída** | Ambiente, qualidade e fluxo de trabalho inicial validados. |
| Conta e autenticação | **Implementada parcialmente** | Login, recuperação de senha, perfil e dashboard existem; vínculos institucionais ainda estão planejados. |
| Componentes técnicos básicos | **Implementados parcialmente** | Helpers, casts, providers, regras de validação, enums e infraestrutura base já possuem código; integrações de domínio continuam pendentes. |
| Contratos de e-mail e documentos | **Definidos** | As regras estão documentadas, mas as migrations, modelos e fluxos de domínio ainda não foram implementados. |
| Domínio de estágios | **Planejado** | Solicitações, formalização, execução, avaliações e conclusão ainda dependem das fases correspondentes. |

Os status individuais ficam nas páginas vinculadas e no [painel de desenvolvimento](doc:painel-de-desenvolvimento). Em páginas de código, **Implementado** significa que o artefato existe; a própria página deve informar se ainda faltam integração, autorização, migration ou testes.

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
