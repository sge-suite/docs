---
title: SGE — Migration base 04 — activity_log
description: Estado atual da auditoria baseada no Spatie Activity Log.
type: migration-reference
status: implemented
order: 0.4
code_path: database/migrations/2026_08_06_201115_create_activity_log_table.php
table: activity_log
tags:
  - sge/migrations
  - sge/auditoria
  - sge/banco-de-dados
aliases:
  - Migration atual de Activity Log
---
> [!success] Estado
> Implementada no arquivo `2026_08_06_201115_create_activity_log_table.php` e usada pelo pacote Spatie Activity Log.

## Contrato atual

| Campo                         | Regra                                          |
| ----------------------------- | ---------------------------------------------- |
| `id`                          | bigint, chave primária.                        |
| `log_name`                    | nullable e indexado.                           |
| `description`                 | texto obrigatório.                             |
| `subject_type` / `subject_id` | morph nullable/indexado para entidade afetada. |
| `event`                       | nullable.                                      |
| `causer_type` / `causer_id`   | morph nullable/indexado para autor.            |
| `attribute_changes`           | JSON nullable; alterações de atributos.        |
| `properties`                  | JSON nullable; contexto adicional.             |
| timestamps                    | auditoria temporal.                            |

## Cuidados

Não guardar senhas, tokens, URLs assinadas, códigos de verificação, credenciais SMTP ou conteúdo sensível de e-mail em `properties`/`attribute_changes`.

## Rollback atual

O arquivo não define `down()`. Isso deve ser tratado como limitação/documentação explícita: rollback automático não está disponível para esta migration.

## Checklist

- [x] Criar tabela e morphs de sujeito/causador.
- [x] Criar JSON de alterações/propriedades.
- [ ] Decidir se a migration deve ganhar `down()` antes de ser usada em produção.
- [ ] Definir eventos obrigatórios para endereço, e-mail, vínculo, status e documentos.
- [ ] Definir retenção e acesso por perfil.
- [ ] Testar redaction de dados sensíveis.
- [ ] Relacionar actor ao vínculo ativo nas ações do domínio.
