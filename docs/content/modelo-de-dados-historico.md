---
id: modelo-de-dados-historico
title: Modelo de dados — Histórico
description: Esquema lógico de snapshots, auditoria, notificações e histórico de entrega.
type: data-model
status: defined
visibility: public
tags: sge/modelagem, sge/historico, sge/mermaid
related:
source_refs:
diagram: modelo-historico
---
## Histórico, notificações e entregas

{{diagram:modelo-historico}}

## Regra de persistência

- A FK aponta para a entidade atual e permite filtros, estatísticas, escopo e rastreabilidade.
- O snapshot `jsonb` registra os valores usados no processo; a alteração do cadastro atual não o reescreve.
- Cada linha de `supervisor_evaluations` representa um formulário por estágio e supervisor. O registro só é editado em `Draft` ou `Returned`; valores anteriores e transições ficam no `activity_log`, sem expor esse log ao supervisor.
- A geração de documento cria seu próprio snapshot, independente do snapshot do estágio; o arquivo final gerado não é armazenado pelo SGE.
- O e-mail operacional preserva assunto e conteúdo em `email_messages`; destinatário, solicitante e tentativas ficam em `email_delivery_attempts`. Convite inicial não armazena corpo e recuperação de senha não cria registros nessas tabelas.
- Segredos de autenticação não são snapshots: links e tokens de recuperação nunca são guardados no conteúdo do e-mail. Não haverá confirmação adicional de endereço de e-mail.

> [!warning] Não confundir
> `addresses` é reutilizável para o endereço atual e para cópias históricas. O endereço que aparece em um estágio deve ser lido de `internships.workplace_address_id` ou `student_address_id`; o documento gerado congela a representação usada na geração.
