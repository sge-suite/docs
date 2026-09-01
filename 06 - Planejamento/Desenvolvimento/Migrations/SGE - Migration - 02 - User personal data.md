---
title: SGE — Migration 02 — user_personal_data
description: Contrato dos dados pessoais separados da autenticação.
type: migration-reference
status: planned
order: 2
table: user_personal_data
tags:
  - sge/migrations
  - sge/banco-de-dados
  - sge/dados-pessoais
---
> [!todo] Estado
> Planejada. Depende de `users` (migration base do Laravel) e [[SGE - Migration - 01 - Addresses|`addresses`]].

## Contrato

| Campo        | Regra                                                 |
| ------------ | ----------------------------------------------------- |
| `id`         | bigint, chave primária.                               |
| `user_id`    | FK única para `users`; um perfil por conta.           |
| `cpf`        | obrigatório, único e sem formatação; não é login.     |
| `rg`         | nullable; exigido para discente quando a regra pedir. |
| `rg_issuer` / `rg_issue_date` | nullable; obrigatórios junto ao RG quando o formulário exigir documento de identidade. |
| `birth_date` | nullable; exigida quando a regra pedir.               |
| `phone`      | nullable, normalizado; exigido para discente no envio da solicitação de estágio. |
| `emancipation_verified_at` | timestamp nullable; preenchido somente após validação do Setor de Estágio. |
| `emancipation_verified_by_affiliation_id` | FK nullable para o vínculo que confirmou a prova; adicionada em alteração posterior a `affiliations`, para não criar dependência circular. |
| `address_id` | nullable, FK para `addresses`.                        |
| timestamps   | obrigatórios.                                         |

CPF não pode ser alterado pela tela de configurações. Dados atuais podem mudar, mas o estágio deve guardar snapshot histórico. A matrícula não pertence a esta tabela: ela é o `registration_number` do vínculo discente em `affiliations`.

`emancipation_verified_at` conserva a decisão positiva já dada pelo Setor; não é um booleano editável pelo discente. A evidência e todo o histórico de envios ficam em [[SGE - Migration - 19A - Emancipation evidences|`emancipation_evidences`]], não em uma string solta deste perfil. Na abertura, a opção `emancipated_minor` permite enviar o comprovante e dispensar temporariamente o responsável legal, mas cria pendência de análise manual. A cópia fica em área privada e não entra no `activity_log`, no e-mail ou em documentos gerados, conforme [[SGE - Backlog e decisões#D-018 — Emancipação exige comprovação e validação institucional|D-018]].

## Checklist

- [ ] Criar migration com FK única para `users`.
- [ ] Definir `address_id` como `nullOnDelete` ou `restrict` após confirmar a política de endereços.
- [ ] Criar Model `UserPersonalData` e relação um-para-um em `User`.
- [ ] Criar factory com pessoa completa e pessoa sem dados opcionais.
- [ ] Normalizar e validar CPF antes de persistir.
- [ ] Testar unicidade, perfil ausente, CPF inválido e edição restrita.
- [ ] Testar migrate e rollback em banco limpo.
- [ ] Atualizar [[SGE - Modelo de dados - Acesso|modelo de acesso]].
