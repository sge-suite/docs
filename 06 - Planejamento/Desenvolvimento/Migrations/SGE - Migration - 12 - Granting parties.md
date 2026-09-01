---
title: SGE — Migration 12 — granting_parties
description: Contrato das partes concedentes reutilizáveis e seu endereço atual.
type: migration-reference
status: planned
order: 12
table: granting_parties
tags:
  - sge/migrations
  - sge/concedente
  - sge/banco-de-dados
---
> [!todo] Estado
> Planejada. Depende de [[SGE - Migration - 01 - Addresses|`addresses`]] e [[SGE - Enum - PartyDocumentType|`PartyDocumentType`]].

## Contrato

| Campo                     | Regra                                     |
| ------------------------- | ----------------------------------------- |
| `id`                      | bigint, chave primária.                   |
| `document_type`           | enum/string `cpf` ou `cnpj`.              |
| `document_number`         | obrigatório, normalizado e sem pontuação. |
| `name`                    | nome completo/razão social, obrigatório.  |
| `address_id`              | nullable, FK para endereço atual.         |
| `representative_name` / `representative_role` | nullable; identificação e cargo do representante da concedente. |
| `phone` / `email`         | nullable e normalizados; canais atuais de contato. |
| `field_of_activity`       | nullable; área de atuação.                |
| `professional_council` / `council_registration_number` | nullable; conselho e registro profissional quando aplicáveis. |
| `credentialing_process_number` | texto nullable com o número do processo de credenciamento, quando aplicável. |
| timestamps / `deleted_at` | auditoria e exclusão lógica.              |

Não exigir unicidade global de CNPJ: unidades distintas podem compartilhar o documento. Nome, unidade e endereço diferenciam os registros. Para ser selecionada na solicitação de estágio, a parte concedente precisa estar cadastrada; não é exigido convênio ou termo prévio como regra de validação. Quando houver, o número do processo de credenciamento preenche o campo correspondente do documento. O estágio guardará FK e snapshot.

Os campos de endereço continuam em `addresses`, e não são repetidos nesta tabela. O modelo também evita copiar telefone, representante, conselho e processo a cada estágio: eles são dados atuais da concedente e entram no snapshot somente no aceite.

## Checklist

- [ ] Confirmar se a unidade precisa de coluna própria ou faz parte de `name`.
- [ ] Criar migration e cast de `PartyDocumentType` no Model.
- [ ] Definir índice de busca sem impor unicidade indevida.
- [ ] Criar factory para CPF, CNPJ e unidades distintas.
- [ ] Validar documento e normalização.
- [ ] Criar solicitação de cadastro para análise do Setor de Estágio.
- [x] Definir que o cadastro é suficiente para validar a parte concedente no formulário de estágio.
- [x] Definir número de processo como dado simples de credenciamento.
- [ ] Testar endereço alterado e snapshot no estágio.
- [ ] Testar migrate/rollback na ordem completa.
