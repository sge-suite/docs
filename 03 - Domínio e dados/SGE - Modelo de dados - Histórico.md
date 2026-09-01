---
title: SGE — Modelo de dados — Histórico
description: Diagrama conceitual de snapshots, auditoria, notificações e histórico de entrega.
type: mermaid-diagram
status: defined
tags:
  - sge/modelagem
  - sge/historico
  - sge/mermaid
aliases:
  - Snapshots do SGE
---
## Histórico, notificações e entregas

```mermaid
erDiagram
    USERS ||--o{ INTERNSHIPS : discente
    INTERNSHIPS ||--o{ GENERATED_DOCUMENTS : gera
    TEMPLATE_VERSIONS ||--o{ GENERATED_DOCUMENTS : baseia
    INTERNSHIPS ||--o{ ACTIVITY_LOG : sujeito_via_morph
    USERS ||--o{ ACTIVITY_LOG : causador_via_morph
    USERS ||--o{ NOTIFICATIONS : destinatario_via_morph
    AFFILIATIONS ||--o{ NOTIFICATIONS : contextualiza
    NOTIFICATIONS o|--o{ EMAIL_MESSAGES : origina
    USERS ||--o{ EMAIL_MESSAGES : relaciona
    AFFILIATIONS ||--o{ EMAIL_MESSAGES : destina
    EMAIL_MESSAGES ||--o{ EMAIL_DELIVERY_ATTEMPTS : tenta

    USERS {
        bigint id PK
        string email UK
    }
    AFFILIATIONS {
        bigint id PK
        bigint user_id FK
        string email
    }
    INTERNSHIPS {
        bigint id PK
        bigint student_user_id FK
        bigint student_address_id FK
        bigint granting_party_id FK
        bigint internship_type_id FK
        jsonb student_snapshot
        jsonb process_snapshots
        string status
    }
    TEMPLATE_VERSIONS {
        bigint id PK
        bigint document_template_id FK
        string version
    }
    GENERATED_DOCUMENTS {
        bigint id PK
        bigint internship_id FK
        bigint template_version_id FK
        string origin
        string status
        string signature_availability_location
        jsonb snapshot
        timestamp created_at
        timestamp updated_at
    }
    ACTIVITY_LOG {
        bigint id PK
        string log_name
        text description
        string subject_type
        bigint subject_id
        string event
        string causer_type
        bigint causer_id
        json attribute_changes
        json properties
        timestamp created_at
        timestamp updated_at
    }
    NOTIFICATIONS {
        uuid id PK
        string type
        string notifiable_type
        bigint notifiable_id
        bigint affiliation_id FK
        jsonb data
        string deduplication_key UK
        timestamp read_at
        timestamp created_at
        timestamp updated_at
    }
    EMAIL_MESSAGES {
        uuid id PK
        uuid notification_id FK
        bigint user_id FK
        bigint affiliation_id FK
        string purpose
        string recipient_email
        string subject
        text content_text
        text content_html
        string template_key
        string template_version
        uuid idempotency_key UK
        timestamp created_at
        timestamp updated_at
    }
    EMAIL_DELIVERY_ATTEMPTS {
        uuid id PK
        uuid email_message_id FK
        smallint attempt_number
        string status
        string provider
        string provider_message_id
        timestamp queued_at
        timestamp sent_at
        timestamp failed_at
        text failure_reason
        timestamp created_at
        timestamp updated_at
    }
```

^erd-historico-notificacoes-entregas

## Regra de persistência

- A FK aponta para a entidade atual e permite filtros, estatísticas, escopo e rastreabilidade.
- O snapshot `jsonb` registra os valores usados no processo; a alteração do cadastro atual não o reescreve.
- Cada linha de `supervisor_evaluations` representa um formulário por estágio e supervisor. O registro só é editado em `Draft` ou `Returned`; valores anteriores e transições ficam no `activity_log`, sem expor esse log ao supervisor.
- A geração de documento cria seu próprio snapshot, independente do snapshot do estágio; o arquivo final gerado não é armazenado pelo SGE.
- O e-mail operacional preserva um snapshot próprio do destinatário, assunto e conteúdo em `email_messages`; tentativas e reenvios ficam em `email_delivery_attempts`.
- Segredos de autenticação não são snapshots: links e tokens de recuperação nunca são guardados no conteúdo do e-mail. O SGE não terá código ou tabela de verificação de e-mail.

> [!warning] Não confundir
> `addresses` é reutilizável para o endereço atual. O endereço que aparece em um estágio ou documento deve ser lido do snapshot histórico correspondente.
