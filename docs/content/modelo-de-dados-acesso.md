---
id: modelo-de-dados-acesso
title: Modelo de dados — Acesso
description: Esquema lógico de conta, vínculos institucionais e escopo de acesso.
type: data-model
status: defined
visibility: public
tags: sge/modelagem, sge/autorizacao, sge/mermaid
related: pessoas-e-responsabilidades
source_refs:
diagram: modelo-acesso-erd
---
## Antes do diagrama

Em linguagem simples, uma pessoa possui uma conta para entrar no SGE e um ou mais vínculos que dizem em que papel ela está trabalhando. O sistema usa esse papel, o campus, o curso aplicável e a relação com o estágio para mostrar apenas as informações necessárias.

O esquema abaixo usa nomes técnicos de tabelas e colunas para atender também a quem desenvolve o sistema. A explicação dos papéis, sem esses termos, está em [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades).

## Tabelas de acesso

{{diagram:modelo-acesso-erd}}

A função e o escopo pertencem a `affiliations.type`, convertido para o enum `AffiliationType`. Gates e Policies aplicam as regras institucionais sobre esse contexto.

## Contexto ativo e autorização nativa

{{diagram:modelo-acesso-contexto}}

> [!info] Regra de contexto
> A pessoa autentica uma única conta e escolhe um vínculo ativo. O vínculo define tipo e campus; para discente, `course_id` acrescentado pela Migration 10 define o curso diretamente. Para coordenador, o escopo de curso vem das FKs `primary_coordinator_affiliation_id` e `secondary_coordinator_affiliation_id` dos cursos que o referenciam. Para atuar em outro contexto, deve existir outro registro em `affiliations` e ele precisa ser selecionado na sessão.

A caixa operacional usa `Affiliation::notifications()` após a Policy validar que o vínculo selecionado está ativo e pertence à conta autenticada. O par polimórfico mantém separadas as caixas de vínculos diferentes da mesma conta. `User` mantém `Notifiable`, mas recuperação de senha, convite inicial e aviso de novo vínculo são enviados por e-mail e não criam linhas na tabela `notifications`.

`email_messages` armazena conteúdo imutável de notificações operacionais e de mensagens administrativas, incluindo conta criada, novo vínculo, alteração de e-mail e alterações administrativas. `email_delivery_attempts` guarda o destinatário, a autoria solicitante, o contexto do registro afetado e o histórico do transporte. `requested_by_affiliation_id` identifica quem pediu o envio; `scope_context` preserva o registro relacionado para definir o escopo mesmo se ele for removido. São papéis distintos: o destinatário pode ser uma pessoa sem conta e não determina o escopo. A consulta atual está disponível somente ao Administrador do Sistema ativo e selecionado, para mensagens relacionadas a contas e vínculos administrativos. Recuperação de senha não cria registros nessas tabelas; registros antigos podem não ter conteúdo persistido.

> [!warning] Fonte única de autorização
> `AffiliationType`, vínculo ativo, escopo e estado do registro são os únicos insumos de autorização. Gates e Policies codificam essas regras institucionais de modo determinístico; não há regra de acesso editável em banco.

> [!note] Último vínculo usado
> `last_used_at` guarda apenas o último vínculo ativo selecionado ou escolhido numa troca explícita de contexto; não é auditoria de login. O contexto implementado restaura o último vínculo ainda ativo; quando nenhum vínculo tem uso anterior, pede escolha explícita. A seleção e a troca atualizam o campo, mas requisições comuns e restauração não. A validação ocorre em cada requisição funcional; detalhes e testes estão na [Fase 02](doc:fase-02-conta-e-contexto).

## Convenção de implementação

- um middleware resolve e valida o vínculo ativo da sessão, incluindo `deactivated_at`;
- Não há `Gate::before` global: Policies revalidam o vínculo ativo e selecionado e aplicam o escopo de cada recurso;
- Policies recebem o usuário e resolvem o vínculo ativo por serviço/contexto, verificando `AffiliationType`, campus, curso, posse do registro e estado do fluxo;
- Blade e Livewire usam a API padrão (`@can`, `$user->can()`, `$this->authorize()` e middleware `can:`), nunca comparações espalhadas de string;
- testes cobrem cada decisão da matriz com vínculo correto, tipo errado, campus errado, vínculo desativado e estado inválido.
