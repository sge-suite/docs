---
id: fase-06-documentos
title: Fase 06 — Documentos
description: Checklist de templates DOCX, versões, geração e acompanhamento de assinatura.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/documentos, sge/checklist
related: fluxos-principais, geracao-de-documentos-docx-e-variaveis, migration-13-document-templates, migration-16-generated-documents, fase-07-abertura-do-estagio
source_refs:
---
Referências: [fluxo de formalização](doc:fluxos-principais#3-analise-e-formalizacao), [contrato do motor e catálogo](doc:geracao-de-documentos-docx-e-variaveis), [migration de templates](doc:migration-13-document-templates) e [migration de documentos gerados](doc:migration-16-generated-documents).

A entrega atual cobre gestão de templates originais: catálogo e consulta do próprio campus, versões privadas, inspeção OOXML, validação automática no upload e guia de variáveis. Geração, prévias preenchidas, PDFs, assinatura e documentos da concedente pertencem a fases posteriores. Há visualização aproximada do original, sem preencher variáveis. O contrato de ciclo de vida, catálogo e dados indisponíveis está em [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis). A classificação de remuneração foi consolidada na Migration 13 original e aplicada ao banco existente por migration temporária, sem fresh; não há dependência nova.

## Checklist

- [x] Criar `document_templates` global ou por campus, sem chave textual, com desativação.
- [x] Criar `template_versions` com coleção privada do Media Library para um DOCX por versão.
- [x] Implementar o fluxo de upload com inspeção e validação automática que seleciona o novo arquivo como vigente.
- [x] Permitir upload DOCX somente ao vínculo autorizado do Setor de Estágio.
- [x] Definir catálogo fixo com `DISCENTE_*`, modificadores de caixa permitidos e modelos separados por remuneração.
- [x] Implementar inspeção OOXML e validação de variáveis no upload.
- [ ] Avaliar dependências somente na fase de geração, com autorização; esta entrega usa ZIP/DOM nativos.
- [x] Validar estrutura e marcadores no upload, sem confirmação posterior; conteúdo jurídico e dados fixos continuam sob responsabilidade do Setor.
- [ ] Corrigir o template de credenciamento e reconstruir/renderizar a rescisão.
- [x] Impedir alteração destrutiva e exclusão de versão já utilizada; permitir exclusão física da versão sem documentos gerados.
- [x] Criar `generated_documents` com tipo, origem, status e snapshot quando gerado pelo SGE.
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
- [ ] Testar dados completos/opcionais, acentuação e versão ainda não validada.
- [ ] Testar marcadores em tabelas/cabeçalhos, arquivo malicioso, sobras e revisão visual de todas as páginas.

## Entrega de gestão de templates

- [x] Cadastro/edição e consulta restritos ao próprio campus, sem seletor de escopo.
- [x] Histórico, relatório seguro, hash, tamanho, vínculo e numeração sem reutilizar números excluídos.
- [x] Guia pesquisável, com todas as variáveis disponíveis para qualquer tipo de template, sem lista de variáveis obrigatórias, com catálogo canônico e exemplos fictícios.
- [x] Seleção de outra versão vigente, sem excluir a atual, com confirmação e auditoria.
- [x] Visualização aproximada do original em modal privado, mantendo os marcadores.
- [x] Exclusão individual e do catálogo com senha atual, preservando registros já utilizados e auditoria.
- [x] Upload recusado preserva a vigente; cada upload aceito já é validado e remoção nunca é permitida após uso.

Não criar nem executar testes nesta etapa; usar verificações não-testes.

## Critério de saída

- [ ] Templates e versões são imutáveis após uso.
- [ ] Nenhum arquivo final gerado ou fornecido pela concedente é armazenado pelo SGE.
- [ ] O status de cada documento é independente do status do estágio.

## Próxima fase

[Fase 07 — Abertura e análise do estágio](doc:fase-07-abertura-do-estagio)
