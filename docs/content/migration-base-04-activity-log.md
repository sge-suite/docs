---
id: migration-base-04-activity-log
title: Migration base 04 — activity_log
description: Estado atual da auditoria baseada no Spatie Activity Log.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/auditoria, sge/banco-de-dados
related:
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_08_06_201115_create_activity_log_table.php, https://github.com/sge-suite/sge/blob/master/app/Http/Middleware/SetAuditActor.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/DatabaseAuditTest.php
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
- [x] Definir e implementar eventos Eloquent para entidades de negócio, incluindo campos cadastrais de e-mail; tabelas de entrega mantêm histórico técnico próprio.
- [ ] Definir retenção e acesso por perfil.
- [x] Testar a exclusão de senhas, hashes, tokens e outros dados protegidos dos valores registrados.
- [x] Relacionar o autor ao vínculo ativo em ações humanas; registrar ações sem pessoa autenticada como sistema.
