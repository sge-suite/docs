---
id: modelagem-de-dados
title: Modelagem de dados
description: Modelo lógico relacional do sistema, com tabelas, colunas, chaves estrangeiras e relações direcionadas.
type: data-model
status: defined
visibility: public
tags: sge/modelagem, sge/schema, sge/banco-de-dados
related: dominio-e-modelo-de-dados, modelo-de-dados-nucleo, modelo-de-dados-acesso, modelo-de-dados-historico, ciclos-de-status, migrations
source_refs: content/modelo-de-dados-nucleo.md, content/modelo-de-dados-acesso.md, content/modelo-de-dados-historico.md
diagram: modelo-dados-schema
---
Esta é a referência visual do modelo lógico relacional. Cada caixa representa uma tabela e cada linha representa uma coluna com seu tipo. `PK` identifica a chave primária, `FK` a chave estrangeira e `UK` a unicidade. As setas acompanham a relação entre as tabelas; a coluna marcada como `FK` identifica o vínculo sem repetir texto sobre a linha.

{{diagram:modelo-dados-schema}}

> [!info] Nível de detalhe
> Os diagramas mostram a estrutura e as colunas que orientam as relações. O contrato completo de cada tabela — tipos, nulabilidade, índices, unicidade, exclusão e regras condicionais — está nas notas de [Migrations](doc:migrations), que são a fonte de verdade para implementação.

## Identidade e cadastros

Contas, dados pessoais, cidades, endereços e vínculos formam o contexto institucional. Campus, curso e tipo de estágio são cadastros que restringem o escopo do processo.

{{diagram:modelo-nucleo-identidade}}

Detalhes dos contratos: [cities](doc:migration-01a-cities), [addresses](doc:migration-01-addresses), [user_personal_data](doc:migration-02-user-personal-data), [campuses](doc:migration-03-campuses), [affiliations](doc:migration-04-affiliations), [courses](doc:migration-09-courses) e [internship_types](doc:migration-11-internship-types).

## Contexto de acesso

O mesmo conjunto de tabelas aparece isolado abaixo para deixar explícito o recorte usado por Gates e Policies: uma conta pode possuir vários vínculos, e cada vínculo carrega tipo, campus e curso.

{{diagram:modelo-acesso-erd}}

Leia também [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades) e [Matriz de autorização](doc:matriz-de-autorizacao).

## Solicitação e formalização

Uma solicitação é criada por um vínculo discente, recebe dados de curso, tipo e concedente, e pode acumular correções e evidências privadas antes da formalização.

{{diagram:modelo-nucleo-solicitacao}}

As relações que completam a formalização ficam neste recorte: [correções e evidências](../diagrams/modelo-solicitacao-apoio.html).

{{diagram:modelo-solicitacao-apoio}}

Detalhes dos contratos: [granting_parties](doc:migration-12-granting-parties), [supervisor_registration_requests](doc:migration-12a-supervisor-registration-requests), [granting_party_registration_requests](doc:migration-12b-granting-party-registration-requests), [internship_requests](doc:migration-19-internship-requests), [emancipation_evidences](doc:migration-19a-emancipation-evidences) e [internship_request_corrections](doc:migration-20-internship-request-corrections).

## Execução do estágio

Depois do aceite, o estágio concentra as vigências de jornada, pausas, o cálculo baseado no calendário nacional, estadual e municipal aplicável à cidade/UF do endereço histórico do local de trabalho, pedidos de cancelamento e avaliação do supervisor.

{{diagram:modelo-nucleo-execucao}}

Detalhes dos contratos: [internships](doc:migration-15-internships), [internship_pauses](doc:migration-17-internship-pauses), [avaliações](doc:migration-18-avaliacoes), [internship_cancellation_requests](doc:migration-21-internship-cancellation-requests), [holidays](doc:migration-22-holidays), [internship_calendar_overrides](doc:migration-22-internship-calendar-overrides) e [internship_work_schedules](doc:migration-23-internship-work-schedules).

## Documentos e versões

Templates são catálogos; versões são imutáveis depois da ativação; documentos gerados preservam a versão e o snapshot usado no processo.

{{diagram:modelo-documentos-schema}}

| Tabela | Papel | Contrato |
| --- | --- | --- |
| `document_templates` | catálogo de modelos por campus ou globais | [Migration 13](doc:migration-13-document-templates) |
| `template_versions` | versões, variáveis e validação do arquivo | [Migration 14](doc:migration-14-template-versions) |
| `generated_documents` | documento gerado ou registrado no estágio | [Migration 16](doc:migration-16-generated-documents) |

## Histórico e comunicação

O histórico operacional separa auditoria, notificação, mensagem e tentativa de transporte. Um registro não substitui o outro. `activity_log` não recebe uma seta porque registra `subject` e `causer` de forma polimórfica: seu alvo depende do tipo gravado em cada linha.

{{diagram:modelo-historico}}

Detalhes dos contratos: [activity_log](doc:migration-base-04-activity-log), [notifications](doc:migration-05-notifications), [email_messages](doc:migration-06-email-messages) e [email_delivery_attempts](doc:migration-07-email-delivery-attempts).

## Regras do modelo

- FKs apontam para cadastros atuais; snapshots e cópias históricas de endereço preservam os valores usados em um processo já iniciado.
- A solicitação origina no máximo um estágio, mas correções e evidências podem ser várias.
- `internships` é o agregado operacional: jornadas, pausas, documentos, avaliações e cancelamentos dependem dele.
- Templates podem ter muitas versões, mas um documento gerado referencia apenas a versão usada na geração.
- Notificações podem originar mensagens; cada mensagem pode ter várias tentativas de entrega.
- A autorização nasce do vínculo ativo, não de uma permissão gravada em tabela.

Para estados e transições, consulte [Ciclos de status](doc:ciclos-de-status). Para o contrato textual consolidado, consulte [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados).
