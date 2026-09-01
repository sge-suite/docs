---
title: SGE — Modelo de dados — Núcleo
description: Relações centrais entre cadastros, solicitações, estágios, documentos e avaliações.
type: mermaid-diagram
status: in-progress
tags:
  - sge/modelagem
  - sge/mermaid
aliases:
  - ERD do núcleo do SGE
---
> [!info] Nível deste diagrama
> Este é o modelo relacional conceitual publicado. Ele mostra responsabilidades e cardinalidades; os contratos de campos, índices e nulabilidade ficam em uma única fonte técnica, evitando duplicação no diagrama.

## Identidade, campus e cadastros

```mermaid
erDiagram
    USERS ||--|| USER_PERSONAL_DATA : possui
    USERS ||--o{ AFFILIATIONS : exerce
    ADDRESSES ||--o{ USER_PERSONAL_DATA : endereco_atual
    ADDRESSES ||--o{ CAMPUSES : endereco_atual
    ADDRESSES ||--o{ GRANTING_PARTIES : endereco_atual
    CAMPUSES ||--o{ AFFILIATIONS : delimita
    CAMPUSES ||--o{ COURSES : oferece
    COURSES o|--o{ AFFILIATIONS : vincula_discente
    COURSES ||--o{ INTERNSHIP_TYPES : configura
    AFFILIATIONS o|--o{ CAMPUSES : representa_legalmente
    AFFILIATIONS o|--o{ COURSES : coordena
```

| Entidade | Responsabilidade |
| --- | --- |
| `users` | identidade autenticada e credenciais |
| `user_personal_data` | CPF e dados pessoais atuais |
| `affiliations` | função institucional, campus, curso e e-mail contextual |
| `campuses` e `courses` | escopo acadêmico e administrativo |
| `internship_types` | regras de carga, notas e exceções aplicáveis ao curso |
| `granting_parties` | cadastro atual da concedente |

Uma pessoa possui uma conta e quantos vínculos forem necessários. O vínculo ativo, e não a conta isolada, define o contexto usado por Gates e Policies.

## Da solicitação ao estágio

```mermaid
erDiagram
    AFFILIATIONS ||--o{ INTERNSHIP_REQUESTS : solicita_como_discente
    COURSES ||--o{ INTERNSHIP_REQUESTS : enquadra
    INTERNSHIP_TYPES ||--o{ INTERNSHIP_REQUESTS : aplica_regras
    GRANTING_PARTIES o|--o{ INTERNSHIP_REQUESTS : seleciona
    INTERNSHIP_REQUESTS ||--o{ INTERNSHIP_REQUEST_CORRECTIONS : recebe
    INTERNSHIP_REQUESTS ||--o{ EMANCIPATION_EVIDENCES : comprova
    INTERNSHIP_REQUESTS ||--o| INTERNSHIPS : origina

    USERS ||--o{ INTERNSHIPS : discente
    AFFILIATIONS ||--o{ INTERNSHIPS : orienta_ou_supervisiona
    COURSES ||--o{ INTERNSHIPS : pertence
    INTERNSHIP_TYPES ||--o{ INTERNSHIPS : congela_regras
    GRANTING_PARTIES ||--o{ INTERNSHIPS : concede
```

- Existe uma solicitação por processo iniciado pelo discente; devoluções editam o mesmo registro.
- Evidências de emancipação são registros privados, analisados manualmente pelo Setor.
- O estágio nasce apenas após o aceite da solicitação e preserva FKs e snapshots dos dados aprovados.
- Correções posteriores atualizam somente os campos autorizados e não apagam documentos ou estados anteriores.

## Execução, formalização e conclusão

```mermaid
erDiagram
    INTERNSHIPS ||--o{ INTERNSHIP_WORK_SCHEDULES : possui_jornadas
    INTERNSHIPS ||--o{ INTERNSHIP_PAUSES : possui_pausas
    CAMPUSES ||--o{ NON_WORKING_DATES : define_calendario
    INTERNSHIPS ||--o{ INTERNSHIP_CANCELLATION_REQUESTS : recebe_pedidos

    DOCUMENT_TEMPLATES ||--o{ TEMPLATE_VERSIONS : versiona
    TEMPLATE_VERSIONS ||--o{ GENERATED_DOCUMENTS : gera
    INTERNSHIPS ||--o{ GENERATED_DOCUMENTS : formaliza

    INTERNSHIPS ||--o{ SUPERVISOR_EVALUATIONS : possui_formularios
    AFFILIATIONS ||--o{ SUPERVISOR_EVALUATIONS : responde_ou_analisa
```

| Conjunto | Regra central |
| --- | --- |
| jornadas, pausas e calendário | determinam a previsão reproduzível de término |
| templates e versões | preservam o modelo usado em cada geração |
| documentos | mantêm origem, versão, estado e snapshot; o arquivo final é temporário |
| avaliação do supervisor | reutiliza o mesmo formulário em `Draft` ou `Returned` |
| notas | supervisor é calculada; relatório e apresentação são lançadas pelo orientador |
| cancelamento | exige pedido e decisão do Setor, preservando o histórico |

## Regras de integridade

- Dados atuais relacionam-se por FK; valores usados em um processo histórico são congelados em snapshots.
- A jornada é pactuada na abertura; outra vigência só pode nascer de aditivo com assinaturas conferidas e não reescreve dias já cumpridos.
- Templates usados não são alterados; uma mudança cria nova versão.
- `Submitted` e `Approved` bloqueiam a avaliação; `Returned` reabre o mesmo registro.
- O Activity Log registra alterações relevantes, mas não substitui tabelas de domínio.

## Leituras relacionadas

- [[SGE - Modelo de dados - Acesso|Conta, vínculos e autorização]].
- [[SGE - Modelo de dados - Histórico|Snapshots, logs e mensagens]].
- [[SGE - Ciclos de status|Estados e transições]].
- [[SGE - Modelagem de dados.canvas|Mapa visual do modelo]].
