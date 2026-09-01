---
title: SGE — Fase 06 — Documentos
description: Checklist de templates DOCX, versões, geração e acompanhamento de assinatura.
type: development-phase
status: planned
order: 6
tags:
  - sge/desenvolvimento
  - sge/documentos
  - sge/checklist
---
Referências: [[SGE - Fluxos principais#3 Análise e formalização|fluxo de formalização]], [[SGE - Geração de documentos DOCX e variáveis|contrato do motor e catálogo]], [[SGE - Migration - 13 - Document templates|migration de templates]] e [[SGE - Migration - 16 - Generated documents|migration de documentos gerados]].

## Checklist

- [ ] Criar `document_templates` e `template_versions`.
- [ ] Permitir upload DOCX somente ao vínculo autorizado do Setor de Estágio.
- [x] Definir catálogo fixo de variáveis em português com `${NOME_DA_VARIAVEL}`.
- [ ] Implementar inspeção OOXML e validação de variáveis antes de ativar uma versão.
- [ ] Adicionar `phpoffice/phpword` e declarar `brick/math` diretamente no Composer; validar extensões PHP.
- [ ] Validar os templates antes de ativá-los, removendo dados fixos indevidos.
- [ ] Corrigir o template de credenciamento e reconstruir/renderizar a rescisão.
- [ ] Impedir alteração destrutiva de versão já utilizada.
- [ ] Criar `generated_documents` com tipo, origem, status e snapshot quando gerado pelo SGE.
- [ ] Registrar documento externo sem receber/armazenar arquivo e com template nulo.
- [ ] Gerar usando somente dados autorizados pelo contexto do estágio.
- [ ] Gerar em arquivo privado temporário, transmitir e apagar em `finally`.
- [ ] Implementar token idempotente e lock para retries/concorrência.
- [ ] Registrar geração no Activity Log.
- [ ] Controlar assinatura no documento, não no estágio.
- [ ] Ao marcar `Aguardando assinatura`, exigir o local genérico onde o documento está disponível, sem citar plataforma fixa.
- [ ] Exibir checkboxes dos interessados elegíveis e, quando selecionados, criar aviso de assinatura por e-mail e no sistema para quem possui conta.
- [ ] Acompanhar assinatura externa manualmente.
- [ ] Armazenar `protocol_number` retornado pelo SIGAA quando houver.
- [ ] Tratar aditivo como `GeneratedDocumentType::Addendum`.
- [ ] Testar dados completos/opcionais, acentuação e versão inativa.
- [ ] Testar marcadores em tabelas/cabeçalhos, arquivo malicioso, sobras e revisão visual de todas as páginas.

## Critério de saída

- [ ] Templates e versões são imutáveis após uso.
- [ ] Nenhum arquivo final gerado ou fornecido pela concedente é armazenado pelo SGE.
- [ ] O status de cada documento é independente do status do estágio.

## Próxima fase

[[SGE - Fase 07 - Abertura do estágio|Fase 07 — Abertura e análise do estágio]]
