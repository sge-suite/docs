---
id: fase-10-servicos-transversais
title: Fase 10 — Serviços transversais
description: Checklist de auditoria, Jobs, notificações, filtros, relatórios e operação segura.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/operacao, sge/checklist
related: e-mails-notificacoes-e-entregas
source_refs:
---
## Checklist

- [ ] Garantir Activity Log com ator, vínculo, entidade, ação e estados anterior/novo.
- [ ] Usar o contrato de [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas) para novas finalidades.
- [ ] Processar importações, notificações, lotes documentais e operações demoradas em Jobs.
- [ ] Manter geração DOCX unitária síncrona/temporária; usar Job somente para lote com expiração e limpeza garantidas.
- [ ] Criar reprocessamento seguro para Jobs e falhas de e-mail.
- [ ] Implementar filtros e relatórios respeitando campus, vínculo e permissão.
- [ ] Configurar backups, monitoramento e teste de restauração.
- [ ] Auditar alterações de endereço, e-mail, vínculo e status.

## Critério de saída

- [ ] Falhas são observáveis, reprocessáveis e não duplicam efeitos.
- [ ] Dados e relatórios respeitam o escopo do vínculo em consultas e exports.
- [ ] Restauração foi testada em ambiente controlado.

## Próxima fase

Esta fase encerra o planejamento de desenvolvimento atual.
