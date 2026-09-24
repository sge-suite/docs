---
id: fase-02-activity-log
title: Fase 02 — Activity Log
description: Cobertura consistente de auditoria nas entidades de negócio, com autoria ligada ao vínculo ativo.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/auditoria, sge/checklist
related: migration-base-04-activity-log, modelo-de-dados-historico, e-mails-notificacoes-e-entregas, fase-03-integracao-de-email
source_refs:
---
Esta é a próxima etapa de implementação. O Activity Log será preparado antes dos fluxos funcionais para que ações futuras já tenham autoria e histórico consistentes.

## Activity Log

- [ ] Inventariar cada tabela de domínio e definir quais eventos de negócio devem ser registrados.
- [ ] Registrar o vínculo ativo como autor das ações feitas por pessoas e identificar ações automáticas como sistema.
- [ ] Aplicar configuração consistente de evento, entidade, alterações anteriores/novas e contexto.
- [ ] Cobrir criação, edição, transições, cancelamentos, substituições e exclusões lógicas onde existirem.
- [ ] Definir como entidades imutáveis ou técnicas registram eventos sem duplicar seu histórico.
- [ ] Remover ou ocultar CPF, credenciais, tokens, URLs assinadas, anexos privados e conteúdo sensível de e-mail dos atributos e propriedades.
- [ ] Testar autoria pelo vínculo, estados anterior/novo, operações automáticas e proteção dos campos sensíveis.
- [ ] Definir acesso administrativo ao histórico sem expô-lo a discentes, supervisores ou outros perfis sem autorização.

O inventário deve cobrir todas as entidades de negócio. Tabelas internas do Laravel, filas, sessões, tokens e cache só entram no Activity Log quando houver um evento de domínio que justifique o registro; dados secretos nunca são copiados para o log.

## Depois da auditoria

- [ ] Prosseguir para [Integração de e-mail](doc:fase-03-integracao-de-email), incluindo envio pós-commit, tentativas, idempotência e reprocessamento.
- [ ] Preparar Policies e Actions para serem usadas por interfaces e comandos sem duplicar autorização.
- [ ] Manter operações demoradas em Jobs e garantir idempotência e tratamento observável de falhas.
- [ ] Configurar monitoramento, backups e teste de restauração quando os fluxos de produção estiverem definidos.

## Critério de saída

- [ ] Cada entidade de negócio tem política de auditoria explícita e testada.
- [ ] A autoria humana pode ser vinculada ao contexto ativo; ações automáticas ficam identificadas como sistema.
- [ ] Nenhum dado sensível é gravado em `attribute_changes` ou `properties`.

## Próxima etapa

[Fase 03 — Integração de e-mail](doc:fase-03-integracao-de-email)
