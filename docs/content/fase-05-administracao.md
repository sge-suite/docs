---
id: fase-05-administracao
title: Fase 05 — Administração hierárquica
description: Implementação do backend e das interfaces administrativas em ordem de escopo, do global ao local.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/autorizacao, sge/checklist
related: pessoas-e-responsabilidades, matriz-de-autorizacao, perfis-e-responsabilidades-por-vinculo, fase-03-activity-log, fase-04-integracao-de-email, fase-06-documentos
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/PrepareUserImport.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ProcessUserImport.php, https://github.com/sge-suite/sge/blob/master/app/Support/UserImportValidator.php, https://github.com/sge-suite/sge/blob/master/app/Support/UserCsv.php, https://github.com/sge-suite/sge/blob/master/app/Support/ImportCsv.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/InteractsWithCsvImport.php, https://github.com/sge-suite/sge/blob/master/resources/js/csv-import.js, https://github.com/sge-suite/sge/blob/master/routes/web.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/CampusController.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/UserController.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/AdministrativeAffiliationController.php, https://github.com/sge-suite/sge/blob/master/app/Actions/CreateAdministrativeAffiliation.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ManageAdministrativeUser.php, https://github.com/sge-suite/sge/blob/master/app/Actions/UpdateAdministrativeAffiliation.php, https://github.com/sge-suite/sge/blob/master/app/Actions/AdministrativeAffiliationTransaction.php, https://github.com/sge-suite/sge/blob/master/app/Actions/GetAdministrativeDashboardMetrics.php, https://github.com/sge-suite/sge/blob/master/app/Policies/CampusPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/UserPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/AffiliationPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/ActivityPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Policies/EmailDeliveryAttemptPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeActivityScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/EmailLogAccess.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/audit/%E2%9A%A1index.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/audit/%E2%9A%A1show.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1index.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/email-logs/%E2%9A%A1show.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/dashboard/partials/system-administrator.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/components/users/%E2%9A%A1form-fields.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/emails/affiliation-created.blade.php, https://github.com/sge-suite/sge/blob/master/resources/views/emails/account-email-changed.blade.php, https://github.com/sge-suite/sge/blob/master/config/scout.php, https://github.com/sge-suite/sge/blob/master/app/Actions/CreateCampusAffiliation.php, https://github.com/sge-suite/sge/blob/master/app/Concerns/CampusAffiliationValidationRules.php, https://github.com/sge-suite/sge/blob/master/app/Support/UserManagementScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/ActivityAccess.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusActivityScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeActivityPresenter.php
---
Base: [papéis por vínculo](doc:pessoas-e-responsabilidades), [Matriz de autorização](doc:matriz-de-autorizacao) e [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).

A estrutura de perfis e o contexto de vínculo existem. O provisionamento inicial ou a inclusão de Administrador do Sistema também pode ser feito por `admin:create`. A gestão global de campi tem backend, Policies, Form Requests e páginas Livewire com Flux. O Administrador do Sistema também dispõe de telas para administrar contas e vínculos administrativos, consultar a auditoria administrativa e ver o histórico de e-mails associados a essas contas e vínculos. A tela Meu campus e a gestão completa de cursos estão implementadas para o Setor de Estágio. A gestão local de usuários e vínculos e as consultas de auditoria e e-mails compartilham as telas administrativas com autorização pelo campus do vínculo ativo selecionado. A gestão de tipos de estágio também está implementada; operações das jornadas de estágio continuam pendentes. Não há suíte automatizada nesta etapa; os fluxos mantêm pendências de validação funcional.

## Policies e escopo

- [x] Disponibilizar o contexto único do vínculo ativo para Policies e Actions por `ActiveAffiliationContext`; completar os resolvedores de escopo por recurso junto de cada fluxo.
- [x] Criar `CampusPolicy` para consulta e gestão de campi, usando somente o vínculo ativo selecionado.
- [x] Criar `UserPolicy` e ampliar `AffiliationPolicy` para contas e vínculos administrativos, exigindo o vínculo ativo selecionado e distinguindo administração global de gestão local.
- [ ] Criar CoursePolicy e testar o escopo do Setor de Estágio.
- [ ] Criar InternshipTypePolicy e testar o campus derivado do curso.
- [ ] Criar `GrantingPartyPolicy` e testar consulta e gestão local de concedentes; Policies de estágios e documentos continuam pendentes.
- [x] Revalidar vínculo selecionado, perfil e proteções administrativas dentro das transações de gestão de usuários e vínculos.
- [x] Manter as permissões de notificações em `AffiliationPolicy`; não há bypass global por `Gate::before`.
- [ ] Criar testes positivos e negativos para operações de campus e administração de usuários/vínculos.
- [ ] Testar gestão de cursos e Meu campus pelo Setor de Estágio.
- [ ] Criar testes positivos e negativos dos demais recursos por função.
- [ ] Cobrir para cada `AffiliationType` as ações, limites, destinatários de notificação e consultas descritos em [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).
- [x] Compartilhar a gestão de usuários entre Administrador do Sistema e Setor de Estágio, com permissões e escopos distintos.
- [x] Permitir ao Setor de Estágio cadastrar todos os tipos de vínculo, exceto Administrador do Sistema, no campus ativo selecionado.
- [ ] Aplicar as mesmas regras para edição e criação.

## Administrador do Sistema

- [ ] Definir e testar as operações globais permitidas antes de criar suas telas.
- [x] Implementar o backend de cadastro, edição, desativação e reativação de campi por `CampusController`, usando `Campus::create()`, `$campus->update()` e métodos de ciclo de vida do Model.
- [x] Exigir a senha atual em cada desativação; bloquear alterações no campus inativo e manter os vínculos existentes.
- [x] Criar as telas Livewire de listagem, cadastro, detalhes e edição de campi para o Administrador do Sistema.
- [x] Disponibilizar busca textual tolerante a erros por nome, filtro de situação, paginação e seleção de cidade por UF. CNPJ não faz parte dos atributos pesquisáveis do índice atual.
- [x] Confirmar desativação em modal com senha atual; confirmar reativação sem senha adicional.
- [x] Restringir rotas, navegação e requisições Livewire de administração global ao vínculo ativo de Administrador do Sistema.
- [x] Disponibilizar índice e detalhes de auditoria para alterações de campi, contas e vínculos administrativos, autorizados por Policy e pelo vínculo ativo selecionado.
- [x] Disponibilizar histórico de e-mails ligados a contas e vínculos administrativos, com conteúdo armazenado e tentativas de envio.
- [x] Administrar contas e vínculos de Administrador do Sistema e Setor de Estágio pela interface, com políticas e validação de escopo.
- [x] Reutilizar a criação transacional de conta/vínculo compartilhada com `admin:create`.
- [x] Enviar convites e avisos de novo vínculo pela interface, informando a função adicionada e deduplicando os endereços da conta e do vínculo.
- [x] Permitir editar nome, CPF e e-mail de login da conta; a mudança de e-mail envia os avisos aos endereços anterior e novo, como na alteração própria em Segurança.
- [x] Separar edição da conta da edição do vínculo; no vínculo, permitir somente e-mail e registro institucional, mantendo pessoa, tipo e campus fixos.
- [x] Desativar, reativar ou excluir vínculo e excluir conta quando não houver registros associados; as operações de encerramento enviam aviso e preservam as proteções de último Administrador do Sistema.

### Telas de contas e vínculos administrativos

As rotas `users.*` e o item **Usuários** da sidebar são compartilhados pelo Administrador do Sistema e pelo Setor de Estágio, sempre pelo vínculo ativo selecionado. O Administrador lista contas com vínculos administrativos, inclusive desativados; busca nomes pelo Scout/Meilisearch e consulta CPF ou e-mail de login completos por igualdade. O Setor lista somente contas com vínculos do próprio campus e mostra apenas esses vínculos nos detalhes, sem vínculos de Administrador do Sistema. Sua busca por nome, CPF ou e-mail é restrita ao mesmo escopo e usa Eloquent, pois o índice atual de usuários contém apenas contas administrativas. Ambos paginam 15 resultados. Contas de outro campus ou sem vínculo só podem ser identificadas por consulta explícita do CPF no cadastro, para acrescentar um vínculo local; não recebem acesso direto às telas de detalhes e edição.

O cadastro começa por consulta explícita do CPF. Para conta nova, um único e-mail é salvo na conta e no primeiro vínculo; é gerada uma senha aleatória desconhecida e enviado convite para definir senha. Para conta existente, nome, CPF e login são preservados e o campo único de e-mail vale para o novo vínculo. O aviso de novo vínculo identifica tipo, campus e matrícula quando aplicável; o formulário permite copiar e ajustar uma matrícula da mesma conta, restrita ao campus na visão do Setor. No cadastro local, o campus vem exclusivamente do vínculo ativo, sem seletor; todos os tipos exceto Administrador do Sistema ficam disponíveis. Discente exige curso ativo do mesmo campus; os demais tipos não recebem curso. Supervisor não solicita nem persiste matrícula e aceita cargo/função, curso de formação, nível e tempo de experiência na função opcionais em `user_personal_data`. Campos profissionais omitidos ou vazios no cadastro preservam o perfil existente. Administrador do Sistema não recebe campus nem curso. Não se escolhe automaticamente o tipo de vínculo.

A edição da conta permite corrigir nome, CPF e endereço de login. A troca do login invalida tokens de redefinição pendentes e envia avisos aos endereços anterior e novo, seguindo o fluxo de Segurança. A edição do vínculo fica separada e permite e-mail e matrícula quando aplicável, além dos campos profissionais opcionais de supervisor na visão do Setor. Usuário, tipo, campus e curso não mudam. Para mudar função, campus ou curso, cadastra-se outro vínculo; o vínculo selecionado permanece protegido contra desativação e exclusão enquanto for o contexto da sessão.

O rótulo dos formulários é **Matrícula** para todos os tipos que possuem esse campo. A matrícula só pode ser reutilizada em vínculos da mesma pessoa, inclusive entre funções ou campi distintos, e permanece única entre vínculos discentes. Registros de outra pessoa permanecem reservados mesmo quando o vínculo está desativado. A regra é compartilhada pelos formulários, pelas Actions e pelo model. No comando `admin:create`, cada entrada é validada antes de avançar: a existência de um vínculo ativo de Administrador do Sistema é verificada ao informar o CPF, e a titularidade do registro institucional é verificada antes da confirmação. A gravação revalida as regras dentro da transação.

Uma pessoa não pode ter dois vínculos administrativos ativos com o mesmo tipo e campus. A duplicidade é verificada também ao reativar; vínculos históricos e duplicidades antigas não são apagados automaticamente. Vínculos de campus inativo ficam somente para leitura. Desativação de vínculo exige confirmação e senha atual, envia aviso aos e-mails da conta e do vínculo e não pode atingir o vínculo selecionado na sessão nem o último Administrador do Sistema ativo. Vínculos próprios não selecionados podem ser desativados dentro do escopo normal. Reativação exige confirmação, sem senha adicional, e obedece à regra de duplicidade; o Setor pode reativar seus vínculos locais próprios. A exclusão de vínculo ou conta exige senha e só é permitida quando não há registros associados; também envia aviso. As alterações são transacionais, auditadas pelo vínculo ativo responsável e não registram senhas. Exclusão física de vínculo depende da ausência de referências como coordenação de cursos, solicitações, estágios, avaliações, templates, envios, notificações e anexos. A conta e seus dados pessoais permanecem. Activity Log, como assunto ou autor, não impede excluir o vínculo: seus registros são preservados sem introduzir SoftDeletes.

As rotas `audit.*` e `email-logs.*` e o grupo **Logs** da sidebar são compartilhados pelo Administrador do Sistema e pelo Setor de Estágio, sempre pelo vínculo ativo selecionado. O Administrador consulta campi, contas com vínculos administrativos e vínculos de Administrador do Sistema ou Setor de Estágio. O Setor consulta somente o próprio campus, seus cursos, contas com vínculos locais atuais e vínculos locais de qualquer tipo exceto Administrador do Sistema. Dados de acesso de outros administradores ficam protegidos; a própria conta mantém a exceção da gestão de usuários. O histórico de vínculos e cursos excluídos recupera campus e tipo dos registros de auditoria, inclusive quando uma alteração registrou somente os campos modificados. A autoria de uma ação não amplia o escopo.

O histórico de e-mails filtra pelas finalidades de cadastro e alterações administrativas e pelo `scope_context` persistido do registro afetado; não infere escopo a partir do destinatário ou do solicitante. O Setor exige o campus local no contexto, protege mensagens de Administrador do Sistema e pode consultar o aviso de alteração do próprio e-mail de login mesmo quando também possui vínculo global. Contatos externos podem aparecer quando o envio está ligado a conta ou vínculo dentro do escopo. A tela mostra conteúdo persistido e tentativas, inclusive após exclusão do vínculo, mas não oferece reenvio. Campus desativado mantém a consulta histórica. Notificações operacionais, estágios e documentos continuam fora dessas consultas enquanto seus fluxos e Policies não definirem acesso ao histórico.

Nos detalhes de auditoria, referências a campus, curso, usuário, coordenadores e endereço exibem o nome ou descrição atual junto do identificador, tanto no valor anterior quanto no novo. Os rótulos usam **Campus**, **Curso**, **Usuário**, **Coordenador titular**, **Coordenador substituto** e **Endereço**. A interface identifica esses nomes como atuais; não os apresenta como nomes históricos registrados na ação. Quando a referência não existe ou está fora do campus autorizado, mantém o identificador com **identificação indisponível**, sem revelar dados externos. Valores nulos e ausentes continuam distintos.

### Painel administrativo

O dashboard detalhado é exibido somente quando o vínculo ativo selecionado é Administrador do Sistema e considera dados de todo o sistema: total de contas da tabela `users`, vínculos e campi (com totais ativos), vínculos por tipo, estágios por situação, documentos por situação e solicitações enviadas ou em análise. Os status de estágio e documento aparecem mesmo com valor zero. Outros perfis recebem o painel padrão.

## Setor de Estágio

- [ ] Limitar e testar a gestão local ao campus do vínculo ativo selecionado.
- [x] Permitir ao Setor de Estágio editar nome, CNPJ, endereço, telefone, representante legal e dados do seguro do próprio campus; manter o ciclo de ativação restrito ao Administrador do Sistema.
- [x] Exibir dados e histórico do campus em “Meu campus” e oferecer edição em uma tela separada, com o endereço compartilhado pelo componente Blade `address.form-fields`.
- [x] Impedir acesso a campus alheio, criação de campus e alteração do ciclo de ativação pelo Setor de Estágio.
- [x] Listar, cadastrar, consultar e editar contas e vínculos no campus selecionado; desativar ou excluir vínculos de outras pessoas com senha e confirmação.
- [x] Compartilhar as telas de auditoria e e-mails e o grupo Logs, com escopo do campus e reautorização em cada requisição.
- [x] Exibir nomes ou descrições atuais das referências nos campos alterados da auditoria, preservando IDs e limites de acesso.
- [x] Implementar gestão completa de cursos, com coordenadores opcionais, desativação e exclusão com senha, reativação e consulta restrita ao campus.
- [x] Implementar listagem, cadastro, consulta, edição, desativação, reativação e exclusão de tipos de estágio sem referências, com regras compartilhadas com o Model.
- [x] Impedir acesso a outro campus nas telas Meu campus, Cursos e Tipos de estágio.

### Gestão local de usuários e vínculos

O Setor pode acrescentar vínculo a uma conta local pela tela de detalhes, sem repetir a consulta de CPF. Também pode editar matrícula e e-mail de vínculos locais, incluindo os próprios e o histórico desativado; tipo, campus e curso são preservados. Supervisor continua sem matrícula e permite editar os campos profissionais opcionais do perfil compartilhado. Campos omitidos preservam o valor; campos enviados vazios podem limpar esses dados opcionais. A edição não altera nome, CPF, e-mail de login ou senha da conta e não envia convite.

A edição de **Dados de acesso** atualiza nome, CPF e e-mail de login, com unicidade e avisos aos endereços antigo e novo. O Setor pode editar a própria conta mesmo quando também possui um vínculo de Administrador do Sistema; não pode editar dados de acesso de outros administradores. A consulta a outras contas permanece restrita aos vínculos do campus. Exclusão de conta e reativação de vínculos de outras pessoas continuam restritas ao Administrador do Sistema.

Desativação e exclusão de vínculos locais, próprios ou de outras pessoas, usam os mesmos modais e endpoints, com senha atual e confirmação obrigatórias no formulário e na Action. O Setor não altera vínculos globais de Administrador do Sistema nem vínculos de outro campus. Nenhum perfil pode desativar ou excluir o vínculo atualmente selecionado; após trocar o contexto, o vínculo anterior pode ser gerido conforme as permissões normais. Campus desativado permite apenas leitura. Ao excluir o último vínculo local de uma pessoa, o Setor retorna à lista e perde o acesso aos detalhes dessa conta.



### Configuração própria de dados pessoais

A edição administrativa de campos profissionais permanece separada da aba **Dados pessoais**, implementada na [Fase 02](doc:fase-02-conta-e-contexto). Nessa aba, somente a própria conta com vínculo ativo selecionado de Discente ou Supervisor edita os campos permitidos pelo contexto; o telefone é compartilhado. Setor de Estágio e Administrador do Sistema não usam essa configuração enquanto forem o contexto selecionado. Não se alteram nome, CPF, login, senha ou emancipação. Policy, Form Request e Action transacional revalidam identidade e vínculo. Endereço atual é exclusivo do perfil e mudanças preservam referências e snapshots históricos; campus inativo mantém esta configuração pessoal disponível.

### Gestão de tipos de estágio

As rotas `internship-types.*` disponibilizam listagem, cadastro, detalhes, edição, desativação, reativação e exclusão ao vínculo ativo e selecionado de Setor de Estágio. A listagem é paginada em grupos de 15 e permite filtrar ativos e desativados. A Policy deriva o campus pela associação ao curso; a sessão fornece o campus autorizado. Formulários não recebem campus ou escopo livres e rejeitam campos não permitidos, incluindo situação, regras JSON e snapshots. IDs de outro campus são recusados tanto nas páginas e requisições HTTP quanto nas Actions e requisições Livewire. Administrador do Sistema precisa selecionar um vínculo de Setor de Estágio para operar o catálogo.

O cadastro e a troca de curso oferecem somente cursos ativos do campus selecionado. Na edição, o curso atual desativado pode ser mantido e aparece identificado como associação atual; outros cursos desativados não ficam disponíveis. O backend revalida essa elegibilidade no salvamento. Tipos desativados podem ser corrigidos enquanto o campus estiver ativo. Campus desativado permite apenas consulta.

Os formulários reutilizam as validações de [Tipos de estágio](doc:migration-11-internship-types): carga horária inteira positiva; três pesos inteiros positivos somando exatamente 10; conceitos não negativos com até uma casa decimal, estritamente decrescentes e limitados pelo peso do supervisor. Ótimo é derivado desse peso, sem campo persistido próprio. Os limites diário e semanal começam em 6 e 30, não podem ser reduzidos e têm tetos de 24 por dia e 40 por semana; o limite diário não pode superar o semanal. O teto de 40 horas semanais depende da exceção prevista no projeto pedagógico pela Lei nº 11.788/2008. A margem começa em 7 e aceita inteiro não negativo. Insatisfatório começa em zero e permanece configurável. Nos conceitos decimais, digitar ou colar vírgula converte o separador para ponto, sem arredondar; o backend também aceita vírgula e mantém a restrição de até uma casa decimal.

Desativação e exclusão exigem confirmação e senha atual; reativação exige confirmação e curso ativo. A exclusão física é permitida somente quando não há estágio nem solicitação vinculados ao tipo, com a Policy e a Action revalidando a condição. Transições repetidas são recusadas. As gravações são transacionais, bloqueiam e revalidam vínculo, campus, tipo e cursos envolvidos, e registram autoria pelo vínculo ativo no Activity Log sem guardar senhas. Trocar curso ou alterar configuração e situação não modifica snapshots, notas ou datas dos estágios já formalizados.


## Interface de campi

- Rotas GET: `campuses.index`, `campuses.create`, `campuses.show` e `campuses.edit`, protegidas por autenticação, contexto de vínculo e a permissão `viewAdministration`.
- Cadastro e edição compartilham campos. O backend valida os dados e grava em transação; as consultas de CNPJ e CEP apenas propõem dados, e a persistência ocorre no envio normal. CEP é obrigatório, validado por PT-BR Validator e armazenado com oito dígitos.
- O select compartilhado permite busca e seleção entre opções autorizadas; não aceita valores livres. UF usa `BrazilianState` e cidades vêm do catálogo local. A mudança da UF limpa a cidade, e UF não é persistida como dado do campus.
- Busca, UF e situação podem ser combinadas e ficam na URL; resultados são paginados em grupos de 15. Consultas carregam endereço e cidade sem alterar dados ou gerar atividades.
- Sem filtro de UF, a busca textual tolerante a erros de campi usa Scout/Meilisearch pelo nome. Com UF selecionada, a busca por trecho do nome combina com esse filtro em Eloquent. CNPJ não faz parte do índice atual.
- Campus desativado permite somente consulta. A identidade do campus nos componentes não pode ser alterada pelo cliente; a permissão é revalidada em cada requisição Livewire. A senha usada na desativação não é persistida.

### Índices e integrações

Os índices de `Campus`, `City`, `Holiday` e `HolidayRecurrence` são configurados em `config/scout.php`. A sincronização Eloquent ocorre por fila após commit. O seed de cidades e feriados pausa somente os jobs individuais e envia os registros em lotes ao concluir a persistência. Execute `./vendor/bin/sail artisan scout:sync-index-settings`; o comando `scout:import` continua disponível para reindexação extraordinária de cada Model. Mantenha um worker de fila ativo; o Meilisearch também processa suas tarefas de indexação de modo assíncrono. Configure `SCOUT_PREFIX` ao compartilhar o serviço entre ambientes.

A busca de produção depende do serviço Meilisearch e da configuração descritos acima. A validação funcional da busca permanece pendente; não há suíte automatizada nesta etapa.

O botão **Consultar CNPJ**, nos formulários de cadastro e edição, usa `BrasilApiCompanyLookup` para consultar `cnpj/v1/{cnpj}` na BrasilAPI. Valida e normaliza o CNPJ antes da chamada, com conexão limitada a 3 segundos e resposta a 10 segundos. Preenche razão social como nome, telefone, e-mail e endereço quando disponíveis; resolve a cidade por `ibge_code` e UF na tabela local, sem busca textual nem criação de cidades. Uma consulta bem-sucedida reinicializa o seletor com essa cidade; quando não houver correspondência, limpa a seleção anterior e solicita UF/cidade manualmente. Campos ausentes na resposta não apagam valores digitados. Os dados permanecem editáveis e só são gravados pelo envio normal ao controller, com Form Requests e auditoria. A consulta em si não grava dados nem atividades. Falhas, CNPJ não encontrado e respostas inválidas exibem erro e preservam o formulário. A permissão e o estado do campus são revalidados em cada requisição. Representante legal e seguro continuam sob responsabilidade de quem cadastra; não são inferidos do quadro de sócios. A consulta independente por CEP está implementada com revisão antes de aplicar, conforme descrito abaixo.

## Setor de Estágio

- [ ] Implementar autorização e Actions de gestão dos cadastros e análises antes de criar as telas operacionais.
- [ ] Administrar templates DOCX e versões.
- [ ] Administrar concedentes e solicitações pendentes no escopo do campus; cadastros e aprovações devem preservar essa associação mesmo quando CPF/CNPJ se repetirem.
- [x] Consultar todos os feriados e recorrências do calendário único, sem escrita ou restrição territorial automática; importação e manutenção global são exclusivas do Administrador do Sistema.
- [ ] Analisar estágios enviados.
- [ ] Analisar solicitações de supervisor/concedente.
- [ ] Validar documentos, avaliações, pendências e liberação.
- [ ] Consultar o calendário aplicável e registrar exceções por estágio, sem alterar o calendário global.

## Próxima fase

[Fase 06 — Documentos](doc:fase-06-documentos)

### Consulta de CEP com revisão

O botão **Buscar CEP**, no endereço compartilhado pelo cadastro e edição de campus, consulta `cep/v1/{cep}` usando `BrasilApiCepLookup`, com CEP validado obrigatoriamente por PT-BR Validator. O modal apresenta valores atuais e propostos antes de aplicar logradouro, bairro e cidade. Mantém o número e os campos não retornados, permite cancelar e deixa os dados editáveis. A cidade é resolvida por nome normalizado e UF no catálogo local; se não houver correspondência única, a seleção é limpa para preenchimento manual. Mudar o CEP depois da consulta invalida a proposta. A integração revalida autorização, trata indisponibilidade sem apagar dados e não grava nem audita antes do envio normal do formulário. O salvamento exige CEP válido, mas não depende de sucesso da consulta. O banco recebe somente oito dígitos, preservando zeros à esquerda. O modal de revisão pertence ao componente reutilizável `address.form-fields`, compartilhado por Campus, Partes Concedentes e configurações próprias do Discente. A lógica comum está em `InteractsWithAddressLookup`, que exige autorização específica do formulário tanto na consulta quanto na aplicação. Cada campo alterado aparece em um card com valor atual e proposto, no mesmo padrão da consulta de CNPJ. Quando não há diferenças, informa que os dados já correspondem ao formulário e oferece apenas fechar.

## Gestão direta de partes concedentes

A gestão direta está implementada para o vínculo ativo selecionado de Setor de Estágio, restrita ao próprio campus, pelas rotas `granting-parties.*`. A área possui listagem, cadastro, detalhes e edição com Livewire/Flux. A lista busca nome ou CPF/CNPJ completo, filtra por UF, cidade e situação e pagina 15 registros. A busca por cidade funciona com todas as UFs ou após restringir uma UF, e identifica cada resultado por cidade e sigla da UF. Os filtros podem ser limpos em conjunto. Os formulários ajustam o campo e a validação conforme CPF ou CNPJ. Para CNPJ, reutilizam a consulta BrasilAPI com revisão de razão social/nome fantasia, telefone, e-mail, atividade econômica principal (CNAE) e endereço antes de aplicar. E-mail inválido e dados ausentes preservam o preenchimento manual. O formulário dispõe os dados cadastrais à esquerda e o endereço à direita em telas amplas; nome e área de atuação ocupam a largura da coluna cadastral, e o credenciamento fica em seção opcional própria. Também reutilizam o endereço e a consulta de CEP com revisão; consulta e aplicação não gravam dados.

`GrantingPartyPolicy`, Form Requests e `ManageGrantingParty` revalidam autorização e escopo. O campus não é um campo livre. Desativação e exclusão exigem senha atual; reativação exige confirmação. Concedentes desativadas podem ser corrigidas enquanto o campus estiver ativo. Campus desativado permite somente leitura. A exclusão é física e exige ausência de estágios e de solicitações vinculadas. O endereço é removido fisicamente na mesma transação; outras referências ativas ou históricas preservam a linha. O endereço atual é substituído por uma nova linha quando muda, preservando o anterior. As gravações registram o vínculo responsável no Activity Log.


A remoção de endereços é compartilhada por Campus, Concedente, dados pessoais e Estágio via `HasOwnedAddresses`: proprietário e endereço são excluídos por Eloquent na mesma transação, com rollback integral em caso de falha. Endereços utilizados por outros cadastros ou registros históricos permanecem disponíveis. Não há `SoftDeletes` em endereços, campi ou concedentes; os contratos das migrations originais refletem essa decisão.

## Histórico de auditoria nas telas de detalhes

Além do índice compartilhado **Auditoria**, o histórico relacionado aparece nos detalhes dos recursos autorizados ao perfil: campus para Administrador do Sistema; Meu campus, cursos, tipos de estágio e partes concedentes para Setor de Estágio; contas e vínculos locais conforme o escopo de cada perfil. A lista de uma concedente ou campus inclui também eventos do respectivo endereço e identifica o cadastro proprietário, mesmo após substituição ou exclusão do endereço. O Setor não consulta outro campus; o Administrador não ganha acesso a cadastros locais de cursos, tipos ou concedentes por meio da auditoria.

## Filtros dos índices administrativos

Os filtros de cada índice podem ser combinados e, quando ativos, o botão **Limpar filtros** restaura os valores padrão e retorna à primeira página.

| Índice | Busca e filtros |
| --- | --- |
| Campi | Nome, UF e situação. |
| Usuários | Nome, CPF completo ou e-mail de login completo; perfil e situação do vínculo. Perfil e situação são avaliados no mesmo vínculo visível ao usuário. |
| Cursos | Nome e situação. |
| Tipos de estágio | Nome, curso e situação. |
| Partes concedentes | Nome ou CPF/CNPJ completo, UF, cidade e situação. A cidade pode ser pesquisada mesmo com todas as UFs selecionadas; os resultados mostram cidade e UF. |

Nos seletores pesquisáveis, as setas percorrem os resultados, Enter seleciona e Tab permite avançar pelos itens encontrados.

## Paginação das telas administrativas

Todas as listas paginadas abaixo usam o padrão comum de **15 registros por página**, centralizado em `PageSize::PER_PAGE`. Os índices mantêm o escopo de autorização da própria tela. Nas páginas de detalhe, cada lista possui paginação independente.

| Tela | Lista paginada | Itens por página | Escopo principal |
| --- | --- | ---: | --- |
| Campi — índice | Campi | 15 | Administrador do Sistema |
| Usuários — índice | Contas visíveis | 15 | Administrador do Sistema ou Setor de Estágio, no escopo do vínculo ativo |
| Cursos — índice | Cursos | 15 | Setor de Estágio, campus selecionado |
| Tipos de estágio — índice | Tipos de estágio | 15 | Setor de Estágio, campus do curso |
| Partes concedentes — índice | Partes concedentes | 15 | Setor de Estágio, campus selecionado |
| Auditoria — índice | Atividades autorizadas | 15 | Administrador do Sistema ou Setor de Estágio, segundo a Policy |
| E-mails — índice | Mensagens e entregas administrativas | 15 | Administrador do Sistema ou Setor de Estágio, segundo o registro afetado |
| Campus — detalhes | Histórico de atividades do campus | 15 | Administrador do Sistema |
| Meu campus — detalhes | Histórico de atividades do campus | 15 | Setor de Estágio, campus selecionado |
| Usuário — detalhes | Histórico da conta e vínculos | 15 | Administrador do Sistema ou Setor de Estágio, segundo o escopo autorizado |
| Usuário — detalhes | Vínculos da conta | 15 | Apenas vínculos que o perfil pode consultar |
| Curso — detalhes | Histórico do curso | 15 | Setor de Estágio, campus selecionado |
| Tipo de estágio — detalhes | Histórico do tipo | 15 | Setor de Estágio, campus do curso |
| Parte concedente — detalhes | Histórico da concedente e de seu endereço | 15 | Setor de Estágio, campus selecionado |
| E-mail — detalhes | Tentativas de entrega | 15 | Segundo a Policy da mensagem |

Esse padrão reúne **15 listas paginadas**, todas com 15 itens por página: sete índices, seis históricos em detalhes, a lista de vínculos na tela de usuário e as tentativas na tela de e-mail. A decisão vigente sobre testes e a política de validação estão em [Testes automatizados](doc:testes-existentes).

## Calendário global — implementado

Somente o Administrador do Sistema ativo selecionado cadastra, altera, exclui/restaura feriados e recorrências, mantém importações, revisa pendências e consulta a auditoria do calendário. Setor de Estágio ativo selecionado tem somente leitura de todos os feriados e recorrências, sem restrição automática por UF, município ou campus. Não há propriedade de calendário por campus. Os filtros são opcionais; a cidade de execução será considerada no futuro cálculo do estágio. Outros perfis não recebem acesso. Ver [Calendário de feriados](doc:calendario-de-feriados).

### Importação de usuários e vínculos

A rota `users/import` e o botão **Importar CSV** são exclusivos do vínculo ativo selecionado de Setor de Estágio. O campus é obtido no servidor e revalidado nas ações e transações; o CSV não pode selecionar outro campus ou conceder acesso de Administrador do Sistema. A importação aceita Setor de Estágios, Coordenador de Curso, Orientador, Discente, Supervisor e Direção de Ensino.

O arquivo tem uma linha por vínculo, com até **500 linhas não vazias**, agrupadas pelo CPF normalizado. Todos os seis cabeçalhos abaixo devem existir, mesmo quando o valor puder ficar vazio.

| Coluna | Preenchimento |
| --- | --- |
| `cpf` | Obrigatório; identifica globalmente a conta. Texto numérico, com máscara opcional. |
| `nome` | Obrigatório; deve ser igual nas linhas da mesma pessoa. |
| `email` | Obrigatório por vínculo. Para conta nova, o e-mail da primeira linha da pessoa também será o endereço de acesso. Pode variar nas demais linhas. |
| `tipo_vinculo` | Obrigatório; nome de um dos tipos permitidos acima. |
| `matricula` | Obrigatória exceto para Supervisor, que deve deixá-la vazia. Preserve zeros à esquerda. |
| `curso` | Nome exato de um único curso ativo do campus, obrigatório somente para Discente; vazio nos demais tipos. |

O modelo atual usa somente `email`; arquivos preparados com `email_login` e `email_vinculo` devem ser adaptados aos seis cabeçalhos atuais. A primeira linha é determinada pela ordem do CSV, independentemente da paginação ou dos filtros. Se ela contiver erro, o grupo inteiro fica bloqueado; o sistema não escolhe silenciosamente o e-mail de outra linha.

Exemplo com CPFs gerados aleatoriamente, incluindo dois vínculos para a mesma pessoa. Substitua o curso pelo nome exato de um curso ativo do campus:

```csv
cpf;nome;email;tipo_vinculo;matricula;curso
566.457.240-04;Ana Exemplo;ana@example.com;Orientador;000001;
566.457.240-04;Ana Exemplo;ana.coordenacao@example.com;Coordenador de Curso;000001;
353.310.950-03;Bruno Exemplo;bruno@example.com;Discente;000002;Nome exato de um curso ativo do campus
677.849.900-14;Carla Exemplo;carla@example.com;Supervisor;;
066.880.730-05;Daniel Exemplo;daniel@example.com;Setor de Estágios;000004;
953.619.760-08;Elisa Exemplo;elisa@example.com;Direção de Ensino;000005;
```

Não são aceitos senha, datas, situação ou campos profissionais opcionais de Supervisor. Para conta nova, a primeira linha do CPF na ordem do arquivo define o e-mail de acesso e do primeiro vínculo; os e-mails das outras linhas pertencem somente aos respectivos vínculos. CPF e nome devem ser iguais no grupo. Conta existente é reutilizada pelo CPF, preservando nome, login e senha; os e-mails informados serão apenas dos vínculos, e divergências de conta são avisadas na prévia. A unicidade do login é conferida somente no primeiro e-mail de cada conta nova; contatos de vínculos podem se repetir entre pessoas. A consulta exibe os dados da conta encontrada mesmo quando seus vínculos são de outro campus; links para detalhes continuam sujeitos à Policy, e nenhum vínculo externo é exibido. Identificadores que apontem para pessoas diferentes bloqueiam os grupos envolvidos. As regras normais de matrícula continuam valendo: titularidade global da pessoa e unicidade dos registros de Discente, inclusive desativados.

Um vínculo ativo equivalente é identificado por pessoa, tipo e campus. Se curso, matrícula e contato coincidirem, a linha é ignorada; divergências bloqueiam o grupo. Repetições idênticas no arquivo também são ignoradas. Histórico equivalente desativado exige autorização explícita para criar um novo vínculo, sem reativar ou alterar o anterior. A seleção em massa abrange todas as pessoas elegíveis em todas as páginas e filtros. Ela não autoriza conflitos de identificadores ou tipos proibidos.

A prévia tem filtros e **100 linhas por página**. A confirmação revalida os dados e informa contas novas, contas reutilizadas, vínculos novos e linhas ignoradas; mudanças relevantes exigem nova revisão. O processamento usa lotes sequenciais de até **25 pessoas**, com limite de cinco segundos entre pessoas e uma transação indivisível por pessoa. Uma falha bloqueia todos os vínculos daquela pessoa, permitindo continuar com grupos independentes. O lock transacional compartilhado com a gestão administrativa coordena escritas; as regras definitivas continuam sendo conferidas dentro da transação.

A conta nova recebe um único e-mail no endereço de login com os detalhes do primeiro vínculo e instruções para definir senha. Vínculos adicionais geram seus próprios avisos à conta e ao contato do vínculo, deduplicando endereços iguais. Todos usam `SendEmailDelivery` após o commit. Ignorar um vínculo coincidente não gera outro aviso. A conclusão da importação não confirma entrega; a tela oferece acesso aos registros de e-mail autorizados.

O contrato de UTF-8, BOM, separadores, tamanhos e metadados de correção é compartilhado com a [importação de concedentes](doc:migration-12-granting-parties). O CSV de erros inclui todas as linhas dos grupos bloqueados, mantendo dados originais, numeração e escape reversível de fórmulas. A prévia e o resultado ficam somente na tela; não há tabelas de acompanhamento, fingerprints ou histórico persistido de importação. Ao sair, um lote em andamento pode concluir. O reenvio confere contas e vínculos definitivos para evitar recriá-los; falhas de resposta ou de enfileiramento após o commit exigem conferir também os registros de e-mail. Não há garantia de execução única do transporte.

As instruções das duas telas são voltadas ao preenchimento em planilha, com texto maior, orientação de até 2 MB e sem detalhes de codificação. O parser mantém a tolerância técnica maior para o arquivo de correção, devido às colunas adicionais.

As duas importações usam `ImportCsv` para leitura, escrita e correção, `InteractsWithCsvImport` para upload, paginação e downloads, `csv-import.js` para lotes e componentes Blade comuns para campus, formulário, ações e revisão das linhas. Validadores, autorizações e transações permanecem próprios de cada domínio. A auditoria registra somente as mutações dos cadastros, sem evento extra de conclusão ou alteração artificial do campus.

### Importação de partes concedentes

A gestão direta inclui importação CSV pelo Setor de Estágio no campus selecionado, com prévia em memória, paginação de 100 linhas, confirmação individual ou em massa de duplicidades e processamento sequencial em lotes de até 25 linhas. Não há tabelas de importação nem retomada persistida depois de sair da tela. O cadastro aceita CNPJ numérico ou alfanumérico; erros de consulta são exibidos uma única vez no campo. O contrato de arquivo, recuperação por CSV de erros e exportação compatível do sistema anterior estão em [Partes concedentes](doc:migration-12-granting-parties).
