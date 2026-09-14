---
id: fase-06-documentos
title: Fase 06 — Documentos
description: Checklist de templates DOCX, versões, geração e acompanhamento de assinatura.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/documentos, sge/checklist
related: fluxos-principais, geracao-de-documentos-docx-e-variaveis, migration-13-document-templates, migration-16-generated-documents, fase-07-abertura-do-estagio
source_refs:
---
Referências: [fluxo de formalização](doc:fluxos-principais#3-analise-e-formalizacao), [contrato do motor e catálogo](doc:geracao-de-documentos-docx-e-variaveis), [migration de templates](doc:migration-13-document-templates) e [migration de documentos gerados](doc:migration-16-generated-documents).

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

[Fase 07 — Abertura e análise do estágio](doc:fase-07-abertura-do-estagio)
