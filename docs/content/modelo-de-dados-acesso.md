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

A caixa operacional usa `Affiliation::notifications()` após a Policy validar que o vínculo selecionado está ativo e pertence à conta autenticada. O par polimórfico de cada notificação mantém separadas as caixas de vínculos diferentes da mesma conta. Notificações de recuperação de senha e de e-mail inicial continuam na relação nativa de `User`.

`email_messages` armazena somente o conteúdo imutável de notificações operacionais, ligado a `notification_id`, sem cast criptografado. `email_delivery_attempts` guarda o destinatário e o histórico do transporte; `requested_by_affiliation_id` identifica o vínculo que pediu o envio, e a conta pode ser obtida por `affiliations.user_id`. Envio automático usa vínculo nulo. O convite inicial cria apenas uma tentativa, com `email_message_id` nulo; recuperação de senha não cria registros nessas tabelas. A futura consulta administrativa deverá respeitar o escopo de cada vínculo.

> [!warning] Fonte única de autorização
> `AffiliationType`, vínculo ativo, escopo e estado do registro são os únicos insumos de autorização. Gates e Policies codificam essas regras institucionais de modo determinístico; não há regra de acesso editável em banco.

> [!note] Último vínculo usado
> `last_used_at` guarda apenas o último vínculo ativo selecionado ou escolhido numa troca explícita de contexto; não é auditoria de login. O contexto implementado restaura o último vínculo ainda ativo; quando nenhum vínculo tem uso anterior, pede escolha explícita. A seleção e a troca atualizam o campo, mas requisições comuns e restauração não. A validação ocorre em cada requisição funcional; detalhes e testes estão na [Fase 02](doc:fase-02-conta-e-contexto).

## Convenção de implementação

- um middleware resolve e valida o vínculo ativo da sessão, incluindo `deactivated_at`;
- `Gate::before` concede somente o acesso global explicitamente definido para `SystemAdministrator`, sem ignorar o vínculo ativo;
- Policies recebem o usuário e resolvem o vínculo ativo por serviço/contexto, verificando `AffiliationType`, campus, curso, posse do registro e estado do fluxo;
- Blade e Livewire usam a API padrão (`@can`, `$user->can()`, `$this->authorize()` e middleware `can:`), nunca comparações espalhadas de string;
- testes cobrem cada decisão da matriz com vínculo correto, tipo errado, campus errado, vínculo desativado e estado inválido.
