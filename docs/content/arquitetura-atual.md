---
id: arquitetura-atual
title: Arquitetura atual
description: Fotografia da arquitetura, dependências e infraestrutura atualmente presentes na aplicação.
type: architecture
status: observed
visibility: public
tags: sge/arquitetura, sge/implementacao
related: visao-geral, pessoas-e-responsabilidades, fluxos-principais, dominio-e-modelo-de-dados
source_refs: https://github.com/sge-suite/sge/blob/master/composer.json, https://github.com/sge-suite/sge/blob/master/compose.yaml, https://github.com/sge-suite/sge/blob/master/app/Providers/AppServiceProvider.php, https://github.com/sge-suite/sge/blob/master/app/Providers/FortifyServiceProvider.php, https://github.com/sge-suite/sge/blob/master/app/Models/User.php, https://github.com/sge-suite/sge/blob/master/config/scout.php, https://github.com/sge-suite/sge/blob/master/app/Models/GrantingParty.php, https://github.com/sge-suite/sge/blob/master/app/Models/Internship.php, https://github.com/sge-suite/sge/blob/master/app/Models/InternshipRequest.php, https://github.com/sge-suite/sge/blob/master/app/Support/UserManagementScope.php
diagram: arquitetura-atual-diagrama
updated: 2026-10-28
---
## Leitura em linguagem simples

Esta página mostra como o SGE é montado por dentro. Quem usa o sistema não precisa conhecer estas tecnologias para solicitar, acompanhar ou avaliar um estágio. Em termos simples: há uma tela para as pessoas, regras que conferem cada ação, um banco que guarda as informações e serviços que executam tarefas como calcular datas ou preparar documentos.

Use esta página para saber o que já existe e quais lacunas técnicas continuam abertas. Para entender o processo sem detalhes técnicos, comece por [Visão geral](doc:visao-geral), [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) e [Fluxos principais](doc:fluxos-principais).

## Stack

A implementação atual utiliza:

- Laravel 13.
- PHP `^8.3` (o ambiente de desenvolvimento atual usa PHP 8.5).
- Livewire 4 e Flux UI.
- Tailwind CSS e Vite.
- PostgreSQL.
- Laravel Fortify.
- Spatie Activitylog.
- Spatie Medialibrary.
- Laravel Scout e Meilisearch.

## Dependências do domínio

- `phpoffice/phpword` está declarado em `composer.json` e dá suporte à geração DOCX;
- o helper de valores por extenso importa Brick Math, mas o pacote não está declarado diretamente no `composer.json`.

## Busca de registros

As buscas textuais nas listagens de usuários, campi, cursos, tipos de estágio, concedentes, templates, solicitações, estágios e feriados usam Laravel Scout com Meilisearch. Os seletores de cidade, concedente e supervisor e a busca de candidatos na revisão de feriados importados também usam esses índices. Não há alternativa SQL com `LIKE`/`ILIKE` para essas buscas.

Os selects de campus e curso no cadastro de contas/vínculos, coordenadores no curso, curso no tipo de estágio e nos filtros, orientador na solicitação e nos filtros, e tipo, orientador, supervisor e concedente na edição/análise do estágio usam o mesmo `x-select`, com `searchSource` e o trait `SearchesSelectOptions`. Cada fonte permitida no servidor retorna um `SelectOptionSource`: consulta Eloquent de elegibilidade, filtros do índice, rótulo e ordenação. O navegador informa somente a fonte e o termo; classes de Models, campus, filtros e exceções históricas são definidos pelo servidor.

O HTML inicial contém as opções especiais e o rótulo da seleção atual, recuperada por ID na consulta elegível; não contém o catálogo. Ao abrir o seletor sem termo, uma consulta Eloquent limitada oferece até 20 opções iniciais. Ao pesquisar, o Meilisearch devolve IDs em lotes de 21, com os filtros expressáveis aplicados antes do limite. Cada lote é hidratado exclusivamente pela consulta elegível e remontado na ordem do motor. Se existirem filtros relacionais não representados no índice — como os cursos e orientadores associados a estágios visíveis ao vínculo ativo — ou registros desatualizados, o servidor percorre outros lotes até reunir 21 elegíveis ou esgotar os resultados disponíveis no motor. Isso evita uma página ocupada por opções inelegíveis sem materializar o catálogo nem uma lista completa de IDs. O custo da pesquisa pode variar com a quantidade de lotes percorridos; a redução é estrutural no carregamento inicial, na memória e no HTML, sem benchmark de latência.

A resposta contém até 20 pares `value`/`label`, `hasMore` e, em caso de falha, `unavailable`. Se o motor esgotar sua janela de paginação antes de reunir 21 elegíveis, retorna também `incomplete`: a interface pede um termo mais específico e não afirma que nenhuma opção existe. Quando a revalidação remove resultados e a página fica incompleta, a fonte consulta `settings/pagination` para verificar o limite real do índice; se esse metadado não puder ser lido, preserva os resultados obtidos e sinaliza a incerteza, sem exigir novas permissões. Alpine cria somente os botões retornados, com rótulos inseridos como texto; a seleção e seu rótulo permanecem independentes da página. Opções como “Todos os cursos” e “Sem coordenador” continuam locais. Não há carregamento automático das páginas seguintes. A consulta renderless não grava nem refaz o formulário inteiro; mantém os modos de binding, o envio nativo, required, teclado, foco, espera de 350 ms, indicação de carregamento, orientação para refinar e nova tentativa; respostas antigas são ignoradas. Não há cache persistente de dados pessoais no navegador.

Detalhes, existência de cadastros e validações de elegibilidade não dependem da página apresentada: usam consultas pontuais e `exists()`. A análise da solicitação consulta o orientador e a concedente escolhidos diretamente; a edição do estágio recupera somente o tipo, a concedente e o supervisor selecionados, além das qualificações desse supervisor. As associações desativadas anteriormente permitidas continuam restritas aos IDs persistidos do registro autorizado. As validações finais nas Actions, Models e Form Requests permanecem. Os índices e seus atributos não mudaram nesta migração; não há reindexação adicional exigida por ela.

Na revisão de feriados importados, sem pelo menos dois caracteres são mostradas até 20 sugestões, ordenadas por data e ID decrescentes, mais a seleção atual. Com termo válido, até 20 resultados do Meilisearch substituem as sugestões e conservam a ordem do motor na hidratação. A seleção é recuperada separadamente, identificada por “Seleção atual” e deduplicada por ID; feriados na lixeira continuam identificados. Se a busca falhar, o tratamento existente mantém sugestões e seleção, com aviso e nova tentativa, sem apresentar a falha como ausência de feriados.

O índice `affiliations` dá suporte aos seletores de coordenadores, orientadores e supervisores pelo nome, e-mail e matrícula de cada vínculo. Alterações do vínculo e do nome da conta atualizam esse índice após o commit; o simples uso do vínculo não exige reindexação. A escolha do vínculo para acessar o sistema continua local. Matrículas sugeridas da própria conta, motivos anteriores já limitados ao campus, UF, perfis e o catálogo estático de variáveis DOCX também permanecem locais. Os motivos não são copiados para um índice de texto livre.

Os atributos pesquisáveis, filtráveis e de ordenação ficam em `config/scout.php`. Campus, atividade, papel e os demais filtros expressáveis no índice são aplicados no motor antes da paginação; a elegibilidade relacional dos seletores é revalidada em lotes no banco, conforme descrito acima. A consulta que carrega os registros mantém os escopos e permissões do banco, inclusive se o índice ainda estiver aguardando atualização. O índice de usuários combina campus, papel e situação do mesmo vínculo em `affiliation_scopes`, impedindo que vínculos diferentes satisfaçam partes de um filtro. Alterações relevantes de vínculos atualizam esse índice após o commit.

Solicitações e estágios indexam somente nome e matrícula dos snapshots, número do registro e os atributos necessários para filtros. O estágio também indexa protocolos documentais, pesquisáveis apenas pelo Setor de Estágio. As demais pessoas pesquisam somente nome, matrícula e número. Mudanças de protocolo e de situação de cancelamento atualizam o índice do estágio após o commit. Observações, avaliações e notas não fazem parte dos documentos de busca. Os índices de usuários e concedentes incluem os documentos de identificação usados nas buscas dessas telas. O índice de concedentes também mantém o rótulo já exibido na análise do Setor (nome, documento, cidade/UF, rua, número e unidade), preservando a pesquisa por cidade ou endereço nesse seletor. A busca principal do discente e a listagem de concedentes pesquisam apenas nome e documento.

Ao disponibilizar os índices em um ambiente, execute pelo Sail `artisan scout:sync-index-settings --no-interaction` e `artisan scout:import 'App\Models\NomeDoModelo' --no-interaction` para cada modelo já existente no banco. Os índices usados são `affiliations`, `users`, `campuses`, `cities`, `courses`, `internship_types`, `granting_parties`, `document_templates`, `internship_requests`, `internships`, `holidays` e `holiday_recurrences` (com o prefixo de Scout, quando configurado). A sincronização posterior segue a fila configurada em Scout, com despacho após o commit; o worker deve estar ativo. A normalização de acentos fica a cargo do Meilisearch, sem duplicar nomes em atributos auxiliares. Documentos, matrículas e protocolos não recebem tolerância a erros de digitação.

## Organização do código

{{diagram:arquitetura-atual-diagrama}}

## Componentes observados

| Área                    | Situação    | Evidência                                                                            |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------ |
| Autenticação            | ✅          | Fortify, páginas Livewire e rotas protegidas                                         |
| Usuários                | Parcial     | Administração de contas e vínculos por Administrador do Sistema e Setor de Estágio, importação CSV e perfil pessoal de Discente/Supervisor implementados; outros campos e processos permanecem separados por vínculo. |
| Autorização             | Parcial     | Policies por recurso cobrem administração, cursos, documentos, cadastros, solicitações, estágio, avaliação, feriados e auditoria, sempre conforme vínculo ativo e escopo aplicável; validação automatizada permanece pendente. |
| Auditoria               | ✅          | Spatie Activitylog, autoria pelo vínculo ativo e campos pessoais/profissionais auditados                  |
| Infraestrutura de mídia | Parcial     | Spatie Medialibrary armazena versões privadas de templates e comprovantes; geração DOCX/PDF usa snapshots e arquivos temporários privados. Documentos externos podem ser registrados sem upload do arquivo, com disponibilização e conferência de assinaturas pelo fluxo de documentos. |
| Estágios                | Parcial     | Abertura, correções, formalização, assinaturas, liberação, pausas, sincronização de execução, cancelamento, avaliação, notas e conclusão têm Actions, Policies e interfaces. Aditivos assinados aplicam vigências formais de jornada; novos cálculos salvos mantêm bases históricas reproduzíveis. Avisos temporais adicionais permanecem pendentes. |
| Administração            | Parcial     | Gestão global e por campus de campi, cursos, tipos de estágio, concedentes, contas/vínculos, calendário, documentos e consultas administrativas implementadas. |
| Relatórios              | Planejado   | Devem consumir o domínio e respeitar o escopo do vínculo ativo                       |

## Regras de arquitetura

> [!warning] Limite desta nota
> A arquitetura descrita aqui é a base da aplicação. Para o domínio e os fluxos, consulte [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados) e [Fluxos principais](doc:fluxos-principais).

- Regras de negócio importantes devem ficar em Services, Actions ou objetos de domínio, evitando controllers grandes.
- Autorização deve ser centralizada em Gates e Policies.
- A autorização é derivada do vínculo ativo, `AffiliationType`, campus/curso e estado do registro; a decisão fica no código. A cobertura automatizada será retomada na preparação para produção.
- Alterações persistentes devem ser feitas por migrations.
- Integrações externas devem ser encapsuladas em Services/Support; a validação automatizada isolada fica para a preparação para produção.
- Cálculos determinísticos ficam em Services puros; autorização, transação e efeitos colaterais ficam em Actions/Policies.
- Decisões que alterem o domínio devem manter os modelos e fluxos correspondentes sincronizados.
