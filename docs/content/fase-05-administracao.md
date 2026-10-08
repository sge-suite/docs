---
id: fase-05-administracao
title: Fase 05 — Administração hierárquica
description: Implementação do backend e das interfaces administrativas em ordem de escopo, do global ao local.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/autorizacao, sge/checklist
related: pessoas-e-responsabilidades, matriz-de-autorizacao, perfis-e-responsabilidades-por-vinculo, fase-03-activity-log, fase-04-integracao-de-email, fase-06-documentos
source_refs: https://github.com/sge-suite/sge/blob/master/routes/web.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/CampusController.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/UserController.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/AdministrativeAffiliationController.php, https://github.com/sge-suite/sge/blob/master/app/Actions/CreateAdministrativeAffiliation.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ManageAdministrativeUser.php, https://github.com/sge-suite/sge/blob/master/app/Actions/UpdateAdministrativeAffiliation.php, https://github.com/sge-suite/sge/blob/master/app/Actions/AdministrativeAffiliationTransaction.php, https://github.com/sge-suite/sge/blob/master/app/Actions/GetAdministrativeDashboardMetrics.php, https://github.com/sge-suite/sge/blob/master/app/Policies/CampusPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/UserPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/AffiliationPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/ActivityPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/EmailDeliveryAttemptPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeActivityScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/EmailLogAccess.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/audit/%E2%9A%A1index.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/audit/%E2%9A%A1show.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1index.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1show.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/dashboard/partials/system-administrator.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/components/users/%E2%9A%A1form-fields.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/emails/affiliation-created.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/emails/account-email-changed.blade.php, https://github.com/sge-suite/sge/blob/master/config/scout.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CampusInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CampusSearchTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/UserManagementTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/UserInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/UserSearchTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AdministrativeUserChangesTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AuditInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailLogInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/DashboardTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/AdministrativeAffiliationConcurrencyTest.php
---
Base: [papéis por vínculo](doc:pessoas-e-responsabilidades), [Matriz de autorização](doc:matriz-de-autorizacao) e [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).

A estrutura de perfis e o contexto de vínculo existem. O provisionamento inicial ou a inclusão de Administrador do Sistema também pode ser feito por `admin:create`. A gestão global de campi tem backend, Policies, Form Requests, testes e páginas Livewire com Flux. O Administrador do Sistema também dispõe de telas para administrar contas e vínculos administrativos, consultar a auditoria administrativa e ver o histórico de e-mails associados a essas contas e vínculos. A interface local do Administrador do Campus, cursos, tipos de estágio e operações das jornadas de estágio continuam pendentes.

## Policies e escopo

- [x] Disponibilizar o contexto único do vínculo ativo para Policies e Actions por `ActiveAffiliationContext`; completar os resolvedores de escopo por recurso junto de cada fluxo.
- [x] Criar `CampusPolicy` para consulta e gestão de campi, usando somente o vínculo ativo selecionado.
- [x] Criar `UserPolicy` e ampliar `AffiliationPolicy` para contas e vínculos administrativos, exigindo o Administrador do Sistema ativo selecionado.
- [ ] Criar Policies para cursos, tipos, concedentes, estágios e documentos.
- [x] Revalidar vínculo selecionado, perfil e proteções administrativas dentro das transações de gestão de usuários e vínculos.
- [x] Manter as permissões de notificações em `AffiliationPolicy`; não há bypass global por `Gate::before`.
- [x] Criar testes positivos e negativos para operações de campus e administração de usuários/vínculos.
- [ ] Criar testes positivos e negativos dos demais recursos por função.
- [ ] Cobrir para cada `AffiliationType` as ações, limites, destinatários de notificação e consultas descritos em [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).
- [x] Restringir a gestão de usuários ao Administrador do Sistema, impedindo que o Administrador do Campus cadastre Administradores do Sistema.
- [ ] Permitir ao Setor de Estágio cadastrar usuários permitidos, exceto administradores.
- [ ] Aplicar as mesmas regras para edição e criação.

## Administrador do Sistema

- [x] Definir e testar as operações globais permitidas antes de criar suas telas.
- [x] Implementar o backend de cadastro, edição, desativação e reativação de campi por `CampusController`, usando `Campus::create()`, `$campus->update()` e métodos de ciclo de vida do Model.
- [x] Exigir a senha atual em cada desativação; bloquear alterações no campus inativo e manter os vínculos existentes.
- [x] Criar as telas Livewire de listagem, cadastro, detalhes e edição de campi para o Administrador do Sistema.
- [x] Disponibilizar busca textual tolerante a erros por nome, filtro de situação, paginação e seleção de cidade por UF. CNPJ não faz parte dos atributos pesquisáveis do índice atual.
- [x] Confirmar desativação em modal com senha atual; confirmar reativação sem senha adicional.
- [x] Restringir rotas, navegação e requisições Livewire ao vínculo ativo de Administrador do Sistema.
- [x] Disponibilizar índice e detalhes de auditoria para alterações de campi, contas e vínculos administrativos, autorizados por Policy e pelo vínculo ativo selecionado.
- [x] Disponibilizar histórico de e-mails ligados a contas e vínculos administrativos, com conteúdo armazenado e tentativas de envio.
- [x] Administrar contas e vínculos de Administrador do Sistema e Administrador do Campus pela interface, com políticas e validação de escopo.
- [x] Reutilizar a criação transacional de conta/vínculo compartilhada com `admin:create`.
- [x] Enviar convites e avisos de novo vínculo pela interface, informando a função adicionada e deduplicando os endereços da conta e do vínculo.
- [x] Permitir editar nome, CPF e e-mail de login da conta; a mudança de e-mail envia os avisos aos endereços anterior e novo, como na alteração própria em Segurança.
- [x] Separar edição da conta da edição do vínculo; no vínculo, permitir somente e-mail e registro institucional, mantendo pessoa, tipo e campus fixos.
- [x] Desativar, reativar ou excluir vínculo e excluir conta quando não houver registros associados; as operações de encerramento enviam aviso e preservam as proteções de último Administrador do Sistema.

### Telas de contas e vínculos administrativos

As rotas `users.*` são exclusivas do Administrador do Sistema com vínculo ativo selecionado. A listagem tem uma linha por conta com pelo menos um vínculo administrativo, inclusive desativado; busca nomes pelo Scout/Meilisearch e consulta CPF ou e-mail de login completos por igualdade, com 15 resultados por página. O painel administrativo, em contraste, conta todas as linhas de `users`.

O cadastro começa por consulta explícita do CPF. Para conta nova, um único e-mail é salvo na conta e no primeiro vínculo; é gerada uma senha aleatória desconhecida e enviado convite para definir senha. Para conta existente, nome, CPF e login são preservados e o campo único de e-mail vale para o novo vínculo. O aviso de novo vínculo identifica tipo, campus e registro institucional; se a conta já tiver outro registro, o formulário permite copiá-lo e ajustá-lo. Administrador do Campus exige campus ativo; Administrador do Sistema não recebe campus nem curso. Não se escolhe automaticamente o tipo de vínculo.

A edição da conta permite corrigir nome, CPF e endereço de login. A troca do login invalida tokens de redefinição pendentes e envia avisos aos endereços anterior e novo, seguindo o fluxo de Segurança. A edição do vínculo fica separada e limita-se ao e-mail e ao registro institucional; usuário, tipo e campus não mudam. Para mudar função ou campus, cadastra-se outro vínculo e encerra-se o anterior.

Uma pessoa não pode ter dois vínculos administrativos ativos com o mesmo tipo e campus. A duplicidade é verificada também ao reativar; vínculos históricos e duplicidades antigas não são apagados automaticamente. Vínculos de campus inativo ficam somente para leitura. Desativação de vínculo exige confirmação e senha atual, envia aviso aos e-mails da conta e do vínculo e não pode atingir o vínculo selecionado nem o último Administrador do Sistema ativo. Reativação exige confirmação, sem senha adicional, e obedece à regra de duplicidade. A exclusão de vínculo ou conta exige senha e só é permitida quando não há registros associados; também envia aviso. As alterações são transacionais, auditadas pelo vínculo administrador e não registram senhas.

As rotas `audit.*` e `email-logs.*` exigem o vínculo ativo e selecionado de Administrador do Sistema. Auditoria inclui campi, contas com vínculos administrativos e vínculos de Administrador do Sistema ou do Campus. O histórico de e-mails filtra pelas finalidades administrativas e pelo `scope_context` do registro afetado; não infere escopo a partir do destinatário ou do solicitante. Contatos externos podem aparecer quando o envio está ligado a conta ou vínculo dentro do escopo. A tela de e-mails mostra conteúdo persistido e tentativas, mas não oferece reenvio. Notificações operacionais, estágios, documentos, concedentes e outros vínculos ficam fora dessas consultas.

### Painel administrativo

O dashboard detalhado é exibido somente quando o vínculo ativo selecionado é Administrador do Sistema e considera dados de todo o sistema: total de contas da tabela `users`, vínculos e campi (com totais ativos), vínculos por tipo, estágios por situação, documentos por situação e solicitações enviadas ou em análise. Os status de estágio e documento aparecem mesmo com valor zero. Outros perfis recebem o painel padrão.

## Administrador do Campus

- [x] Limitar e testar a gestão local ao campus do vínculo ativo selecionado.
- [x] Permitir ao Administrador do Campus editar telefone, representante legal e dados do seguro do próprio campus; não permitir alterar nome, CNPJ, endereço, e-mail ou ciclo de ativação.
- [ ] Criar a tela Livewire de edição permitida do campus.
- [x] Impedir acesso a campus alheio, criação de campus e alteração do ciclo de ativação pelo Administrador do Campus.
- [ ] Administrar usuários e vínculos dentro do escopo.
- [ ] Criar/editar cursos, dois coordenadores e tipos de estágio.
- [ ] Impedir acesso a outro campus.

## Interface de campi

- Rotas GET: `campuses.index`, `campuses.create`, `campuses.show` e `campuses.edit`, com autenticação, contexto de vínculo e a permissão `viewAdministration`.
- Páginas SFC em `resources/views/pages/campuses`, com layout administrativo e navegação pela sidebar. A dashboard conserva seu layout anterior.
- Os campos compartilhados ficam no componente Livewire `campuses.form-fields`, reutilizado no cadastro e na edição. A digitação dos campos comuns usa `wire:model` sem `.live`; a consulta explícita do CNPJ sincroniza os valores, sem enviar uma requisição por tecla. Nome, CNPJ, telefone, e-mail, representante legal, seguradora, apólice e endereço são obrigatórios; o CEP é opcional. Os mesmos requisitos são aplicados no backend.
- `components/select` é um select próprio com lista customizada, busca interna, teclado, seleção única, temas claro/escuro e validação do formulário. Usa Blade, Alpine e componentes Flux Free; não depende do Flux Pro. A pesquisa não permite cadastrar um valor livre. O componente aceita `icon` no controle e `optionIcons` por opção, com versões pesquisável e sem busca. O campo de pesquisa é integrado ao painel, sem contorno preto interno; o controle externo mantém foco discreto para teclado. A lista usa rolagem de 4 px no Chromium e `thin` no Firefox. A mensagem vazia e a opção ativa acompanham inclusões, remoções e alterações de opções feitas pelo Livewire; o observador é desconectado ao destruir o componente.
- `cities.select` usa o enum `BrazilianState` para UF e registros da tabela `cities` para cidade. Não carrega opções inicialmente: pesquisa somente após 2 caracteres, com debounce de 500 ms e até 20 resultados pelo Scout/Meilisearch, filtrados por estado. Alterações do texto alimentam a busca; teclas sem mudança do valor não disparam pesquisa. Na edição, a cidade selecionada continua identificada no botão, mesmo fora dos resultados. Trocar UF limpa cidade e busca. A UF serve à interface e não é enviada como campo cadastral ao controller.
- Busca e situação ficam na URL; os resultados são paginados em grupos de 15. Consultas carregam endereço e cidade antecipadamente e não alteram dados ou geram atividades.
- Busca textual de campi usa Scout/Meilisearch pelo nome, com tolerância a erros. CNPJ não faz parte do índice pesquisável atual; a consulta por CNPJ formatado retorna vazio. Listagem sem texto e filtros estruturados podem usar Eloquent. Buscas textuais futuras sobre registros devem seguir Scout/Meilisearch e aplicar o escopo autorizado no índice; `query()` não substitui filtros do mecanismo. A filtragem local do select de UF opera apenas sobre as 27 opções fixas do enum.
- Cadastro e edição usam formulários HTTP com CSRF, erros por campo, preservação dos dados preenchidos e indicação de envio. As gravações continuam nas transações do `CampusController`, com a validação e a auditoria existentes.
- Operações do Administrador do Sistema retornam aos detalhes do campus com mensagem de resultado. A atualização local pelo backend do Administrador do Campus continua retornando ao painel, pois sua interface está pendente.
- Campus desativado mostra a data e o aviso de somente leitura, sem edição. O modal de desativação reabre após erro de senha e não preserva a senha informada. As identidades dos campi nos componentes são bloqueadas contra alteração pelo cliente; a permissão é revalidada a cada requisição Livewire.
- `CampusInterfaceTest` cobre renderização, acesso por perfil e vínculo, filtros, paginação, cidade por UF, erros de formulário, modal, congelamento e revalidação de permissão.

### Índices e integrações

Os índices de `Campus` e `City` são configurados em `config/scout.php`. A sincronização Eloquent ocorre por fila após commit. Execute `./vendor/bin/sail artisan scout:sync-index-settings` e importe registros existentes com `scout:import 'App\Models\Campus'` e `scout:import 'App\Models\City'`. Mantenha um worker de fila ativo; o Meilisearch também processa suas tarefas de indexação de modo assíncrono. Configure `SCOUT_PREFIX` ao compartilhar o serviço entre ambientes.

A suíte geral usa o driver `collection` para não alterar índices do desenvolvimento. `CampusSearchTest` usa o Meilisearch real, índices temporários com prefixo aleatório e limpeza após cada teste; verifica busca, filtros, criação, edição, transições, exclusão, fila e rollback. O serviço Meilisearch do Sail é necessário para esses testes.

O botão **Consultar CNPJ**, nos formulários de cadastro e edição, usa `BrasilApiCompanyLookup` para consultar `cnpj/v1/{cnpj}` na BrasilAPI. Valida e normaliza o CNPJ antes da chamada, com conexão limitada a 3 segundos e resposta a 10 segundos. Preenche razão social como nome, telefone, e-mail e endereço quando disponíveis; resolve a cidade por `ibge_code` e UF na tabela local, sem busca textual nem criação de cidades. Uma consulta bem-sucedida reinicializa o seletor com essa cidade; quando não houver correspondência, limpa a seleção anterior e solicita UF/cidade manualmente. Campos ausentes na resposta não apagam valores digitados. Os dados permanecem editáveis e só são gravados pelo envio normal ao controller, com Form Requests e auditoria. A consulta em si não grava dados nem atividades. Falhas, CNPJ não encontrado e respostas inválidas exibem erro e preservam o formulário. A permissão e o estado do campus são revalidados em cada requisição. Representante legal e seguro continuam sob responsabilidade de quem cadastra; não são inferidos do quadro de sócios. Consulta independente por CEP permanece pendente.

## Setor de Estágio

- [ ] Implementar autorização e Actions de gestão dos cadastros e análises antes de criar as telas operacionais.
- [ ] Administrar templates DOCX e versões.
- [ ] Administrar concedentes e solicitações pendentes no escopo do campus; cadastros e aprovações devem preservar essa associação mesmo quando CPF/CNPJ se repetirem.
- [ ] Administrar a importação do calendário nacional/estadual e o cadastro manual de feriados municipais.
- [ ] Analisar estágios enviados.
- [ ] Analisar solicitações de supervisor/concedente.
- [ ] Validar documentos, avaliações, pendências e liberação.
- [ ] Consultar o calendário aplicável e registrar exceções por estágio, sem alterar o calendário global.

## Próxima fase

[Fase 06 — Documentos](doc:fase-06-documentos)
