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

A entrega cobre templates privados, emissão com snapshot e versão imutáveis, reprodução histórica em DOCX e conversão PDF sob demanda. O coordenador titular/substituto emite somente atestados de seus cursos, com template vigente automático; o Setor emite os demais tipos. Ambos escolhem o formato, com DOCX padrão. Cada atestado também possui histórico, sem assinatura. Assinaturas, avisos e registro operacional de documentos externos continuam pendentes. O contrato e as limitações de fontes/layout do PDF estão em [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis).

## Checklist

- [x] Criar `document_templates` global ou por campus, sem chave textual, com desativação.
- [x] Criar `template_versions` com coleção privada do Media Library para um DOCX por versão.
- [x] Implementar o fluxo de upload com inspeção e validação automática que seleciona o novo arquivo como vigente.
- [x] Permitir upload DOCX somente ao vínculo autorizado do Setor de Estágio.
- [x] Definir catálogo fixo com `DISCENTE_*`, modificadores de caixa permitidos e modelos separados por remuneração.
- [x] Implementar inspeção OOXML e validação de variáveis no upload.
- [x] Integrar PHPWord 1.4 e Gotenberg 8.38.1/LibreOffice privado no Sail.
- [x] Validar estrutura e marcadores no upload, sem confirmação posterior; conteúdo jurídico e dados fixos continuam sob responsabilidade do Setor.
- [x] Corrigir credenciamento, reconstruir/renderizar rescisão e adaptar os nove modelos legados.
- [x] Impedir alteração destrutiva e exclusão de versão já utilizada; permitir exclusão física da versão sem documentos gerados.
- [x] Criar `generated_documents` com tipo, origem, status e snapshot quando gerado pelo SGE.
- [ ] Registrar documento externo sem receber/armazenar arquivo e com template nulo.
- [x] Gerar usando somente dados autorizados pelo contexto do estágio.
- [x] Gerar em arquivo privado temporário, transmitir e apagar em `finally`, com limpeza horária de órfãos.
- [x] Implementar token idempotente e lock para retries/concorrência.
- [x] Auditar geração e resultado da transmissão, sem copiar o snapshot para logs.
- [x] Oferecer DOCX/PDF na emissão e no histórico, sem outro registro ao baixar novamente.
- [x] Conferir o hash da reprodução do DOCX e preservar revisões do motor.
- [x] Mostrar contagens total e por versão, inclusive emissões canceladas.
- [ ] Controlar assinatura no documento, não no estágio.
- [ ] Ao marcar `Aguardando assinatura`, exigir o local genérico onde o documento está disponível, sem citar plataforma fixa.
- [ ] Exibir checkboxes dos interessados elegíveis e, quando selecionados, criar aviso de assinatura por e-mail e no sistema para quem possui conta.
- [ ] Acompanhar assinatura externa manualmente.
- [ ] Armazenar `protocol_number` retornado pelo SIGAA quando houver.
- [x] Tratar aditivo como `GeneratedDocumentType::Addendum`; variáveis sem fonte continuam reservadas.
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

Não criar nem executar testes nesta etapa; usar verificações não-testes. Foram conferidos sintaxe, Pint, análise estática direcionada, Blade, renderização dos modais e nove conversões com dados fictícios; os templates passaram pelo inspetor. A suíte funcional permanece para a preparação para produção. A conversão PDF não garante identidade visual absoluta entre editores/fontes.

## Critério de saída

- [x] Arquivos de template e versões usadas são preservados; exclusão do catálogo após uso é bloqueada.
- [x] Nenhum DOCX/PDF final gerado é mantido como acervo; registro operacional de documento externo continua pendente.
- [ ] O status de cada documento é independente do status do estágio.

## Próxima fase

[Fase 07 — Abertura e análise do estágio](doc:fase-07-abertura-do-estagio)
