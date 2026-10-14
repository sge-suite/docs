---
id: calendario-de-feriados
title: Calendário de feriados
description: Importação anual automática do Brasil inteiro e manutenção manual de feriados e recorrências municipais.
type: technical-reference
status: implemented
visibility: public
tags: sge/calendario, sge/administracao, sge/calculos
related: migration-22-holidays, enum-holidayscope, schedules, fase-05-administracao, matriz-de-autorizacao, testes-existentes, service-internshipenddatecalculator
source_refs: https://github.com/sge-suite/sge/blob/master/app/Console/Commands/ImportHolidays.php, https://github.com/sge-suite/sge/blob/master/app/Actions/ImportHolidayTerritory.php, https://github.com/sge-suite/sge/blob/master/app/Actions/GenerateMunicipalHolidays.php, https://github.com/sge-suite/sge/blob/master/app/Support/HolidayCalendar.php
---
## Calendário local

O SGE usa ocorrências persistidas. Todos os eventos aceitos, inclusive pontos facultativos, são tratados operacionalmente como feriados. Eventos na mesma data mantêm seus nomes e fontes, mas bloqueiam a data apenas uma vez. Recessos e suspensões de um estágio continuam em pausas; exceções individuais permanecem em `InternshipCalendarOverride`. A calculadora e o fluxo de exceções não foram implementados nesta entrega.

## Calendário único

Feriados e recorrências não pertencem a campi. O calendário é único para o SGE, com escopo nacional, estadual ou municipal conforme o território do evento. Somente o Administrador do Sistema ativo e selecionado cadastra, altera, exclui/restaura ocorrências e recorrências e revisa pendências. Importações extraordinárias são executadas pelo comando administrativo.

O Setor de Estágio ativo e selecionado consulta todos os feriados e recorrências, inclusive de outras UFs ou municípios. Ano, escopo, UF e cidade são filtros opcionais e não uma restrição territorial imposta pelo campus. A localidade de execução do estágio será considerada somente na seleção dos feriados para o futuro cálculo.

A separação por `campus_id` e a publicação de cadastros locais foram removidas das migrations originais. O responsável pelo ambiente fará `migrate:fresh`; a aplicação não converte nem elimina registros dos bancos antigos automaticamente.

## Importação automática

`HolidaySeeder`, chamado após o catálogo de cidades no `DatabaseSeeder`, executa `holidays:prepare` para preparar os três anos no momento do seed. Uma falha da API é registrada e sinalizada, sem descartar consultas concluídas; a rotina diária recupera os territórios pendentes. Seeds posteriores reutilizam os períodos concluídos.

Durante o `HolidaySeeder`, somente a sincronização individual do Scout é pausada. Ao terminar o preparo, as ocorrências persistidas, inclusive as da lixeira, são reenviadas ao índice em lotes do tamanho configurado em `scout.chunk.searchable` (500 por padrão). Falhas de consulta sinalizadas pelo comando não impedem a indexação dos registros já persistidos. Validações, transações e auditoria continuam ativas. Alterações normais fora do seed mantêm a indexação automática após commit.

`holidays:prepare` prepara o ano atual e os dois seguintes, às 03h no fuso de `app.timezone`. O scheduler usa `onOneServer` e `withoutOverlapping`, com cache compartilhado. O servidor precisa executar `schedule:run`; o registro do schedule não instala cron.

`holidays:import {year}` consulta nacionais e as 27 UFs, sequencialmente. `--uf=RS` limita a consulta à UF e aproveita somente estaduais; `--refresh` força nova consulta. Consultas concluídas não são repetidas automaticamente. A virada anual acrescenta somente o novo terceiro ano normalmente; falhas anteriores são recuperadas por território. Municipais são gerados também para anos solicitados fora desse horizonte.

Não existe página dedicada de atualização automática nem endpoint para enfileirar importações. Pendências reais da fonte aparecem no calendário para o Administrador, com acesso à revisão. Situação técnica e falhas permanecem persistidas e consultáveis pelos comandos e auditoria. A manutenção extraordinária usa os comandos administrativos. Seed, schedule e comando processam as consultas sequencialmente, com locks contra concorrência. Não há e-mail automático. Falhas ficam nas importações e são recuperadas pela rotina diária.

## Contrato BrasilAPI

Endpoint: `GET https://brasilapi.com.br/api/feriados/v1/{ano}`, com `uf` opcional. Faixa 1900–2199. A resposta deve ser lista JSON preenchida com `date`, `name` e `type`; data deve existir e pertencer ao ano solicitado. `state`, quando presente, deve corresponder à UF consultada. Campos adicionais ficam no payload.

`optional`, quando presente, deve ser booleano e não exclui o evento. Ausência não comprova obrigatoriedade. Tipos nacionais/estaduais são territorialmente mapeados; `facultative` e `optional` são aceitos quando o escopo pode ser identificado. Tipos ou escopos não reconhecidos ficam pendentes, sem alterar o calendário. Nenhum cálculo de Páscoa existe no SGE.

A fonte não fornece calendário municipal, identidade estável, ato legal ou garantia de cobertura estadual completa. Dados importados podem ser complementados manualmente. Faixa de anos da API não comprova vigência jurídica histórica. HTTP 400/404 não são repetidos; conexão, 429 e 5xx têm tentativas limitadas. Resposta inválida não aplica parcialmente aquela consulta. Falha de uma UF não desfaz as demais.

Fontes consultadas: [documentação oficial](https://brasilapi.com.br/docs), [schema](https://github.com/BrasilAPI/BrasilAPI/blob/main/pages/docs/doc/holydays.json) e [implementação](https://github.com/BrasilAPI/BrasilAPI/blob/main/services/holidays/index.js). O schema não define `optional`; o adaptador trata esse campo defensivamente.

## Reimportação e pendências

A correspondência mantém a identidade técnica original do item; repetir a importação não duplica, sobrescreve correção nem restaura exclusão. Um item idêntico pode ser associado a cadastro manual sem mudar sua origem. Possíveis renomeações ou mudanças de data ficam para revisão, sem atualização automática. Ausência na fonte é sinalizada e não exclui feriados.

O Administrador pode associar uma pendência a ocorrência existente, cadastrar uma ocorrência ou ignorar o item, sempre com justificativa. A associação não altera nem restaura a ocorrência. Importação e cadastro compartilham lock transacional e constraints de unicidade.

## Recorrência municipal

Cadastro fixa nome, cidade, mês/dia e vigência anual opcional. Datas excepcionais ou móveis são cadastradas avulsas. 29 de fevereiro só gera em anos bissextos. A geração é idempotente por recorrência/ano e preserva ocorrências excluídas.

Edição atualiza anos seguintes ao atual que não tenham ajustes manuais; ano atual e anteriores são corrigidos nas ocorrências. Encerramento impede novas gerações e exclui logicamente ocorrências futuras fora da vigência, preservando correções. Estender a vigência não restaura ocorrências excluídas: restauração é administrativa explícita. Colisões com outro feriado ativo impedem a alteração, sem duplicar registros.

Recorrências também possuem exclusão lógica e restauração explícita. Excluir a definição interrompe novas gerações, sem apagar as ocorrências já persistidas. Restaurar retoma a geração na vigência, preservando ocorrências excluídas e correções manuais. Exclusão física é proibida e a unicidade reserva a identidade da regra mesmo na lixeira.

## Competências

Administrador do Sistema mantém toda a base e consulta sua auditoria. Setor de Estágio tem somente leitura do calendário e das recorrências, sem gravar por rotas, componentes Livewire ou Actions. Vínculos desativados não concedem acesso; campus inativo conserva leitura do Setor. Outros perfis não recebem acesso.

Lixeiras são individuais por tipo de cadastro, sem separação por campus. Seus links aparecem quando existem excluídos. Apenas o Administrador restaura ou altera registros. Confirmações revalidam autorização antes de exibir o alvo e as gravações revalidam dentro da transação. A revisão de pendências usa a Policy do item importado, nas rotas, Livewire, requisição e Action. Auditoria de manutenção do calendário é central, pelo Administrador.

## Integração futura

`HolidayCalendar::occurrences(city, startsOn, endsOn)` seleciona os escopos nacional, estadual e municipal aplicáveis à cidade do local de execução, sem argumento de campus. `blockedDates` deduplica datas. A listagem administrativa e a consulta do Setor não impõem essa seleção territorial. Não há chamadas externas durante consulta nem recálculo automático de estágios. A integração do cálculo e o retrato histórico de suas entradas permanecem pendentes.

## Validação

Os arquivos de testes foram removidos por decisão do projeto. Não criar nem executar testes nesta tarefa. A validação de código usa formatação e compilação, sem aplicar migrations nem recriar o banco por iniciativa do agente.

## Padrões de interação

Formulários seguem o cabeçalho das telas administrativas: Cancelar e ação principal no topo, breadcrumbs e bloqueio de envio duplicado. Sucessos usam toast Flux. Exclusão e restauração de feriados e recorrências usam confirmação em modal Flux, com contexto do cadastro e efeitos da ação. Abrir e reidratar uma confirmação revalida a autorização do vínculo selecionado; a gravação permanece nas requisições e Actions autorizadas. A revisão da fonte oferece busca de ocorrências por nome, exibindo a data, incluindo sugestões e cadastros na lixeira sem restaurá-los implicitamente.

Listagens e lixeiras têm busca por nome pelo Scout/Meilisearch. O índice mantém excluídos, com filtros de soft delete. As origens oferecidas são Manual, BrasilAPI e Recorrência municipal; bancos antigos não são convertidos para uma origem de legado. A indexação após commit usa fila e exige worker ativo, independentemente da importação da BrasilAPI.
