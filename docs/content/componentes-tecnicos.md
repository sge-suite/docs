---
id: componentes-tecnicos
title: Componentes técnicos
description: Índice dos componentes de aplicação já existentes e dos seus checklists de manutenção.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/arquitetura, sge/checklist
related: casts, helpers, concerns, actions, services, model-user, providers, schedules, testes-existentes, configuracao-e-bootstrap, migrations, enums, arquitetura-atual, component-file-upload
source_refs:
---
Esta nota é o inventário do código transversal do projeto novo. Cada componente tem uma nota própria com responsabilidade, contrato, uso atual, testes e pendências.

## Inventário

| Área                   | Estado    | Detalhamento                       |
| ---------------------- | --------- | ---------------------------------- |
| Casts                  | 🟡 Em uso | [Casts](doc:casts)                    |
| Helpers                | 🟡 Em uso | [Helpers](doc:helpers)                  |
| Concerns               | 🟡 Em uso | [Concerns](doc:concerns)                 |
| Actions                | 🟡 Em uso | [Actions](doc:actions)                  |
| Services               | 🟡 Planejado | [Services](doc:services)              |
| Models                 | 🟡 Em uso | [Model — User](doc:model-user)             |
| Providers              | 🟡 Em uso | [Providers](doc:providers)                |
| Schedules              | 🟡 Planejado | [Schedules](doc:schedules)              |
| Seeders                | 🟢 Implementado | [Migration 01A — cities](doc:migration-01a-cities) |
| Testes                 | ⚪ Suspensos até a preparação para produção | [Testes automatizados](doc:testes-existentes) |
| Bootstrap/configuração | 🟡 Em uso | [Configuração e bootstrap](doc:configuracao-e-bootstrap) |

## Componentes Blade

- [Upload de arquivos](doc:component-file-upload) — campo reutilizável de arquivos com seleção, arrastar e soltar, estado de envio e remoção de uploads temporários.
- `resources/views/components/keyboard-shortcuts-modal.blade.php` — modal de referência de atalhos (`?`) em duas colunas com detecção automática de sistema operacional (`macOS` vs `Windows / Linux`) e painel expansível filtrável (`.scroll-fade-y`) com as páginas, ações rápidas e palavras-chave da busca rápida para `AffiliationType::InternshipOffice`.
- `resources/views/components/sector/⚡command-palette.blade.php` + `app/Support/SectorCommandPaletteSearch.php` + `app/Support/SectorCommandPaletteItems.php` — paleta de comandos e busca rápida em desktop (`Ctrl+K` / `⌘K`, oculta abaixo de `1024px`) exclusiva para `AffiliationType::InternshipOffice`, com `↑`/`↓` entre itens, `Tab`/`Shift+Tab` entre grupos, prefixo `>` para páginas/ações e lista de resultados com `.scroll-fade-y`.

## Navegação por teclado

- **CSS e foco visual (`resources/css/app.css`):** anel `:focus-visible` global com `--color-brand` para links/botões nativos, destaque completo da linha em tabelas (`tr:has(a:focus-visible)`) e máscara `.scroll-fade-y` para transição suave em contêineres roláveis.
- **Navegação entre telas (`resources/js/fragment-navigation.js`):** após `wire:navigate`, move o foco para o alvo do `#hash` ou para `#main-content` (`resources/views/layouts/app.blade.php`).
- **Atalhos globais e modais (`resources/js/keyboard-navigation.js`):** `/` foca a busca da página, `↑`/`↓` navega entre linhas de tabelas, `Ctrl+Enter`/`⌘+↵` envia o formulário atual (preservando o `Enter` padrão), `?` abre a lista de atalhos e modais `<dialog>` recebem foco inteligente ao abrir (primeiro campo editável ou botão seguro de cancelar/fechar) e restauram o foco ao fechar.
- **Componentes interativos:** `<x-select>` suporta `Home`, `End` e `Space` além das setas/busca; os gráficos de indicadores (`indicator-chart.blade.php`) usam `<button>` reais para todos os agrupamentos clicáveis.

## Regra de manutenção

- [ ] Toda classe nova deve ter uma nota se representar decisão transversal ou contrato reutilizado.
- [ ] Toda alteração em cast/helper/concern deve atualizar sua nota; testes automatizados serão retomados na preparação para produção.
- [ ] Toda função pública deve registrar entrada, saída, fallback e exceções.
- [ ] Não duplicar regra de normalização ou formatação em Livewire, Blade, Model e helper.
- [ ] Preferir serviços/Actions para efeitos colaterais; manter helpers puros quando possível.
- [ ] Rodar a suíte do projeto depois de alterar um componente compartilhado.

## Navegação

- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
- [Migrations](doc:migrations)
- [Enums](doc:enums)
- [Services](doc:services)
- [Arquitetura atual](doc:arquitetura-atual)
