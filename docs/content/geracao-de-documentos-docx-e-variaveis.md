---
id: geracao-de-documentos-docx-e-variaveis
title: Geração de documentos DOCX e variáveis
description: Geração e reprodução histórica em DOCX/PDF, validação de templates e catálogo canônico de variáveis.
type: integration-contract
status: implemented
visibility: public
tags: sge/documentos, sge/templates, sge/integracoes
related: migration-13-document-templates, migration-14-template-versions, migration-16-generated-documents, helper-numbertowordshelper
source_refs: https://github.com/sge-suite/sge/blob/master/app/Actions/GenerateInternshipDocument.php, https://github.com/sge-suite/sge/blob/master/app/Actions/RebuildGeneratedDocument.php, https://github.com/sge-suite/sge/blob/master/app/Support/GeneratedDocumentSnapshot.php, https://github.com/sge-suite/sge/blob/master/app/Support/DocxRenderer.php, https://github.com/sge-suite/sge/blob/master/app/Support/DocxToPdf.php, https://github.com/sge-suite/sge/blob/master/app/Support/TemporaryDocumentDownload.php, https://github.com/sge-suite/sge/blob/master/app/Policies/GeneratedDocumentPolicy.php
---
## Escopo implementado

A aplicação mantém templates privados e gera documentos dos tipos `main`, `addendum` e `orientation_certificate` a partir da versão vigente validada. Cada emissão, inclusive de atestado, cria um registro com dados congelados e referência à versão usada. O download oferece DOCX, selecionado por padrão, ou PDF convertido diretamente do DOCX. Os arquivos finais são temporários; o acervo contém originais dos templates e registros das emissões. Assinaturas, avisos aos interessados e liberação do estágio estão implementados por botões; registro operacional de documentos externos continua pendente.

PHPWord 1.4 fornece a escrita dos trechos OOXML preenchidos. O motor preserva o pacote original em vez de reconstruir o documento inteiro. A conversão PDF usa LibreOffice no serviço privado Gotenberg 8.38.1 do Compose. A visualização HTML do original continua separada da geração, aproximada e sem preencher os marcadores.

## Autorização e ciclo de vida

O Setor de Estágio com vínculo ativo selecionado consulta e mantém somente templates do próprio campus. O campus é derivado do vínculo no backend, sem seletor, campo de escopo ou campus recebido pelo formulário. A listagem e a Policy de acesso direto usam esse mesmo recorte. Registros antigos com `campus_id` nulo continuam preservados no schema, mas não são exibidos nem acessíveis neste fluxo. Campus desativado permite somente consulta autorizada.

O template lógico é ativo ou desativado (`deactivated_at`). Desativar preserva versões e vigente, mas impede novos uploads. Desativar exige confirmação e senha atual, conforme os demais cadastros. Reativar exige campus ativo. Nome/descrição podem mudar; tipo e escopo ficam congelados ao receber a primeira versão. A exclusão física exige campus ativo, autorização, senha atual e ausência de documentos que utilizem qualquer versão. Arquivos e versões sem uso são removidos junto com o template, sem exigir exclusão manual prévia. A Action verifica o uso sob lock, remove as versões pela mesma operação segura usada na exclusão individual e só então exclui o catálogo; o Model impede exclusão direta com versões remanescentes. A mídia é limpa após o commit. Auditoria histórica não impede a exclusão e é preservada.

O atestado de orientação é a exceção de cardinalidade do catálogo: somente um template lógico `orientation_certificate` em todo o sistema, inclusive desativado e independentemente do campus/escopo. Não há novo cadastro nem conversão de outro tipo quando já existir o atestado; seu tipo é preservado. A manutenção autorizada edita o mesmo cadastro e envia novas versões do DOCX. O versionamento permanece para rastrear arquivos e emissões futuras; não existe limite de uma emissão por este contrato. As Policies de campus continuam aplicáveis.

O cadastro inicial exige o DOCX no componente `x-file-upload`, com os metadados. Catálogo, primeira versão e mídia são persistidos atomicamente após inspeção; rejeição ou falha de armazenamento não deixa cadastro vazio nem reserva o singleton do atestado. A edição de metadados não substitui arquivo: uploads posteriores usam a gestão de versões.

1. **Recebendo:** arquivo temporário privado do Livewire; ainda não há versão. Falha estrutural, de segurança ou de variáveis rejeita o arquivo e remove o temporário, sem criar versão nem guardar o DOCX recusado.
2. **Validada no envio:** o mesmo upload inspeciona estrutura OOXML, segurança e marcadores e, somente sem erros, armazena a mídia privada e o relatório `validated`. Não há colunas separadas de data e vínculo de validação: autoria e momento da operação estão no Activity Log; os metadados próprios do envio continuam na versão. Não há etapa pendente, confirmação manual, botão de validar ou ação de disponibilizar.
3. **Vigente:** versão referenciada por `document_templates.current_version_id`. Cada upload aceito assume a vigência automaticamente. O Setor também pode selecionar outra versão aprovada pelo botão Tornar vigente, com confirmação, sem excluir ou reescrever arquivos. A seleção verifica hash/tamanho e mídia privada, exige template e campus ativos e registra versão anterior, nova versão e vínculo no Activity Log. Um arquivo recusado não cria versão nem muda a vigente.

Arquivo, hash, tamanho, autoria, numeração e schema de variáveis são imutáveis desde o upload. Depois de validada, nem relatório/validação podem ser reescritos. Versão usada por qualquer `generated_documents` não pode ser alterada nem removida. Versão nunca usada pode ser excluída fisicamente com mídia; excluir a vigente faz a versão aprovada restante de maior número voltar a vigorar; excluir outra versão preserva a seleção atual, com confirmação e auditoria. Exclusões são bloqueadas em campus desativado, mas permitidas para limpeza de template desativado. O número seguinte considera versões existentes e o último upload auditado; números excluídos não são reutilizados. O histórico de upload não pode ser limpo, conforme proteção já existente do Activity Log.

## Validação do DOCX

A inspeção verifica estrutura, segurança técnica e variáveis presentes. Não procura dados pessoais nem classifica o texto fixo do template.

Limites: 10 MiB comprimidos, 50 MiB descomprimidos no total, 10 MiB por entrada e 1.000 entradas. Somente extensão `.docx`, MIME OOXML identificado no servidor e assinatura ZIP; não confiar no MIME do navegador. Ler entradas sem extrair para disco. Rejeitar entradas duplicadas (inclusive diferenças de caixa), caminhos absolutos/relativos, barras invertidas, links simbólicos, criptografia, compressão não suportada, CRC inválido, ZIP/XML corrompido, DTD/entidades, conteúdo não permitido, macros/DOCM, objetos OLE/ActiveX, campos executáveis/DDE, vínculos que carreguem recursos externos e referências internas que escapem do pacote. Hyperlinks de navegação HTTP/HTTPS e mailto são aceitos; nenhum endereço é acessado durante a inspeção. Links para arquivos locais, comandos ou outros protocolos continuam bloqueados. Relações internas precisam apontar para partes existentes. Imagens permitidas: PNG/JPEG/GIF; sem SVG ativo nem anexos de outros documentos. Fontes incorporadas ODTTF, TTF e OTF em `word/fonts` são permitidas com verificação do cabeçalho; ODTTF exige a referência e a chave declaradas na tabela de fontes. Fontes não são instaladas ou executadas no servidor.

Inspecionar texto OOXML em parágrafos, tabelas, cabeçalhos, rodapés, notas e caixas de texto, reunindo runs do mesmo parágrafo sem unir parágrafos distintos. Aceitar `${NOME_DA_VARIAVEL}` ou `${NOME_DA_VARIAVEL|MODIFICADOR}` com um único modificador permitido; rejeitar outros dialetos, marcadores quebrados, desconhecidos ou reservados/indisponíveis. Relatório guarda códigos fixos, contagens e nomes conhecidos do catálogo; nunca conteúdo bruto, marcador desconhecido, XML, dados pessoais, caminhos ou nome original.

## Formatação e grafia no template

Fonte, tamanho, negrito, itálico, alinhamento e espaçamento pertencem ao DOCX. A substituição altera o texto do marcador, inclusive quando dividido entre runs, e preserva as propriedades de cada ocorrência e parágrafo, inclusive cabeçalhos/rodapés. O documento não é reconstruído como texto puro nem recebe HTML. O mesmo nome pode ter tamanhos diferentes no corpo e na assinatura. A revisão 2 do motor inclui `doNotExpandShiftReturn` para reduzir a expansão de linhas com quebra manual em parágrafos justificados; quebras manuais desnecessárias ainda devem ser corrigidas no template.

O inspetor aceita `${NOME}` e `${NOME|MODIFICADOR}`. Somente um modificador por ocorrência, sem espaços, parâmetros, expressões ou encadeamento. O nome base deve existir e estar disponível. Tipo e remuneração não restringem o uso de variáveis. `detected_variables` usa nomes base; `validation_report.detected_markers` preserva as expressões completas reconhecidas. Conteúdo desconhecido nunca é persistido no relatório. O catálogo está na revisão 7 e o inspetor na revisão 6.

| Modificador | Regra |
| --- | --- |
| `MAIUSCULAS` | Converte o texto para maiúsculas com suporte a acentos. |
| `MINUSCULAS` | Converte o texto para minúsculas com suporte a acentos. |
| `PRIMEIRA_MAIUSCULA` | Converte o texto para minúsculas e torna maiúscula apenas a primeira letra. |
| `INICIAIS_MAIUSCULAS` | Capitaliza palavras e mantém partículas internas como de, da, do, das, dos, em, e, na, no, para e com em minúsculas. Mantém as siglas explicitamente conhecidas pelo formatter. |

Exemplo: `${DISCENTE_NOME|INICIAIS_MAIUSCULAS}` transforma `MARIA DE SOUZA EM SILVA` em `Maria de Souza em Silva`. A grafia original continua no cadastro. Nomes especiais e siglas não cadastradas na lista precisam de revisão; usar o nome sem modificador quando a grafia original já estiver correta. O snapshot preserva o valor base e os trechos transformados por expressão. `TemplateTextFormatter` aplica as transformações; o resolver e o motor compõem a emissão.

Não há modificadores de negrito/itálico: aplicar essas propriedades no Word. O efeito nativo de caixa alta também pode ser usado quando a intenção for apenas visual; não altera o texto Unicode. O modelo institucional mantém o cabeçalho e a linha divisória da referência, corpo justificado e identificação inferior pequena. `${CAMPUS_IDENTIFICACAO}` compõe o literal “Campus” e o nome da cidade, sem usar o nome completo cadastrado do campus. Somente o literal fica em itálico; a cidade permanece em estilo normal. Essa variável possui dois trechos estruturados, sem HTML, produzidos por `TemplateTextFormatter::campusIdentification()`. O motor preserva fonte, tamanho e negrito da ocorrência, aplicando os dois estados de itálico. Os modificadores de caixa transformam o texto inteiro sem perder essa separação. `${CAMPUS_NOME}` continua disponível para o nome completo cadastrado, sem esse tratamento especial. Endereço, telefone, cidade e UF são variáveis. O conteúdo e a completude de cada modelo são revisados pelo Setor; o catálogo não impõe uma lista de marcadores.

## Templates por remuneração

`document_templates.remuneration` classifica o modelo lógico: `any` (independente), `paid` (com remuneração) ou `unpaid` (sem remuneração). O atestado de orientação usa somente `any` para preservar seu cadastro único. A classificação fica congelada após o primeiro upload, como o tipo; modelos com cláusulas diferentes devem ser cadastros diferentes.

O texto jurídico é escrito em cada DOCX, sem variável de parágrafo composto nem formatter de cláusulas. Modelos remunerados usam `${ESTAGIO_BOLSA_VALOR}`, `${ESTAGIO_BOLSA_EXTENSO}`, `${ESTAGIO_AUXILIO_TRANSPORTE_VALOR}` e `${ESTAGIO_AUXILIO_TRANSPORTE_EXTENSO}` quando aplicáveis. Esses marcadores são aceitos em qualquer tipo e classificação de template. O Setor define no próprio DOCX quais valores deseja apresentar; não há declaração de marcadores obrigatórios ou opcionais. Modelos independentes não devem conter cláusulas que dependam da modalidade sem uma classificação específica.

A escolha do template é manual pelo Setor, filtrada por campus, tipo, disponibilidade e compatibilidade com `internships.is_remunerated`: `paid` aceita somente estágio remunerado, `unpaid` somente não remunerado e `any` aceita ambos. O scope `matchingRemuneration()` fornece esse recorte e a Action o verifica novamente sob lock. A classificação não exige valores positivos, não preenche dados ausentes e não adapta a cláusula jurídica. Para o coordenador, o atestado usa automaticamente o template vigente disponível no campus, sem seletor de template.

A alteração de schema fica na Migration 13 original. Para o banco já existente, uma migration temporária adiciona a coluna sem recriar tabelas; a aplicação foi concluída em 19/10/2026 e o arquivo temporário foi removido conforme solicitação do responsável. Dados históricos e versões imutáveis são preservados. Novos uploads usam `DISCENTE_*`; não há alias `ALUNO_*` nem alteração de DOCX persistido.

## Compatibilidade dos marcadores

Os tipos continuam `main`, `addendum` e `orientation_certificate`. TCE, credenciamento, SEDUC, EMATER e rescisão são nomes de templates do tipo `main`. Todas as variáveis disponíveis no catálogo podem ser usadas em qualquer tipo ou classificação de remuneração. Essas classificações pertencem ao template e não filtram os marcadores.

Não há matriz mínima, obrigatoriedade de marcador, classificação de variáveis em obrigatórias/opcionais nem seleção adicional no upload. Um DOCX seguro pode ter qualquer subconjunto de variáveis disponíveis, inclusive nenhum marcador. A inspeção valida somente os marcadores presentes e a estrutura OOXML. O relatório registra nomes base detectados e expressões completas reconhecidas. Completude e conteúdo jurídico permanecem na revisão manual.

As duas colunas de classificação de variáveis foram removidas da Migration 14 original. No banco existente, a mudança é aplicada por migration temporária, sem fresh. Arquivos, hashes, estados e demais metadados são preservados; relatórios e auditorias históricos não são reescritos. A validação dos novos uploads usa o inspetor atual, sem reaplicar declarações antigas de obrigatoriedade.

## Correspondência com o SGE legado

A comparação usa o mapa local `app/Http/Controllers/Admin/InternshipDocumentController.php::getReplacements`, o serviço `app/Services/OrientationCertificateService.php::values`, sua Policy e os oito marcadores do arquivo local `resources/templates/atestado_orientacao_estagio_template.docx`, no repositório SGE-IFFarSA. Os templates remotos do Google Docs não foram acessados; não se declara equivalência do conteúdo jurídico ou layout desses arquivos.

Os 48 marcadores dos termos foram comparados: 47 têm equivalentes semânticos e o bloco de remuneração foi substituído por modelos separados. Esta tabela orienta a adaptação dos originais: o upload aceita somente o dialeto canônico `${NOME}`, sem conversão automática de `{{NOME}}` ou dos nomes antigos.

### Termos, credenciamento, rescisão e aditivo

| Marcador legado | Variável canônica |
| --- | --- |
| `{{NOME_ALUNO}}` | `${DISCENTE_NOME}` |
| `{{CURSO}}` | `${CURSO_NOME}` |
| `{{ANO/SEMESTRE}}` | `${DISCENTE_PERIODO}` |
| `{{EMAIL_ALUNO}}` | `${DISCENTE_EMAIL}` |
| `{{MATRICULA}}` | `${DISCENTE_MATRICULA}` |
| `{{TEL_ALUNO}}` | `${DISCENTE_TELEFONE}` |
| `{{NASC_ALUNO}}` | `${DISCENTE_NASCIMENTO}` |
| `{{CPF_ALUNO}}` | `${DISCENTE_CPF}` |
| `{{RG_ALUNO}}` | `${DISCENTE_RG}` |
| `{{ORGAO_EMISSOR}}` | `${DISCENTE_RG_ORGAO}` |
| `{{DATA_EMISSAO}}` | `${DISCENTE_RG_DATA_EMISSAO}` |
| `{{RUA_ALUNO}}` | `${DISCENTE_LOGRADOURO}` |
| `{{NUMCASA_ALUNO}}` | `${DISCENTE_NUMERO}` |
| `{{BAIRRO_ALUNO}}` | `${DISCENTE_BAIRRO}` |
| `{{CIDADE_ALUNO}}` | `${DISCENTE_CIDADE}` |
| `{{ESTADO_ALUNO}}` | `${DISCENTE_UF}` |
| `{{CEP_ALUNO}}` | `${DISCENTE_CEP}` |
| `{{NOME_EMPRESA}}` | `${CONCEDENTE_NOME}` |
| `{{CNPJ_OU_CPF}}` | `${CONCEDENTE_DOCUMENTO}` |
| `{{EMAIL_EMPRESA}}` | `${CONCEDENTE_EMAIL}` |
| `{{TEL_EMPRESA}}` | `${CONCEDENTE_TELEFONE}` |
| `{{AREA_ATUA}}` | `${CONCEDENTE_AREA_ATUACAO}` |
| `{{AREA}}` | `${ESTAGIO_SETOR}` |
| `{{RUA_EMPRESA}}` | `${CONCEDENTE_LOGRADOURO}` |
| `{{NUMLOCAL_EMPRESA}}` | `${CONCEDENTE_NUMERO}` |
| `{{BAIRRO_EMPRESA}}` | `${CONCEDENTE_BAIRRO}` |
| `{{CIDADE_EMPRESA}}` | `${CONCEDENTE_CIDADE}` |
| `{{ESTADO_EMPRESA}}` | `${CONCEDENTE_UF}` |
| `{{CEP_EMPRESA}}` | `${CONCEDENTE_CEP}` |
| `{{REPRESENTANTE}}` | `${CONCEDENTE_REPRESENTANTE_NOME}` |
| `{{CARGO_REP}}` | `${CONCEDENTE_REPRESENTANTE_CARGO}` |
| `{{HORAS CURSO}}` | `${ESTAGIO_CARGA_TOTAL}` |
| `{{HORAS_CURSO_EXTENSO}}` | `${ESTAGIO_CARGA_TOTAL_EXTENSO}` |
| `{{INICIO}}` | `${ESTAGIO_DATA_INICIO}` |
| `{{DATA_TERMINO}}` | `${ESTAGIO_DATA_TERMINO_PREVISTA}` |
| `{{MAIOR_CARGA}}` | `${ESTAGIO_CARGA_DIARIA_MAXIMA}` |
| `{{MAIOR_CARGA_EXTENSO}}` | `${ESTAGIO_CARGA_DIARIA_MAXIMA_EXTENSO}` |
| `{{HORAS_SEMANAIS}}` | `${ESTAGIO_CARGA_SEMANAL}` |
| `{{HORAS_SEMANAIS_EXTENSO}}` | `${ESTAGIO_CARGA_SEMANAL_EXTENSO}` |
| `{{ESPECIAL}}` | Sem equivalente: cláusula fixa no DOCX com ou sem remuneração; usar somente os marcadores dos valores. |
| `{{ORIENTADOR}}` | `${ORIENTADOR_NOME}` |
| `{{SUPERVISOR}}` | `${SUPERVISOR_NOME}` |
| `{{TEL_SUPERVISOR}}` | `${SUPERVISOR_TELEFONE}` |
| `{{EMAIL_SUPERVISOR}}` | `${SUPERVISOR_EMAIL}` |
| `{{CAMPO_RESPONSAVEL_LEGAL}}` | `${BLOCO_RESPONSAVEL_LEGAL}` |
| `{{ATIVIDADES}}` | `${ESTAGIO_ATIVIDADES}` |
| `{{CREDENCIAMENTO}}` | `${CONCEDENTE_PROCESSO_CREDENCIAMENTO}` |
| `{{DATA_ATUAL}}` | `${DOCUMENTO_DATA_EMISSAO_EXTENSO}` |

`CREDENCIAMENTO` era `internship.process_number`; o equivalente atual lê o número congelado em `granting_party_snapshot.credentialing_process_number`, inclusive correção específica do estágio. `DATA_TERMINO`/`FIM` correspondem à previsão contratual (`projected_end_date`), que não comprova conclusão efetiva. O bloco de responsável legal preserva sua condição. A remuneração passa a usar cláusula fixa em modelos separados; o marcador composto legado não é portado.

### Atestado de orientação

O legado exigia os oito valores abaixo. Essa correspondência é uma referência de migração; o SGE atual não exige sua presença no template. `LOCAL` significa nome da concedente, não cidade ou campus. `COORDENADOR` é o usuário que emite o atestado, autorizado pela Policy como coordenador titular ou substituto do curso; não significa sempre o titular nem o responsável do Setor. Por decisão do responsável, o atestado mantém a identificação e assinatura da coordenação do curso. Não haverá substituição genérica pelo nome ou vínculo de quem solicitar a geração no Setor de Estágio, nem variáveis `EMITENTE_*` nesta etapa.

| Marcador legado | Variável canônica |
| --- | --- |
| `${ORIENTADOR}` | `${ORIENTADOR_NOME}` |
| `${ESTUDANTE}` | `${DISCENTE_NOME}` |
| `${CURSO}` | `${CURSO_NOME}` |
| `${LOCAL}` | `${CONCEDENTE_NOME}` |
| `${INICIO}` | `${ESTAGIO_DATA_INICIO}` |
| `${FIM}` | `${ESTAGIO_DATA_TERMINO_PREVISTA}` |
| `${DATA_EMISSAO}` | `${DOCUMENTO_DATA_EMISSAO_EXTENSO}` |
| `${COORDENADOR}` | `${COORDENADOR_NOME}` |

Atenção ao homônimo: `DATA_EMISSAO` nos termos era a emissão do RG; no atestado era a data atual por extenso. Os nomes canônicos distinguem essas duas informações.

A revisão 7 do catálogo preserva a correspondência do atestado com `DISCENTE_*`, usa modelos separados por remuneração e aceita os modificadores documentados. Não inclui variável de numeração pública. Não modifica schema de variáveis nem relatório de versões já persistidas; novos uploads usam o catálogo atual, sem restrição por tipo ou remuneração. A emissão e o congelamento dos dados estão implementados, inclusive para o atestado.

## Catálogo canônico fechado

O guia do aplicativo usa o mesmo catálogo fixo do código (`TemplateVariableCatalog`, revisão 7). Exemplos abaixo são estáticos e fictícios; não há leitura de dados reais no guia. “Disponível” significa que o resolver possui fonte de domínio para o marcador; a autorização da emissão ainda pode restringir seu uso. “Reservada” é rejeitada no upload enquanto a fonte/contrato faltar. Nenhuma variável lê comprovante de emancipação, token, senha, log ou caminho privado.

Todos os valores resolvidos e os trechos transformados são congelados em `generated_documents.snapshot` na emissão. Snapshots existentes não são substituídos por cadastros atuais. Campus, curso e orientador ainda não possuem snapshot próprio no estágio; essa lacuna é explicitada por variável. Campos operacionais são congelados na emissão. Datas usam DateHelper; valores monetários CurrencyHelper/NumberToWordsHelper, decimais sem float.

### `${DOCUMENTO_DATA_EMISSAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Data de emissão |
| Tipo | date |
| Origem | Instante da emissão |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | dd/mm/aaaa |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 20/10/2026 |

### `${DOCUMENTO_DATA_EMISSAO_EXTENSO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Data de emissão por extenso |
| Tipo | date |
| Origem | Instante da emissão |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | DateHelper em pt_BR |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 20 de outubro de 2026 |

### `${DOCUMENTO_TITULO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do template lógico |
| Tipo | string |
| Origem | document_templates.name |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Termo de exemplo |

### `${CAMPUS_IDENTIFICACAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Identificação curta: Campus e cidade, com itálico somente em Campus |
| Tipo | rich_text |
| Origem | Literal Campus + campuses.address.city.name; não usa campuses.name |
| Snapshot | Na emissão, congelar o nome da cidade e os dois trechos textuais com seus estados de itálico; não reler a cidade atual em emissões históricas. |
| Formato | Campus em itálico + espaço + cidade em estilo normal; tamanho, fonte e negrito herdados do marcador |
| Sensibilidade | institucional |
| Condição | Campus com endereço e cidade definidos; todos os quatro modificadores de caixa são aceitos. |
| Vazio | Cidade ausente impede resolução; não produzir Campus isolado. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Campus Cidade Exemplo |

A representação é uma lista de dois trechos com `text` e `italic`, nunca HTML ou uma leitura de markup enviado pelo usuário. Cabeçalho usa `${CAMPUS_IDENTIFICACAO|MAIUSCULAS}` e identificação inferior usa `${CAMPUS_IDENTIFICACAO}` em tamanho menor. Em ambos, somente a palavra Campus é inclinada. A variável também substitui a identificação do campus no corpo do atestado. Nenhuma migration é necessária.

### `${CAMPUS_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do campus |
| Tipo | string |
| Origem | campuses.name |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Campus Exemplo |

### `${CAMPUS_CNPJ}`

| Atributo | Contrato |
| --- | --- |
| Descrição | CNPJ do campus |
| Tipo | string |
| Origem | campuses.cnpj |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | CNPJ formatado |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 00.000.000/0000-00 |

### `${CAMPUS_TELEFONE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Telefone do campus |
| Tipo | string |
| Origem | campuses.phone |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | telefone brasileiro |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | (00) 0000-0000 |

### `${CAMPUS_REPRESENTANTE_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Representante do campus |
| Tipo | string |
| Origem | campuses.legal_representative_name |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Pessoa Representante Fictícia |

### `${CAMPUS_REPRESENTANTE_CARGO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Cargo do representante |
| Tipo | string |
| Origem | campuses.legal_representative_position |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Direção de exemplo |

### `${CAMPUS_EMAIL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | E-mail do campus |
| Tipo | string |
| Origem | Não existe e-mail geral em `campuses`; `internship_office_email` identifica especificamente o Setor e não é origem deste marcador. Não inferir do vínculo operador. |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${CAMPUS_RESPONSAVEL_ESTAGIOS_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Signatário do Setor de Estágio |
| Tipo | string |
| Origem | Campo/configuração inexistente em campuses; não inferir do vínculo operador |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${CAMPUS_RESPONSAVEL_ESTAGIOS_CARGO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Cargo do signatário do Setor |
| Tipo | string |
| Origem | Campo/configuração inexistente em campuses; não inferir do vínculo operador |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${SEGURO_SEGURADORA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Seguro: seguradora |
| Tipo | string |
| Origem | campuses.insurance_company_name |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Seguro fictício |

### `${SEGURO_APOLICE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Seguro: apólice |
| Tipo | string |
| Origem | campuses.insurance_policy_number |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | EXEMPLO-000 |

### `${CAMPUS_ENDERECO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Endereço completo — campus |
| Tipo | string |
| Origem | campuses.address.street + number + neighborhood + city.name/state + zip_code |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | endereço brasileiro |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Rua Exemplo, 10, Bairro Fictício, Cidade Exemplo/RS, 00000-000 |

### `${CAMPUS_LOGRADOURO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Logradouro — campus |
| Tipo | string |
| Origem | campuses.address.street |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Rua Exemplo |

### `${CAMPUS_NUMERO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Número do endereço — campus |
| Tipo | string |
| Origem | campuses.address.number |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 10 |

### `${CAMPUS_BAIRRO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Bairro — campus |
| Tipo | string |
| Origem | campuses.address.neighborhood |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Bairro Fictício |

### `${CAMPUS_CIDADE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Cidade — campus |
| Tipo | string |
| Origem | campuses.address.city.name |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Cidade Exemplo |

### `${CAMPUS_UF}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Unidade federativa — campus |
| Tipo | string |
| Origem | campuses.address.city.state |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | sigla UF |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | RS |

### `${CAMPUS_CEP}`

| Atributo | Contrato |
| --- | --- |
| Descrição | CEP — campus |
| Tipo | string |
| Origem | campuses.address.zip_code |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | 00000-000 |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 00000-000 |

### `${DISCENTE_ENDERECO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Endereço completo — discente |
| Tipo | string |
| Origem | internships.studentAddress.street + number + neighborhood + city.name/state + zip_code |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | endereço brasileiro |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Rua Exemplo, 10, Bairro Fictício, Cidade Exemplo/RS, 00000-000 |

### `${DISCENTE_LOGRADOURO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Logradouro — discente |
| Tipo | string |
| Origem | internships.studentAddress.street |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Rua Exemplo |

### `${DISCENTE_NUMERO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Número do endereço — discente |
| Tipo | string |
| Origem | internships.studentAddress.number |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 10 |

### `${DISCENTE_BAIRRO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Bairro — discente |
| Tipo | string |
| Origem | internships.studentAddress.neighborhood |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Bairro Fictício |

### `${DISCENTE_CIDADE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Cidade — discente |
| Tipo | string |
| Origem | internships.studentAddress.city.name |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Cidade Exemplo |

### `${DISCENTE_UF}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Unidade federativa — discente |
| Tipo | string |
| Origem | internships.studentAddress.city.state |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | sigla UF |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | RS |

### `${DISCENTE_CEP}`

| Atributo | Contrato |
| --- | --- |
| Descrição | CEP — discente |
| Tipo | string |
| Origem | internships.studentAddress.zip_code |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | 00000-000 |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 00000-000 |

### `${CONCEDENTE_ENDERECO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Endereço completo — concedente |
| Tipo | string |
| Origem | internships.workplaceAddress.street + number + neighborhood + city.name/state + zip_code |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | endereço brasileiro |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Rua Exemplo, 10, Bairro Fictício, Cidade Exemplo/RS, 00000-000 |

### `${CONCEDENTE_LOGRADOURO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Logradouro — concedente |
| Tipo | string |
| Origem | internships.workplaceAddress.street |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Rua Exemplo |

### `${CONCEDENTE_NUMERO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Número do endereço — concedente |
| Tipo | string |
| Origem | internships.workplaceAddress.number |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 10 |

### `${CONCEDENTE_BAIRRO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Bairro — concedente |
| Tipo | string |
| Origem | internships.workplaceAddress.neighborhood |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Bairro Fictício |

### `${CONCEDENTE_CIDADE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Cidade — concedente |
| Tipo | string |
| Origem | internships.workplaceAddress.city.name |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Cidade Exemplo |

### `${CONCEDENTE_UF}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Unidade federativa — concedente |
| Tipo | string |
| Origem | internships.workplaceAddress.city.state |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | sigla UF |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | RS |

### `${CONCEDENTE_CEP}`

| Atributo | Contrato |
| --- | --- |
| Descrição | CEP — concedente |
| Tipo | string |
| Origem | internships.workplaceAddress.zip_code |
| Snapshot | Endereço histórico independente no estágio, quando DISCENTE/CONCEDENTE; campus é copiado na geração. Congelar partes resolvidas de cidade/UF; não usar endereço atual da pessoa/concedente. |
| Formato | 00000-000 |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 00000-000 |

### `${DISCENTE_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do discente |
| Tipo | string |
| Origem | internships.student_snapshot.name |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Discente Fictício |

### `${DISCENTE_EMAIL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | E-mail do vínculo discente |
| Tipo | string |
| Origem | internships.student_snapshot.email |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | e-mail |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | discente@example.invalid |

### `${DISCENTE_TELEFONE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Telefone do discente |
| Tipo | string |
| Origem | internships.student_snapshot.phone |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | telefone brasileiro |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | (00) 00000-0000 |

### `${DISCENTE_MATRICULA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Matrícula do discente |
| Tipo | string |
| Origem | internships.student_snapshot.registration_number |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | EXEMPLO000 |

### `${DISCENTE_PERIODO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Ano/semestre declarado |
| Tipo | string |
| Origem | internships.student_snapshot.student_year_semester |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 4º semestre |

### `${DISCENTE_NASCIMENTO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nascimento do discente |
| Tipo | date |
| Origem | internships.student_snapshot.birth_date |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | dd/mm/aaaa |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 01/01/2000 |

### `${DISCENTE_CPF}`

| Atributo | Contrato |
| --- | --- |
| Descrição | CPF do discente |
| Tipo | string |
| Origem | internships.student_snapshot.cpf |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | CPF formatado |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 000.000.000-00 |

### `${DISCENTE_RG}`

| Atributo | Contrato |
| --- | --- |
| Descrição | RG do discente |
| Tipo | string |
| Origem | internships.student_snapshot.rg |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | RG fictício |

### `${DISCENTE_RG_ORGAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Órgão emissor do RG |
| Tipo | string |
| Origem | internships.student_snapshot.rg_issuer |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Órgão de exemplo |

### `${DISCENTE_RG_DATA_EMISSAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Emissão do RG |
| Tipo | date |
| Origem | internships.student_snapshot.rg_issue_date |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | dd/mm/aaaa |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 01/01/2020 |

### `${CURSO_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do curso |
| Tipo | string |
| Origem | internships.course.name |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Curso de Exemplo |

### `${RESPONSAVEL_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do responsável legal |
| Tipo | string |
| Origem | internships.student_snapshot.legal_guardian_name |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Somente menor não emancipado; nunca expor prova de emancipação. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Responsável fictício |

### `${RESPONSAVEL_CPF}`

| Atributo | Contrato |
| --- | --- |
| Descrição | CPF do responsável legal |
| Tipo | string |
| Origem | internships.student_snapshot.legal_guardian_cpf |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | CPF formatado |
| Sensibilidade | pessoal |
| Condição | Somente menor não emancipado; nunca expor prova de emancipação. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 000.000.000-00 |

### `${RESPONSAVEL_PARENTESCO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Parentesco do responsável legal |
| Tipo | string |
| Origem | internships.student_snapshot.legal_guardian_kinship |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Somente menor não emancipado; nunca expor prova de emancipação. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Responsável fictício |

### `${RESPONSAVEL_EMAIL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | E-mail do responsável legal |
| Tipo | string |
| Origem | internships.student_snapshot.legal_guardian_email |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Somente menor não emancipado; nunca expor prova de emancipação. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Responsável fictício |

### `${BLOCO_RESPONSAVEL_LEGAL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Bloco de identificação do responsável |
| Tipo | string |
| Origem | internships.student_snapshot.legal_capacity_declaration e legal_guardian_* |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | bloco textual |
| Sensibilidade | pessoal |
| Condição | Somente menor não emancipado; maior/emancipado recebe bloco vazio. |
| Vazio | Vazio fora da condição; dentro dela dados ausentes impedem geração. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Representado por Responsável Fictício. |

### `${CONCEDENTE_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome/razão social |
| Tipo | string |
| Origem | internships.granting_party_snapshot.name |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Concedente Fictícia |

### `${CONCEDENTE_DOCUMENTO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | CPF/CNPJ da concedente |
| Tipo | string |
| Origem | internships.granting_party_snapshot.document_number + document_type |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | CPF/CNPJ formatado |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_EMAIL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | E-mail da concedente |
| Tipo | string |
| Origem | internships.granting_party_snapshot.email |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_TELEFONE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Telefone da concedente |
| Tipo | string |
| Origem | internships.granting_party_snapshot.phone |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_AREA_ATUACAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Área de atuação |
| Tipo | string |
| Origem | internships.granting_party_snapshot.field_of_activity |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_REPRESENTANTE_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Representante da concedente |
| Tipo | string |
| Origem | internships.granting_party_snapshot.representative_name |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_REPRESENTANTE_CARGO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Cargo do representante |
| Tipo | string |
| Origem | internships.granting_party_snapshot.representative_role |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_CONSELHO_PROFISSIONAL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Conselho profissional |
| Tipo | string |
| Origem | internships.granting_party_snapshot.professional_council |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_REGISTRO_CONSELHO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Registro no conselho |
| Tipo | string |
| Origem | internships.granting_party_snapshot.council_registration_number |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${CONCEDENTE_PROCESSO_CREDENCIAMENTO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Processo de credenciamento |
| Tipo | string |
| Origem | internships.granting_party_snapshot.credentialing_process_number |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal ou empresarial |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${COORDENADOR_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do coordenador emitente do atestado |
| Tipo | string |
| Origem | Vínculo ativo de coordenação emitente e seu user.name; courses.primary_coordinator_affiliation_id ou secondary_coordinator_affiliation_id |
| Snapshot | Na emissão, congelar nome e identificadores do usuário e vínculo emitente em generated_documents.snapshot. Não substituir pelo coordenador atual ao consultar emissão histórica. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Emitente autorizado como coordenador titular ou substituto do curso do estágio, no mesmo campus. Não escolher automaticamente o titular nem o responsável do Setor. |
| Vazio | Valor ausente bloqueia a emissão se o marcador estiver presente. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Coordenador Fictício |

### `${ORIENTADOR_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do orientador |
| Tipo | string |
| Origem | internships.advisorAffiliation.user.name |
| Snapshot | Não há advisor_snapshot. Congelar os valores resolvidos do orientador referenciado na emissão; não reler seu cadastro para reproduzir o documento. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Orientador Fictício |

### `${ORIENTADOR_EMAIL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | E-mail do orientador |
| Tipo | string |
| Origem | internships.advisorAffiliation.email |
| Snapshot | Não há advisor_snapshot. Congelar os valores resolvidos do orientador referenciado na emissão; não reler seu cadastro para reproduzir o documento. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${ORIENTADOR_MATRICULA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Matrícula do orientador |
| Tipo | string |
| Origem | internships.advisorAffiliation.registration_number |
| Snapshot | Não há advisor_snapshot. Congelar os valores resolvidos do orientador referenciado na emissão; não reler seu cadastro para reproduzir o documento. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${SUPERVISOR_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nome do supervisor |
| Tipo | string |
| Origem | internships.supervisor_snapshot.name |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Qualificação conforme ramo acadêmico/profissional congelado; ramo não aplicável vazio. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Supervisor Fictício |

### `${SUPERVISOR_EMAIL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | E-mail do supervisor |
| Tipo | string |
| Origem | internships.supervisor_snapshot.email |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Qualificação conforme ramo acadêmico/profissional congelado; ramo não aplicável vazio. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${SUPERVISOR_TELEFONE}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Telefone do supervisor |
| Tipo | string |
| Origem | internships.supervisor_snapshot.phone |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Qualificação conforme ramo acadêmico/profissional congelado; ramo não aplicável vazio. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${SUPERVISOR_CARGO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Cargo do supervisor |
| Tipo | string |
| Origem | internships.supervisor_snapshot.job_role |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Qualificação conforme ramo acadêmico/profissional congelado; ramo não aplicável vazio. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${SUPERVISOR_QUALIFICACAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Qualificação aprovada |
| Tipo | string |
| Origem | internships.supervisor_snapshot.has_academic_background + training_course + education_level + experience_time |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Qualificação conforme ramo acadêmico/profissional congelado; ramo não aplicável vazio. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${SUPERVISOR_FORMACAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Formação aprovada |
| Tipo | string |
| Origem | internships.supervisor_snapshot.training_course + education_level |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Qualificação conforme ramo acadêmico/profissional congelado; ramo não aplicável vazio. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${SUPERVISOR_EXPERIENCIA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Experiência aprovada |
| Tipo | string |
| Origem | internships.supervisor_snapshot.experience_time |
| Snapshot | Preservar o snapshot histórico indicado; copiar o valor resolvido para generated_documents.snapshot na emissão. |
| Formato | texto |
| Sensibilidade | pessoal |
| Condição | Qualificação conforme ramo acadêmico/profissional congelado; ramo não aplicável vazio. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Exemplo fictício |

### `${ESTAGIO_TIPO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Tipo de estágio |
| Tipo | string |
| Origem | internships.internship_type_snapshot.name |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | texto |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Estágio de Exemplo |

### `${ESTAGIO_SETOR}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Setor de realização |
| Tipo | string |
| Origem | internships.internship_sector |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | texto |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Setor de exemplo |

### `${ESTAGIO_ATIVIDADES}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Atividades aprovadas |
| Tipo | text |
| Origem | internships.activities |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | texto multilinha |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Atividade fictícia aprovada. |

### `${ESTAGIO_DATA_INICIO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Data de início |
| Tipo | date |
| Origem | internships.planned_start_date |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | dd/mm/aaaa |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 20/10/2026 |

### `${ESTAGIO_DATA_TERMINO_PREVISTA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Término previsto vigente |
| Tipo | date |
| Origem | internships.projected_end_date |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | dd/mm/aaaa |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 20/12/2026 |

### `${ESTAGIO_CARGA_TOTAL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Carga total exigida |
| Tipo | integer |
| Origem | internships.internship_type_snapshot.rules.required_hours |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | horas inteiras |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 200 |

### `${ESTAGIO_CARGA_TOTAL_EXTENSO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Carga total por extenso |
| Tipo | integer |
| Origem | internships.internship_type_snapshot.rules.required_hours |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | NumberToWordsHelper |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | duzentas |

### `${ESTAGIO_CARGA_DIARIA_MAXIMA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Maior jornada diária vigente |
| Tipo | integer |
| Origem | internships.weekly_hours / workSchedules.weekly_hours |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | horas inteiras |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 6 |

### `${ESTAGIO_CARGA_DIARIA_MAXIMA_EXTENSO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Jornada diária por extenso |
| Tipo | integer |
| Origem | internships.weekly_hours / workSchedules.weekly_hours |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | NumberToWordsHelper |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | seis |

### `${ESTAGIO_CARGA_SEMANAL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Soma semanal vigente |
| Tipo | integer |
| Origem | internships.weekly_hours / workSchedules.weekly_hours |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | horas inteiras |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 30 |

### `${ESTAGIO_CARGA_SEMANAL_EXTENSO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Carga semanal por extenso |
| Tipo | integer |
| Origem | internships.weekly_hours / workSchedules.weekly_hours |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | NumberToWordsHelper |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | trinta |

### `${ESTAGIO_JORNADA_DESCRICAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Descrição da jornada por dia |
| Tipo | text |
| Origem | internships.weekly_hours / workSchedules.weekly_hours |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | texto por dia |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Segunda a sexta: seis horas por dia. |

### `${ESTAGIO_REMUNERADO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Existência de remuneração |
| Tipo | boolean |
| Origem | internships.is_remunerated |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | Sim/Não |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | Sim |

### `${ESTAGIO_BOLSA_VALOR}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Bolsa de estágio |
| Tipo | decimal |
| Origem | internships.grant_value |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | CurrencyHelper em BRL |
| Sensibilidade | acadêmico/financeiro |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | R$ 1.000,00 |

### `${ESTAGIO_BOLSA_EXTENSO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Bolsa por extenso |
| Tipo | decimal |
| Origem | internships.grant_value |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | NumberToWordsHelper em BRL |
| Sensibilidade | acadêmico/financeiro |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | mil reais |

### `${ESTAGIO_AUXILIO_TRANSPORTE_VALOR}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Auxílio-transporte |
| Tipo | decimal |
| Origem | internships.transportation_allowance |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | CurrencyHelper em BRL |
| Sensibilidade | acadêmico/financeiro |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | R$ 100,00 |

### `${ESTAGIO_AUXILIO_TRANSPORTE_EXTENSO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Auxílio por extenso |
| Tipo | decimal |
| Origem | internships.transportation_allowance |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | NumberToWordsHelper em BRL |
| Sensibilidade | acadêmico/financeiro |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | cem reais |

### `${ESTAGIO_PROTOCOLO_SIGAA}`

Marcador antigo, indisponível para novas emissões a partir da revisão 8 do catálogo. O protocolo não pertence ao estágio nem é retornado pelo SIGAA: cada documento recebe seu protocolo no cadastro no SIPAC, depois da geração. O campo opcional `generated_documents.protocol_number` é mantido pelo Setor no registro documental e pode acompanhar o aviso de assinatura. Não há novo marcador de protocolo para a geração inicial. Valores e substituições de snapshots históricos são preservados para reprodução do documento original.

### `${ESTAGIO_PERIODO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Período do estágio |
| Tipo | string |
| Origem | internships.planned_start_date + projected_end_date |
| Snapshot | Preservar internship_type_snapshot; congelar valores operacionais e vigência usada na emissão. Dinheiro decimal, nunca float. |
| Formato | dd/mm/aaaa a dd/mm/aaaa |
| Sensibilidade | acadêmico |
| Condição | Usar vigência correspondente ao documento; remuneração somente quando aplicável. Previsão não equivale a término efetivo. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 20/10/2026 a 20/12/2026 |

### `${ESTAGIO_NOTA_SUPERVISOR}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nota do supervisor |
| Tipo | decimal |
| Origem | internships.supervisor_grade |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | decimal com uma casa, escala congelada |
| Sensibilidade | acadêmico |
| Condição | Somente nota aprovada/lançada; ausente não equivale a zero. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 8,0 |

### `${ESTAGIO_NOTA_RELATORIO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nota do relatório |
| Tipo | decimal |
| Origem | internships.report_grade |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | decimal com uma casa, escala congelada |
| Sensibilidade | acadêmico |
| Condição | Somente nota aprovada/lançada; ausente não equivale a zero. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 8,0 |

### `${ESTAGIO_NOTA_APRESENTACAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nota da apresentação |
| Tipo | decimal |
| Origem | internships.presentation_grade |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | decimal com uma casa, escala congelada |
| Sensibilidade | acadêmico |
| Condição | Somente nota aprovada/lançada; ausente não equivale a zero. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 8,0 |

### `${ESTAGIO_NOTA_FINAL}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Nota consolidada |
| Tipo | decimal |
| Origem | internships.consolidated_grade |
| Snapshot | Congelar na emissão; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | decimal com uma casa, escala congelada |
| Sensibilidade | acadêmico |
| Condição | Somente nota aprovada/lançada; ausente não equivale a zero. |
| Vazio | Se o marcador estiver presente, valor ausente bloqueia a emissão, salvo as exceções de vazio documentadas no fluxo; não se presume zero. |
| Disponibilidade | Disponível para template |
| Exemplo fictício | 8,0 |

### `${ADITIVO_NUMERO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Número do aditivo |
| Tipo | string |
| Origem | Sem sequência de aditivos no domínio |
| Snapshot | Congelar na futura geração; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Valor ausente será tratado pela resolução futura, sem exigir presença do marcador e sem presumir zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${ADITIVO_VIGENCIA_INICIO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Início do aditivo |
| Tipo | string |
| Origem | workSchedules.starts_on só existe após aditivo assinado; falta contexto de emissão aprovado |
| Snapshot | Congelar na futura geração; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Valor ausente será tratado pela resolução futura, sem exigir presença do marcador e sem presumir zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${ADITIVO_DESCRICAO_ALTERACAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Mudanças do aditivo |
| Tipo | string |
| Origem | Sem registro estruturado de mudanças aprovadas para emissão |
| Snapshot | Congelar na futura geração; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Valor ausente será tratado pela resolução futura, sem exigir presença do marcador e sem presumir zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${RESCISAO_DATA_EFETIVA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Data efetiva de rescisão |
| Tipo | string |
| Origem | Sem contexto de emissão aprovado com data efetiva de rescisão |
| Snapshot | Congelar na futura geração; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Valor ausente será tratado pela resolução futura, sem exigir presença do marcador e sem presumir zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${RESCISAO_JUSTIFICATIVA}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Justificativa de rescisão |
| Tipo | string |
| Origem | Sem contrato que vincule o pedido de cancelamento aprovado à emissão da rescisão |
| Snapshot | Congelar na futura geração; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Valor ausente será tratado pela resolução futura, sem exigir presença do marcador e sem presumir zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${RESCISAO_SOLICITANTE_NOME}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Solicitante da rescisão |
| Tipo | string |
| Origem | Sem contrato que vincule o pedido de cancelamento aprovado à emissão da rescisão |
| Snapshot | Congelar na futura geração; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Valor ausente será tratado pela resolução futura, sem exigir presença do marcador e sem presumir zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

### `${ATESTADO_CARGA_ORIENTACAO}`

| Atributo | Contrato |
| --- | --- |
| Descrição | Carga institucional de orientação |
| Tipo | string |
| Origem | Sem regra institucional de carga de orientação |
| Snapshot | Congelar na futura geração; não existe snapshot deste dado no estágio. Nunca atualizar documento anterior. |
| Formato | texto |
| Sensibilidade | institucional |
| Condição | Dado preenchido no contexto autorizado. |
| Vazio | Valor ausente será tratado pela resolução futura, sem exigir presença do marcador e sem presumir zero. |
| Disponibilidade | Reservada; upload rejeitado |
| Exemplo fictício | Exemplo fictício |

## Emissão, histórico e reprodução

`GenerateInternshipDocument` revalida vínculo ativo selecionado, campus, curso, estágio, tipo, remuneração e versão vigente dentro de transação com locks. Um token UUID e um advisory lock do PostgreSQL impedem duas emissões para a mesma tentativa. Reutilizar o token com outro contexto é recusado; uma nova emissão recebe outro token.

`GeneratedDocumentSnapshot` resolve somente os marcadores presentes. Um dado ausente bloqueia a emissão com o nome da variável, sem presumir zero. Responsável legal de discente que não necessita dele e a alternativa não aplicável de formação/experiência do supervisor podem ficar vazios. Dados históricos vêm dos snapshots do estágio; campus, curso e orientador são resolvidos na emissão e congelados para aquela ocorrência. Valores monetários usam `CurrencyHelper::formatDecimal()` e `NumberToWordsHelper`, sem float. O espaço inseparável entre R$ e o valor pode aparecer sombreado no editor; não é um fundo de impressão.

O snapshot registra revisão de schema, catálogo e motor, identificação do template, campus e emitente, valores base e trechos transformados por expressão. O registro preserva também versão, hash do original, nome legível do download e instante da emissão; o snapshot guarda o SHA-256 do DOCX preenchido. Dados do snapshot não são copiados para o Activity Log.

Baixar novamente reconstrói o DOCX com a mesma versão e os mesmos valores/revisão, confere seu SHA-256 contra o resultado original e recusa divergências. Não consulta cadastros atuais para atualizar a emissão e não cria outro registro. A imutabilidade de reprodução aplica-se ao DOCX; o PDF é uma conversão sob demanda, sem promessa de identidade binária entre conversões. Manter suporte às revisões antigas e controlar mudanças de dependências é necessário para reproduzir emissões históricas.

O coordenador titular ou substituto só emite atestados de seus cursos no próprio campus. O modal pede apenas o formato. A resolução limita os marcadores ao contexto autorizado: identificação de campus, discente, curso, concedente, orientador, coordenação e período. Marcadores disponíveis no catálogo geral podem ser recusados neste contexto restrito. O Setor emite os demais tipos, mantém os templates e pode consultar o histórico do campus; não emite atestado em nome da coordenação.

Cada atestado também preserva snapshot e versão, pode ser baixado novamente e não participa do fluxo de assinatura. O Setor pode cancelar uma emissão ainda em `generated`, com motivo, preservando seus dados e a possibilidade de consulta/download autorizado. Documentos cancelados ou assinados não têm o ciclo reaberto. Uma devolução para correção cancela os documentos de formalização gerados ou aguardando assinatura, preservando atestados e documentos já assinados.

A consulta do template mostra a quantidade de emissões de todas as versões e a quantidade individual por arquivo, inclusive emissões canceladas. Repetir o download não aumenta essas contagens. Após uso, o template lógico e a versão utilizada não podem ser excluídos, mesmo que a emissão seja cancelada; correções exigem nova versão. As regras existentes de exclusão de versões nunca usadas permanecem.

## Arquivos temporários e PDF

O motor grava em `storage/app/private/generated-documents-tmp`, com diretório privado gravável pelo usuário da aplicação e arquivo com permissão 0600. A geração inicial apaga seu DOCX em `finally`. No download, o sistema reconstrói o DOCX; se solicitado PDF, envia esse arquivo ao conversor privado, apaga o intermediário e transmite o resultado. A transmissão remove o arquivo em `finally`, inclusive em falha ou desconexão. `documents:prune-temporary` remove órfãos DOCX/PDF com mais de uma hora e lock exclusivo disponível, a cada hora pelo scheduler.

A rota autenticada confere a relação documento/estágio e a Policy em cada download. Respostas usam nome legível, MIME e extensão do formato, cache privado sem armazenamento e `nosniff`. A auditoria distingue transmissão concluída e falha, com formato e contexto institucional; transmissão concluída pelo servidor não comprova que o usuário salvou ou abriu o arquivo.

O serviço `gotenberg` usa a imagem `gotenberg/gotenberg:8.38.1-libreoffice`, sem porta publicada e em rede interna compartilhada somente com a aplicação. `config/documents.php` usa `DOCUMENT_PDF_CONVERTER_URL`, com padrão `http://gotenberg:3000`, timeout de conexão de 5 segundos e de requisição de 100 segundos. O serviço limita requisições a 25 MB e 90 segundos. Em produção, disponibilizar um conversor privado equivalente; falha de conversão não elimina a emissão, que pode ser baixada novamente em DOCX ou PDF pelo histórico.

A conversão exporta o DOCX pelo LibreOffice, sem reconstrução por HTML. Fontes ausentes são substituídas pelo conversor; Arial e Times New Roman atualmente usam Liberation Sans e Liberation Serif. Os nove modelos adaptados mantiveram a paginação na conferência, mas foram observadas pequenas diferenças de espaçamento entre versões do LibreOffice. Identidade visual absoluta com qualquer Word/LibreOffice não está garantida. Controlar fontes e versão do conversor e revisar visualmente novos modelos continua necessário.

## Adaptação dos modelos legados

Os modelos de TCE, credenciamento, SEDUC, EMATER, aditivo da cláusula terceira e rescisão foram adaptados ao catálogo canônico; TCE e credenciamento possuem variantes com e sem remuneração. Com o atestado, são nove arquivos no diretório de trabalho `templates`, externo aos repositórios do sistema e da documentação. Os originais de `4.0` foram preservados. Esses arquivos não são importados automaticamente: o Setor deve cadastrar ou enviar a nova versão e conferir a vigência.

Credenciamento teve duplicações removidas; rescisão teve tabelas reconstruídas; o atestado teve quebras manuais de texto corrigidas e mantém a data por extenso. Os marcadores de parágrafo §1º e seguintes usam negrito. Campos sem fonte disponível, como data efetiva/justificativa de rescisão e sequência específica de aditivo, não ganharam variáveis fictícias; permanecem para preenchimento manual quando necessário. Conteúdo jurídico exige revisão institucional.

## Pendências

- Aprovar o texto jurídico de remuneração e a completude jurídica dos modelos.
- Definir fontes para as variáveis reservadas, sequência/mudanças de aditivo e contexto de emissão da rescisão antes de disponibilizá-las.
- Implementar assinatura, avisos aos interessados, registro operacional de documentos externos e integração com a liberação do estágio.
- Revalidar reprodução histórica ao atualizar motor/dependências e conferir fontes/layout de cada novo modelo; fidelidade visual absoluta do PDF permanece uma limitação.
- Verificações da geração: Pint, sintaxe, análise estática direcionada, compilação/renderização dos modais e conversões reais com dados fictícios. Os nove modelos passaram pelo inspetor sem erros ou avisos. Não foram criados nem executados testes por solicitação do responsável; essas conferências não substituem cobertura funcional de concorrência e autorização.

## Visualização do original

A ação Visualizar abre um modal com prévia HTML aproximada do DOCX original, mantendo os marcadores sem preenchimento. A rota é autenticada e restrita ao vínculo autorizado do mesmo campus; versão de outro catálogo não pode ser consultada pela URL. O original é verificado por hash/tamanho e inspeção de segurança antes da leitura, sem alterar registros, arquivo ou vigência. Não são criados PDFs, DOCXs preenchidos ou cópias persistentes.

A prévia usa DOM/ZIP já instalados, sem dependências adicionais ou envio a serviços externos. Mostra texto, tabelas, imagens PNG/JPEG/GIF, cabeçalho/rodapé e formatação básica. Não reproduz a paginação do Word, fontes incorporadas, objetos flutuantes, listas automáticas ou todos os detalhes de layout. A interface informa essa limitação e mantém o download do original. Conteúdo excessivamente grande/complexo recebe mensagem em vez de renderização ilimitada.

A resposta é privada e sem cache, em iframe com sandbox e CSP que bloqueia scripts, navegação por links, formulários e carregamento externo. Texto é escapado; estilos usam propriedades/valores limitados e imagens são incorporadas como dados. O servidor não acessa links nem instala fontes.
