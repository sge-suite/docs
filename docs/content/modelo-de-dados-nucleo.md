---
id: modelo-de-dados-nucleo
title: Modelo de dados — Núcleo
description: Relações centrais entre cadastros, solicitações, estágios, documentos e avaliações.
type: data-model
status: in-progress
visibility: public
tags: sge/modelagem, sge/mermaid
related: modelo-de-dados-acesso, modelo-de-dados-historico, ciclos-de-status
source_refs:
diagram: modelo-nucleo-identidade
---
> [!info] Nível deste diagrama
> Este é um recorte do modelo lógico relacional publicado. Ele mostra tabelas, colunas-chave e relações; o contrato completo de campos, índices e nulabilidade fica em uma única fonte técnica, evitando duplicação no diagrama.

## Identidade, cidades, endereços e cadastros

{{diagram:modelo-nucleo-identidade}}

| Entidade | Responsabilidade |
| --- | --- |
| `users` | identidade autenticada e credenciais |
| `user_personal_data` | Dados complementares atuais do discente; CPF permanece em `users` |
| `cities` | catálogo local de municípios por código IBGE e UF |
| `addresses` | endereços atuais e cópias históricas usadas por estágios |
| `affiliations` | função institucional, campus e e-mail contextual; a Migration 10 adicionará `course_id` aos vínculos de discente |
| `campuses` e `courses` | escopo acadêmico e administrativo |
| `internship_types` | regras de carga, notas e exceções aplicáveis ao curso |
| `granting_parties` | cadastro atual da concedente |

Uma pessoa possui uma conta e quantos vínculos forem necessários. O vínculo ativo, e não a conta isolada, define o contexto usado por Gates e Policies.

## Da solicitação ao estágio

{{diagram:modelo-nucleo-solicitacao}}

- Existe uma solicitação por processo iniciado pelo discente; devoluções editam o mesmo registro.
- Evidências de emancipação são registros privados, analisados manualmente pelo Setor.
- O estágio nasce apenas após o aceite da solicitação e preserva FKs e snapshots dos dados aprovados.
- Correções posteriores atualizam somente os campos autorizados e não apagam documentos ou estados anteriores.

## Execução, formalização e conclusão

{{diagram:modelo-nucleo-execucao}}

| Conjunto | Regra central |
| --- | --- |
| jornadas, pausas, calendário e exceções | determinam a previsão reproduzível de término |
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

- [Conta, vínculos e autorização](doc:modelo-de-dados-acesso).
- [Snapshots, logs e mensagens](doc:modelo-de-dados-historico).
- [Estados e transições](doc:ciclos-de-status).
- [Modelagem de dados](doc:modelagem-de-dados).
