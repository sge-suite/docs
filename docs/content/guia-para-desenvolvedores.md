---
id: guia-para-desenvolvedores
title: Guia para desenvolvedores
description: Manual técnico com stack, mapa de pastas, origem dos dados e recomendações de uso de agentes de IA na manutenção do SGE.
type: development-guide
status: maintained
visibility: public
tags: sge/desenvolvimento, sge/arquitetura, sge/manutencao
related: ambiente-de-desenvolvimento, arquitetura-atual, dominio-e-modelo-de-dados, modelagem-de-dados, matriz-de-autorizacao, componentes-tecnicos, helpers
source_refs: https://github.com/sge-suite/sge/blob/master/composer.json, https://github.com/sge-suite/sge/blob/master/package.json, https://github.com/sge-suite/sge/blob/master/compose.yaml, https://github.com/sge-suite/sge/blob/master/AGENTS.md, https://github.com/sge-suite/sge/blob/master/routes/web.php
updated: 2026-11-23
---
## 1. Como rodar o projeto (Docker, Sail e Sistemas Operacionais)

> [!important] Por que sempre usar o Laravel Sail (Docker)?
> O SGE utiliza **5 serviços simultâneos** definidos em `compose.yaml`: **PHP 8.5** (`laravel.test`), **PostgreSQL 18** (`pgsql`), **Meilisearch** (`meilisearch`, obrigatório para as buscas e selects), **Gotenberg + LibreOffice** (`gotenberg`, conversão privada de DOCX para PDF) e **Mailpit** (`mailpit`, caixa de entrada local de e-mails).
>
> Rodar o sistema sem o **Laravel Sail** exigiria instalar e configurar manualmente cada um desses serviços na máquina. Com o Docker + Sail, toda essa pilha sobe pronta com `./vendor/bin/sail up -d`, e **todos os comandos** (`artisan`, `composer`, `npm`, `tinker`, `pint`) devem ser executados prefixados por `./vendor/bin/sail`.

### Qual sistema operacional utilizar?

- **Linux (Recomendado):** é o ambiente ideal para dar suporte ao SGE. O Docker Engine roda nativamente, sem perda de desempenho de disco e com compatibilidade direta das permissões Unix (`0700`/`0600`) usadas na geração privada de documentos.
- **Windows 10/11 (via WSL 2 + Docker Desktop):** caso utilize Windows, **é obrigatório rodar o projeto dentro do WSL 2 (Ubuntu)** com a integração do Docker Desktop ativada:
  1. Instale o WSL 2 no PowerShell (Admin): `wsl --install -d Ubuntu`.
  2. Instale o **Docker Desktop**, ative o motor WSL 2 e habilite a integração com o Ubuntu em *Settings → Resources → WSL Integration*.
  3. **Muito importante:** abra o terminal do Ubuntu e clone o projeto **dentro do sistema de arquivos do Linux** (ex.: `~/code/sge`), **nunca** em `/mnt/c/...` (`C:\...`). Em `/mnt/c/` o Docker fica lento, o Git do Windows pode trocar quebras de linha para `CRLF` (quebrando o script `./vendor/bin/sail`) e as permissões de diretórios privados falham.
  4. Para usar o VS Code no Windows, instale a extensão **WSL** e rode `code .` dentro da pasta do projeto no terminal do Ubuntu.
- **macOS:** basta ter o Docker Desktop (ou OrbStack) instalado e usar o terminal padrão.

> Veja o passo a passo completo de primeira instalação (inclusive como gerar a pasta `vendor/` via Docker sem precisar instalar PHP na máquina) em [Ambiente de desenvolvimento](doc:ambiente-de-desenvolvimento).

---

## 2. Tecnologias utilizadas e documentações oficiais

Antes de alterar código relativo a um pacote, consulte a versão instalada em `composer.json` ou `package.json` e a documentação correspondente:

### Backend e infraestrutura

| Tecnologia | Versão no projeto | Papel no SGE | Documentação oficial |
| --- | --- | --- | --- |
| **PHP** | 8.5 (`^8.3`) | Linguagem base do servidor, tipagem estrita, Enums nativos e atributos. | [php.net/manual/pt_BR](https://www.php.net/manual/pt_BR/) |
| **Laravel** | 13 (`^13.17`) | Framework principal (rotas, Eloquent ORM, filas, políticas de acesso, validações e comandos Artisan). | [laravel.com/docs](https://laravel.com/docs) |
| **Laravel Sail** | `^1.65` | Ambiente Docker local (`compose.yaml` com PHP, PostgreSQL, Meilisearch, Mailpit e Gotenberg). | [laravel.com/docs/sail](https://laravel.com/docs/sail) |
| **Laravel Fortify** | `^1.37` | Backend de autenticação (login, redefinição de senha, confirmação de senha e autenticação em dois fatores). | [laravel.com/docs/fortify](https://laravel.com/docs/fortify) |
| **PostgreSQL** | 18 | Banco de dados relacional principal (com uso de `jsonb`, transações com bloqueio pessimista e agregações analíticas). | [postgresql.org/docs/current](https://www.postgresql.org/docs/current/) |

### Frontend reativo e interface

| Tecnologia | Versão no projeto | Papel no SGE | Documentação oficial |
| --- | --- | --- | --- |
| **Livewire** | 4 (`^4.1`) | Interfaces reativas em PHP sem necessidade de uma SPA separada. As páginas usam o formato Single-File Component com prefixo `⚡`. | [livewire.laravel.com/docs](https://livewire.laravel.com/docs) |
| **Flux UI** | 2 (`^2.13`) | Biblioteca oficial de componentes Blade (`<flux:*>`) para Livewire (modais, tabelas, botões, cartões, formulários). Edição gratuita. | [fluxui.dev/docs](https://fluxui.dev/docs) |
| **Livewire Blaze** | `^1.0` | Otimizador de compilação e renderização de componentes Blade. | [github.com/livewire/blaze](https://github.com/livewire/blaze) |
| **Alpine.js** | Embutido no Livewire | Interatividade local no navegador (como o seletor `<x-select>`, proteção de alterações não salvas e tooltips dos gráficos SVG). | [alpinejs.dev/start-here](https://alpinejs.dev/start-here) |
| **Tailwind CSS** | 4 (`^4.0`) | Estilização utilitária e variáveis de tema claro/escuro (`resources/css/app.css`). | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| **Vite** | 8 (`^8.0`) | Empacotador de assets CSS e JS (`npm run dev` / `npm run build`). | [vite.dev/guide](https://vite.dev/guide/) |

### Pacotes de domínio, busca, documentos e auditoria

| Pacote | Versão | Papel no SGE | Documentação oficial |
| --- | --- | --- | --- |
| **Laravel Scout + Meilisearch** | `^11.5` / `^1.16` | Busca textual rápida nas listagens e carregamento sob demanda nos seletores `<x-select>` com `searchSource`. | [laravel.com/docs/scout](https://laravel.com/docs/scout) · [meilisearch.com/docs](https://www.meilisearch.com/docs) |
| **Spatie Activitylog** | `^5.0` | Trilha de auditoria (`activity_log`) de criações, alterações e eventos operacionais, além de fonte temporal para indicadores. | [spatie.be/docs/laravel-activitylog/v5](https://spatie.be/docs/laravel-activitylog/v5/introduction) |
| **Spatie Medialibrary** | `^11.23` | Armazenamento privado de arquivos vinculados a Models (versões de templates DOCX e comprovantes de emancipação). | [spatie.be/docs/laravel-medialibrary/v11](https://spatie.be/docs/laravel-medialibrary/v11/introduction) |
| **PHPWord + Gotenberg** | `^1.4` / `8.38` | Preenchimento de variáveis em modelos `.docx` e conversão privada para `.pdf` via container LibreOffice/Gotenberg. | [phpword.readthedocs.io](https://phpword.readthedocs.io/) · [gotenberg.dev/docs](https://gotenberg.dev/docs/getting-started/introduction) |
| **pt-br-validator** | `^13.0` | Regras de validação para formatos brasileiros (CPF, CNPJ, CEP, telefone). | [github.com/LaravelLegends/pt-br-validator](https://github.com/LaravelLegends/pt-br-validator) |
| **Spatie Backup** | `^10.3` | Rotinas de backup de banco e arquivos. | [spatie.be/docs/laravel-backup/v10](https://spatie.be/docs/laravel-backup/v10/introduction) |

### Qualidade de código e suporte a IA

| Ferramenta | Comando via Sail | Finalidade | Documentação oficial |
| --- | --- | --- | --- |
| **Laravel Pint** | `./vendor/bin/sail bin pint --dirty` | Padronização automática de estilo de código PHP. | [laravel.com/docs/pint](https://laravel.com/docs/pint) |
| **Larastan (PHPStan)** | `./vendor/bin/sail composer run types:check` | Análise estática de tipos e contratos Eloquent (`phpstan.neon`). | [github.com/larastan/larastan](https://github.com/larastan/larastan) |
| **Laravel Boost** | `./vendor/bin/sail artisan boost:mcp` | Servidor MCP e diretrizes contextualizadas (`AGENTS.md`) para agentes de IA. | [github.com/laravel/boost](https://github.com/laravel/boost) |

---

## 3. Mapa de pastas do projeto

Ao clonar o repositório da aplicação (`sge`), você encontrará a seguinte estrutura de diretórios:

### Dentro de `app/` (lógica de negócio e domínio)

| Pasta / Arquivo | O que representa e quando mexer |
| --- | --- |
| `app/Actions/` | **Casos de uso e mutações de negócio.** Toda operação que cria, edita, aprova, devolve, libera, pausa, cancela ou avalia registros vive aqui (ex.: `ManageInternshipLifecycle`, `ManageInternshipRequest`, `GenerateInternshipDocument`, `UnifyCancellationReasons`). As Actions executam dentro de `DB::transaction()`, fazem `lockForUpdate()` e disparam notificações/auditoria. |
| `app/Models/` | **Entidades Eloquent do banco de dados** (`Internship`, `InternshipRequest`, `Affiliation`, `User`, `Course`, `Campus`, `GrantingParty`, `GeneratedDocument`, `SupervisorEvaluation`, etc.). **Importante:** os Models deste projeto validam suas próprias invariantes no método `booted()` (`static::saving(...)`), garantindo que nenhum dado inválido seja salvo mesmo fora da interface. |
| `app/Policies/` | **Regras de autorização (`Gate` / `Policy`).** Decidem quem pode ver, criar, editar ou exportar cada recurso (`InternshipPolicy`, `InternshipRequestPolicy`, `CoursePolicy`, `UserPolicy`, etc.), sempre avaliando o **vínculo ativo na sessão**. |
| `app/Support/` | **Serviços de domínio, calculadoras e consultas complexas.** Contém classes como `StudentInternshipContext` (vínculo ativo na sessão), `InternshipIndicators` (queries analíticas e metodologia dos 13 indicadores), `ProjectInternshipEndDate` (cálculo da data prevista de término considerando feriados, pausas e carga horária), `InternshipListing`, `CsvDownload`, `SelectOptionSource` e `UserManagementScope`. |
| `app/Enums/` | **Enums nativos do PHP** que tipam todas as situações e classificações do domínio (`AffiliationType`, `InternshipStatus`, `InternshipRequestStatus`, `GeneratedDocumentStatus`, `EvaluationStatus`, `BrazilianState`, etc.). Veja [Enums](doc:enums). |
| `app/Helpers/` e `app/helpers.php` | **Formatadores e utilitários puros** para datas (`DateHelper` e funções globais `formatShort`, `formatDateTime`, `formatMonthYear`), moeda (`CurrencyHelper`), documentos (`BrazilianDocumentHelper`), contatos, endereços e números por extenso. Veja [Helpers](doc:helpers). |
| `app/Concerns/` | **Traits reutilizáveis** entre componentes Livewire e Actions, como `SearchesSelectOptions` (alimenta os `<x-select>` com busca remota no Meilisearch), `InteractsWithCsvImport` e regras de validação de perfil/senha. |
| `app/Casts/` e `app/Rules/` | Conversores de atributos Eloquent (como `CpfCast`, que normaliza CPF para 11 dígitos no banco) e regras customizadas de validação. |
| `app/Http/Controllers/` | **Controllers enxutos**, usados principalmente para downloads em streaming (como `InternshipCsvController` e `InternshipIndicatorCsvController`) e rotas auxiliares que não são páginas Livewire. |
| `app/Console/Commands/` | Comandos Artisan agendados ou administrativos (ex.: sincronização de status de execução de estágios, avisos de término próximo e importação de feriados). Veja [Schedules](doc:schedules). |
| `app/Jobs/`, `app/Mail/`, `app/Notifications/` | Entrega assíncrona de e-mails (`SendEmailDelivery` com registro em `email_messages` e `email_delivery_attempts`) e notificações internas na interface. Veja [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas). |

### Fora de `app/` (interface, rotas, banco e configuração)

| Pasta / Arquivo | O que representa |
| --- | --- |
| `resources/views/pages/` | **Páginas Livewire (Single-File Components).** Os arquivos têm o prefixo `⚡` no nome (ex.: `resources/views/pages/internships/⚡indicators.blade.php`, `⚡index.blade.php`, `⚡show.blade.php`). No topo do arquivo fica a classe PHP anônima (`new class extends Component { ... }`) e logo abaixo fica o template Blade da tela. |
| `resources/views/components/` | **Componentes Blade reutilizáveis** (`<x-select>`, `<x-file-upload>`, `<x-dashboard-metric>`, `<x-internships.indicator-chart>`, `<x-academic-internships-table>`, etc.). |
| `resources/views/layouts/` | Layouts da área autenticada (`app/sidebar.blade.php`, onde fica o menu lateral por vínculo) e das telas públicas/autenticação. |
| `resources/css/` e `resources/js/` | Estilos Tailwind v4 (`app.css`, `select.css`, `accordion.css`) e scripts globais (`unsaved-changes.js`, `csv-import.js`). |
| `routes/web.php` | Mapeamento de todas as URLs web para páginas Livewire (`Route::livewire(...)`) ou controllers de download, protegidas por middlewares `auth`, `verified`, `affiliation.selected` e `can:...`. |
| `database/migrations/` | Histórico completo de criação e evolução das tabelas do PostgreSQL. Veja [Migrations](doc:migrations). |
| `database/factories/` e `database/seeders/` | Fábricas de modelos para testes/população local e seeders básicos (`CitySeeder`, `HolidaySeeder`). |
| `config/` | Configurações do Laravel, Fortify (`config/fortify.php`), Scout/Meilisearch (`config/scout.php`) e Activitylog (`config/activitylog.php`). |

### Como criar novos arquivos (sempre via Artisan no Sail)

Seguindo as convenções do Laravel adotadas no projeto, **sempre utilize os comandos `make:` do Artisan via Sail** para criar novos arquivos (em vez de criar arquivos PHP em branco manualmente). Isso garante namespaces, imports, estrutura e registro corretos:

```bash
# Descobrir todos os comandos disponíveis e ver opções de um comando específico
./vendor/bin/sail artisan list
./vendor/bin/sail artisan make:model --help

# Criar um novo Model já com migration, factory e seeder
./vendor/bin/sail artisan make:model NomeDoModelo -mfs --no-interaction

# Criar uma migration avulsa
./vendor/bin/sail artisan make:migration add_campo_to_tabela_table --no-interaction

# Criar uma Action, classe de suporte ou Enum
./vendor/bin/sail artisan make:class Actions/MinhaNovaAction --no-interaction
./vendor/bin/sail artisan make:class Support/MeuNovoServico --no-interaction
./vendor/bin/sail artisan make:enum MeuNovoEnum --String --no-interaction

# Criar Policy, Job, Comando Artisan ou Controller
./vendor/bin/sail artisan make:policy NomePolicy --model=NomeDoModelo --no-interaction
./vendor/bin/sail artisan make:job NomeDoJob --no-interaction
./vendor/bin/sail artisan make:command NomeDoComando --no-interaction
./vendor/bin/sail artisan make:controller NomeController --invokable --no-interaction

# Criar uma nova página ou componente Livewire
./vendor/bin/sail artisan make:livewire pages::modulo.nome-da-pagina --no-interaction
```

Ao editar ou criar qualquer arquivo, consulte sempre os arquivos vizinhos da mesma pasta para seguir exatamente a mesma estrutura, tipagem explícita (parâmetros e retorno) e nomenclatura.

---

## 4. De onde vêm os dados e como o sistema funciona por dentro

Para dar manutenção sem quebrar regras de negócio, é fundamental compreender **5 pilares** do fluxo de dados do SGE:

### 4.1. Conta (`User`) vs. Vínculo ativo (`Affiliation`)

No SGE, uma mesma pessoa (`users`, identificada pelo CPF e e-mail de login) pode ter **vários vínculos** (`affiliations`): por exemplo, ser `Advisor` (Orientador) e `Coordinator` (Coordenador de Curso) ao mesmo tempo, ou ter sido `Student` (Discente) em um curso e depois ingressar em outro.

- **Toda permissão e listagem depende do vínculo ativo selecionado na sessão**, e não apenas do `User` logado.
- O serviço `App\Support\StudentInternshipContext` recupera e valida na sessão qual `Affiliation` está ativo (`$context->selected(auth()->user())`).
- Cada página Livewire guarda `#[Locked] public int $affiliationId;` no `mount()` e confere no `hydrate()` se o vínculo da sessão não mudou — impedindo que uma aba antiga execute ações com permissões de outro perfil.

### 4.2. Caminho de uma requisição (Rota → Policy → Livewire → Action → Model)

Quando um usuário acessa uma tela ou clica em um botão:

1. **Rota (`routes/web.php`):** verifica autenticação, vínculo selecionado e a permissão inicial (`->middleware('can:viewIndicators,'.Internship::class)`).
2. **Página Livewire (`resources/views/pages/.../⚡*.blade.php`):** carrega os dados filtrados pelo escopo do vínculo ativo (ex.: `Internship::query()->visibleToAffiliation($affiliation)`).
3. **Leitura / Filtros / Buscas:**
   - Seletores `<x-select>` com muitos registros usam `searchSource` (trait `SearchesSelectOptions`), que pesquisa IDs no **Meilisearch** e revalida cada ID com uma query Eloquent no **PostgreSQL** antes de devolver até 20 opções elegíveis.
   - Datas e valores monetários exibidos na tela passam sempre pelos helpers do projeto (`formatShort()`, `formatDateTime()`, `CurrencyHelper`), nunca por `Carbon::format()` manual nas views.
4. **Gravação / Mudança de estado (`app/Actions/*`):**
   - O componente Livewire chama uma **Action** (ex.: `ManageInternshipLifecycle`, `UnifyCancellationReasons`).
   - A Action abre `DB::transaction()`, revalida a `Policy`, bloqueia os registros envolvidos (`lockForUpdate()`), altera os Models e agenda e-mails/reindexação do Scout para rodar após o commit (`DB::afterCommit(...)`).
5. **Validação de integridade no Model (`app/Models/*`):**
   - Mesmo dentro de scripts, Tinker ou Actions, o método `booted()` de cada Model executa `Validator::make(...)` antes de salvar no PostgreSQL.

### 4.3. Dados vivos vs. Snapshots históricos no Estágio (`internships`)

Ao formalizar um estágio (quando a solicitação `InternshipRequest` é aceita pelo Setor e gera um `Internship`), o sistema grava **snapshots em JSON** na tabela `internships`:

- `student_snapshot` (nome, período/ano letivo e dados do discente na época);
- `internship_type_snapshot` (nome do tipo e regras de carga horária vigentes na abertura);
- `granting_party_snapshot` (dados da empresa concedente e representante na época);
- `supervisor_snapshot` (dados e qualificação do supervisor na época).

**Por que isso existe?** Se meses depois uma empresa mudar de nome ou a carga horária exigida de um tipo de estágio for alterada para novas turmas, os estágios antigos e seus documentos/relatórios preservam o contrato original sem distorção histórica.

### 4.4. De onde vêm as datas previstas e as notas

- **Término previsto (`projected_end_date`):** calculado por `App\Support\ProjectInternshipEndDate` e `InternshipEndDateCalculator`. Ele cruza a data de início (`planned_start_date`), a carga horária exigida do tipo de estágio, a distribuição semanal de horas (`weekly_hours` e vigências de aditivos em `internship_work_schedules`), as pausas (`internship_pauses`), os feriados nacionais/estaduais/municipais da cidade do local de estágio (`holidays` e `holiday_recurrences`), as exceções de calendário do estágio (`internship_calendar_overrides`) e a margem de segurança (`safety_margin_days`).
- **Nota final (`consolidated_grade`):** calculada por `InternshipGradeCalculator` quando o estágio possui a avaliação do supervisor aprovada (`supervisor_grade`) e as notas lançadas pelo orientador (`report_grade` e `presentation_grade`), ponderadas pelos pesos congelados no tipo de estágio (escala de 0 a 10).

### 4.5. De onde vêm a Auditoria e os Indicadores (`activity_log` + `InternshipIndicators`)

- Toda alteração relevante em Models que usam o trait `LogsActivity` grava automaticamente um registro na tabela `activity_log` (com `subject_type`, `subject_id`, `causer_type`, `causer_id`, `event`, `attribute_changes` contendo `old` e `attributes`, e `properties`).
- Na tela **Indicadores** (`app/Support/InternshipIndicators.php`), os dados vêm do cruzamento direto no PostgreSQL entre `internships`, `courses`, `affiliations`, `users`, `granting_parties`, `generated_documents`, `internship_cancellation_requests` e `activity_log` (usado para identificar quando um aditivo teve sua assinatura conferida e quando um estágio transitou para `completed`).

---

## 5. Como usar Agentes de IA para entender e dar manutenção no projeto

O SGE foi estruturado desde o início para trabalhar em conjunto com **agentes de IA de programação** (como Claude Code, Cursor, GitHub Copilot, Codex, Antigravity, Gemini CLI, etc.). Se você assumir a manutenção, usar um agente conectado ao repositório reduz drasticamente o tempo para localizar arquivos e validar regras.

### 5.1. O que já está configurado para a IA no repositório

1. **`AGENTS.md` (na raiz do projeto):** arquivo lido automaticamente pelos agentes com as convenções do projeto (uso de PHP 8.5, Livewire 4, Flux UI, criação de arquivos via `artisan make:`, formatação com Pint, regras do Activitylog e Medialibrary).
2. **`.mcp.json` e `boost.json` (Laravel Boost MCP):** configura o servidor MCP do Laravel Boost. Ferramentas compatíveis com MCP conseguem consultar diretamente as rotas, o schema do banco de dados, configurações e logs da aplicação.
3. **`.agents/skills/`:** pastas de instruções especializadas que ensinam à IA as particularidades do projeto:
   - `sge-date-helper` e `sge-currency-helper`: garantem que a IA use os helpers de data e moeda do SGE;
   - `fluxui-development`, `livewire-development` e `tailwindcss-development`: padrões visuais e reativos usados nas telas;
   - `laravel-best-practices`, `medialibrary-development`, `scout-development` e `pt-br-validator`.

### 5.2. Recomendações práticas ao usar IA no SGE

Para que o agente de IA mantenha exatamente o mesmo padrão visual, arquitetural e de código do restante do sistema:

- **Peça sempre para a IA ativar as skills necessárias (`.agents/skills/`):** oriente o agente a ler e seguir as skills do domínio da tarefa antes de escrever código — por exemplo, `fluxui-development`, `livewire-development` e `tailwindcss-development` ao mexer em telas, modais ou tabelas; `laravel-best-practices` ao mexer em Actions, Models e queries; e `sge-date-helper`, `sge-currency-helper` ou `pt-br-validator` ao lidar com datas, valores monetários ou documentos brasileiros.
- **Peça para comparar com arquivos vizinhos:** instrua a IA a inspecionar telas e classes irmãs na mesma pasta para reaproveitar componentes já existentes (como `<x-select>`, `<x-file-upload>`, `<x-loading-overlay>`) e manter o layout idêntico ao padrão do sistema.
- **Use a documentação como contexto:** o site de documentação disponibiliza `llms.txt`, `llms-full.txt` e versões Markdown de cada página. Indique a página relevante da documentação (como [Matriz de autorização](doc:matriz-de-autorizacao) ou [Fase 8 — Estágio em andamento](doc:fase-08-estagio-em-andamento)) para que a IA respeite todas as regras de negócio.
- **Exija execução via Sail e verificação ao final:** peça que todo comando (`artisan make:`, `tinker`, `pint`, `types:check`) seja executado via `./vendor/bin/sail`.

### 5.3. Exemplos de prompts recomendados

Você pode copiar e adaptar os prompts abaixo ao trabalhar com o agente de IA na raiz do projeto:

- **Para entender um fluxo ou localizar onde algo acontece:**
  > *"Preciso entender como funciona a liberação de um estágio após a assinatura dos documentos. Consulte os arquivos em `app/Actions/` e `resources/views/pages/internships/`, siga as convenções do `AGENTS.md` e me explique quais classes, Policies, validações de Model e tabelas estão envolvidas."*

- **Para investigar e corrigir um bug mantendo o padrão do projeto:**
  > *"Um usuário com vínculo de Coordenação relatou um problema ao filtrar estágios por data de término previsto. Ative as skills necessárias em `.agents/skills/` (`livewire-development`, `laravel-best-practices`, `sge-date-helper`), verifique a página em `resources/views/pages/internships/`, `app/Support/InternshipListing.php` e `InternshipPolicy`, reproduza via `./vendor/bin/sail artisan tinker` e aplique a correção mantendo o estilo de código e layout existentes."*

- **Para criar ou ajustar uma tela ou funcionalidade:**
  > *"Seguindo o `AGENTS.md` e ativando as skills necessárias em `.agents/skills/` (`fluxui-development`, `livewire-development`, `tailwindcss-development`, `laravel-best-practices`), implemente [descreva a mudança]. Inspecione os arquivos vizinhos para manter exatamente o mesmo layout e estilo de código, crie novos arquivos com `./vendor/bin/sail artisan make:... --no-interaction`, use os componentes e helpers do projeto (`<x-select>`, helpers de data/moeda) e finalize rodando `./vendor/bin/sail bin pint --dirty` e `./vendor/bin/sail composer run types:check`."*

- **Para inspecionar ou popular dados de teste no banco local via Sail:**
  > *"Usando `./vendor/bin/sail artisan tinker`, consulte quantos estágios existem hoje no campus 1 por situação e crie registros de teste válidos respeitando as regras e validações dos Models."*

---

## 6. Checklist rápido antes de concluir uma manutenção

Sempre que fizer uma alteração no código, execute os comandos abaixo na raiz do projeto para garantir que tudo continua íntegro:

```bash
# 1. Formatar o código PHP alterado com o Laravel Pint
./vendor/bin/sail bin pint --dirty

# 2. Rodar a análise estática de tipos (PHPStan / Larastan)
./vendor/bin/sail composer run types:check

# 3. Se alterou views Blade ou CSS/JS: limpar views compiladas e compilar assets
./vendor/bin/sail artisan view:clear
./vendor/bin/sail npm run build
```

## Onde continuar a leitura

- [Ambiente de desenvolvimento](doc:ambiente-de-desenvolvimento) — como subir o Docker/Sail pela primeira vez.
- [Arquitetura atual](doc:arquitetura-atual) — stack detalhada e funcionamento da busca com Meilisearch.
- [Modelagem de dados](doc:modelagem-de-dados) e [Migrations](doc:migrations) — todas as tabelas e relacionamentos do PostgreSQL.
- [Matriz de autorização](doc:matriz-de-autorizacao) e [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo) — o que cada perfil pode ou não fazer.
- [Componentes técnicos](doc:componentes-tecnicos) — índice de Actions, Helpers, Casts, Concerns e Services.
