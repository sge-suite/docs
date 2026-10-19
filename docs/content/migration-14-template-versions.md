---
id: migration-14-template-versions
title: Migration 14 — template_versions
description: Contrato das versões dos templates DOCX e preservação após uso.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/documentos
related: migration-13-document-templates, geracao-de-documentos-docx-e-variaveis, migration-16-generated-documents
source_refs:
---
> [!success] Estado
> Schema existente reutilizado. Upload privado inspecionado, histórico, validação automática no envio, seleção da vigente e bloqueios de imutabilidade/remoção implementados. `generated_documents` já existe na Migration 16. Não há geração nem prévia preenchida nesta entrega. A visualização aproximada do original está disponível sem download.

## Contrato

| Campo | Regra |
| --- | --- |
| `id` | bigint, chave primária. |
| `document_template_id` | FK obrigatória. |
| `version` | inteiro positivo e único dentro do template. |
| `file_sha256` / `file_size` | identidade e tamanho do DOCX recebido; o hash não se repete dentro do mesmo template lógico. |
| `detected_variables` | JSONB do resultado da inspeção do DOCX. |
| `validation_report` | JSONB da inspeção (`validated` nos uploads aceitos), códigos fixos de erros/avisos, contagens e revisão do catálogo/validador; sem conteúdo bruto. Relatórios históricos são preservados. |
| `uploaded_by_affiliation_id` | vínculo autorizado que enviou o arquivo. |
| timestamps | auditoria. |

O DOCX original é armazenado pelo Spatie Media Library na coleção privada `template_file`, com uma mídia por versão. A tabela `template_versions` registra revisões do arquivo recebido e seu contrato de variáveis; **não** recebe uma linha por documento gerado. O catálogo de variáveis aceitas é fixo no código, enquanto cada DOCX utiliza apenas as variáveis necessárias. O hash impede criar uma segunda versão do mesmo template com o mesmo arquivo.

A geração seleciona a versão **vigente selecionada** em `document_templates.current_version_id` e registra seu ID em `generated_documents.template_version_id`. O upload inspeciona o arquivo antes de aceitar a versão; uma tentativa recusada não cria versão nem substitui a vigente. Se o Setor corrigir um DOCX que já gerou documentos, envia outro arquivo como nova versão; a anterior e seus documentos permanecem íntegros. Uma versão sem documentos gerados pode ser excluída fisicamente, incluindo sua mídia. A Migration 16 já criou `generated_documents`: sua FK restritiva e o Model impedem exclusão ou alteração da versão utilizada. Não há ação separada de validar/disponibilizar. O upload aprovado assume a vigência; Tornar vigente permite escolher outra versão aprovada sem excluir arquivos.

O validador aceita `${NOME_DA_VARIAVEL}` ou `${NOME_DA_VARIAVEL|MODIFICADOR}` com uma transformação permitida, do catálogo canônico, sem restrição por tipo ou classificação de remuneração. Usa `DISCENTE_*`; rejeita o dialeto `{{...}}`, macros, vínculos que carreguem recursos externos e variável desconhecida ou reservada. Fontes incorporadas ODTTF/TTF/OTF e hyperlinks HTTP/HTTPS/mailto são aceitos com controles específicos; URLs nunca são acessadas pelo inspetor. Não há análise de dados pessoais no texto. A validação acontece no upload, com hash/tamanho registrados e sem confirmação manual ou geração de cópias preenchidas, conforme [Geração de documentos DOCX e variáveis](doc:geracao-de-documentos-docx-e-variaveis).

## Checklist

- [x] Definir mídia privada única, metadados, marcadores detectados e relatório de validação.
- [x] Criar migration com unicidade por template/versão e template/hash.
- [x] Criar Model, relação com template, casts e coleção privada única no Media Library.
- [x] Validar DOCX e catálogo de variáveis `${variavel}` antes do uso.
- [x] Manter a versão vigente em `current_version_id`, permitindo selecionar outra versão validada sem excluir a atual.
- [x] Impedir alteração destrutiva e exclusão após uso em `generated_documents`; permitir exclusão física enquanto não houver uso.
- [ ] Testar seleção da versão validada, duplicidade de arquivo e nova versão.
- [ ] Testar inspeção OOXML, variável desconhecida e proteção de versão utilizada.
- [ ] Testar migrate/rollback da 14 e rollback da 13 na ordem das FKs.

## Dependências

- [generated_documents](doc:migration-16-generated-documents)
- [document_templates](doc:migration-13-document-templates)

## Atestado de orientação e versões

O atestado admite um único `document_templates` em todo o sistema, incluindo desativados. Essa unicidade não limita o número de revisões em `template_versions`. Metadados são editados no cadastro existente; correções do DOCX são novas versões, mantendo vigente e imutabilidade após uso. Não se cria outro template lógico para atualizar o atestado. Consulte [o tipo documental](doc:enum-generateddocumenttype).

## Estados, exclusão e numeração

Upload com erro estrutural, de segurança ou de variáveis é rejeitado antes da persistência, sem guardar o original recusado. Arquivo aprovado na inspeção é armazenado com relatório `validated`, autoria e momento registrados no Activity Log; não há estado pendente nem confirmação posterior. Uma versão validada não pode ser reescrita. Mídia não é substituída no lugar, mesmo antes de uso. Versão usada não pode ser excluída; versão nunca usada pode ser removida com mídia e confirmação. Se vigente, a versão aprovada restante de maior número volta a vigorar. A exclusão de outra versão não muda a seleção. A numeração é serializada por lock do template e considera também o último upload auditado, preservado permanentemente, para não reutilizar números excluídos.

Limites e controles ZIP/XML, validação de marcadores, reservadas indisponíveis e catálogo detalhado estão no [contrato canônico](doc:geracao-de-documentos-docx-e-variaveis). Não há geração nem renderização fictícia. A classificação de remuneração pertence à Migration 13 original; a remoção da classificação de variáveis é consolidada nesta migration e aplicada ao banco existente por migration temporária, sem fresh. O relatório JSONB inclui `detected_markers` com as expressões reconhecidas e mantém os nomes base em `detected_variables`.

Não há seleção de variáveis obrigatórias/opcionais nem lista mínima por tipo. O DOCX pode conter qualquer subconjunto dos marcadores disponíveis, inclusive nenhum. Relatórios históricos são preservados; novos uploads usam somente as regras atuais.

O envio do arquivo é registrado no Activity Log como `template_version_uploaded`, com campus, versão, identificador e vínculo responsável. Criação e exclusão da versão também são auditadas; a inspeção automática fica registrada no relatório do upload. O contexto é preenchido por `beforeActivityLogged`, conforme a API instalada do Activity Log 5. A exclusão individual ou junto ao template preserva campus, catálogo e número da versão mesmo após remover o registro e a mídia. Os históricos da tela e da auditoria do campus também recuperam o contexto de eventos antigos pelo registro explícito de upload, sem alterar logs imutáveis. Nenhum conteúdo do DOCX, nome original ou caminho privado é adicionado à auditoria.

A ação Livewire do formulário é `uploadVersion`: `upload` é um alias da API JavaScript de arquivos do Livewire e não deve nomear a ação de submissão. Falhas retornam os erros no campo de arquivo e encerram o carregamento; o temporário é removido, sem perder o histórico vigente.

As colunas `validated_at` e `validated_by_affiliation_id` foram removidas da migration original e do banco existente por migration temporária executada via Sail e removida após a aplicação, sem fresh. O relatório aprovado no upload identifica a inspeção concluída; `currentVersion` consulta a versão apontada pelo catálogo, cujo relatório deve ter status `validated`. A validação da referência em `GeneratedDocument` usa o mesmo status. O Activity Log mantém autoria, data e metadados históricos, inclusive dos campos removidos; arquivos e relatórios existentes são preservados. Toda versão persistida é imutável desde a criação.

Visualizar exibe o original em HTML dentro de modal privado, sem substituir variáveis, gerar documentos ou persistir conversões. A rota usa autorização do template e vínculo de campus e confirma que a versão pertence ao catálogo. Limitações de layout e proteções estão no contrato canônico.

A exclusão individual de um arquivo/versão exige a senha atual do usuário em cada confirmação. A tela valida `current_password` e a Action confere novamente o hash da conta autenticada antes de remover a versão. O campo é limpo ao cancelar, fechar ou concluir e não é incluído na auditoria. A remoção conjunta pelo catálogo continua protegida pela confirmação de senha da exclusão do template.
