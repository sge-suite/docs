---
title: SGE — Geração de documentos DOCX e variáveis
description: Arquitetura da geração DOCX, validação de templates e catálogo canônico de variáveis.
type: integration-contract
status: defined
tags:
  - sge/documentos
  - sge/templates
  - sge/integracoes
aliases:
  - Catálogo de variáveis dos documentos
  - Geração DOCX
---
## Decisão técnica

O arquivo DOCX versionado será processado localmente com `PhpOffice\PhpWord\TemplateProcessor`. A dependência `phpoffice/phpword` deverá ser direta no `composer.json`; a imagem de execução precisa das extensões `zip`, `xml`, `dom`, `mbstring` e `intl`. `brick/math` também será dependência direta porque o código de moeda o utiliza, ainda que Laravel já o instale transitivamente.

O marcador canônico é `${NOME_DA_VARIAVEL}`: letras maiúsculas, números e `_`, sem espaços, barras, acentos ou chaves duplas. Somente essa sintaxe será aceita nos templates cadastrados.

## Componentes

| Componente | Responsabilidade |
| --- | --- |
| `TemplateVariableCatalog` | Define nomes permitidos, tipo, sensibilidade, origem e formatação. |
| `TemplateInspector` | Lê o DOCX como ZIP/XML e encontra variáveis inclusive em tabelas, cabeçalhos e rodapés. |
| `TemplateValidator` | Rejeita variável desconhecida, obrigatória ausente, arquivo inválido e conteúdo inseguro. |
| `DocumentSnapshotBuilder` | Carrega FKs e snapshots do estágio e produz um contexto imutável. |
| `DocumentVariableResolver` | Resolve somente as variáveis declaradas pela versão do template. |
| `RemunerationParagraphFormatter` | Produz o texto completo de `${PARAGRAFO_REMUNERACAO}`. |
| `DocxDocumentGenerator` | Aplica valores no template, verifica sobras e salva em arquivo temporário privado. |
| `GenerateInternshipDocument` | Autoriza, bloqueia concorrência, registra snapshot/status e entrega o arquivo. |

Helpers continuam restritos a formatação pura (`CurrencyHelper`, `NumberToWordsHelper`, datas e documentos). Regra jurídica, consulta ao banco, autorização e persistência pertencem aos serviços/Actions acima.

## Fluxo de geração

1. o Setor escolhe um template lógico e uma versão ativa compatível com o campus e o tipo documental;
2. a Policy valida o vínculo ativo e o estágio;
3. a Action adquire lock por estágio, versão e token idempotente;
4. o builder carrega o contexto histórico, sem usar cadastro atual no lugar de snapshot já congelado;
5. o resolver produz somente as variáveis declaradas no schema da versão;
6. o gerador preenche uma cópia privada e temporária do DOCX;
7. uma inspeção final rejeita qualquer `${...}` restante;
8. após geração bem-sucedida, `generated_documents` registra template, hash, nome de saída e snapshot dos valores;
9. o arquivo é transmitido ao usuário autorizado e apagado em `finally`;
10. nova emissão cria novo registro; um retry com o mesmo token não duplica a geração.

Geração unitária será síncrona para permitir download imediato sem armazenamento definitivo. Lotes futuros poderão usar Job, mas o resultado permanecerá em armazenamento temporário privado com prazo curto e limpeza automática. DOCX/PDF final e documento assinado não são acervo do SGE.

## Validação e segurança do upload

- aceitar apenas `.docx` OOXML; rejeitar `.docm`, OLE e executáveis embutidos;
- validar MIME, assinatura ZIP, tamanho total, quantidade e tamanho descompactado das entradas;
- rejeitar relacionamentos externos, links de template remoto e macros;
- calcular SHA-256 e impedir duplicata acidental dentro do mesmo template;
- extrair variáveis de corpo, tabelas, cabeçalhos, rodapés, notas e caixas de texto suportadas;
- rejeitar variáveis fora do catálogo e variáveis obrigatórias do schema que não estejam no arquivo;
- registrar relatório de validação e impedir ativação enquanto houver erro;
- gerar com dados fictícios, renderizar e exigir confirmação visual do Setor antes da ativação;
- nunca incluir o comprovante de emancipação, tokens, senhas, logs ou metadados internos no contexto documental.

## Catálogo de variáveis

Cada versão declara quais itens abaixo são obrigatórios ou opcionais. Uma variável conhecida não se torna automaticamente disponível em todo template: o tipo de documento e a Policy limitam o contexto.

### Documento e instituição

| Variável | Origem/formato |
| --- | --- |
| `${DOCUMENTO_NUMERO}` | identificador público da geração, quando aplicável. |
| `${DOCUMENTO_DATA_EMISSAO}` | data da geração em `dd/mm/aaaa`. |
| `${DOCUMENTO_DATA_EMISSAO_EXTENSO}` | data por extenso em `pt_BR`. |
| `${DOCUMENTO_TITULO}` | nome lógico aprovado da versão. |
| `${CAMPUS_NOME}` | snapshot do campus. |
| `${CAMPUS_CNPJ}` | CNPJ formatado. |
| `${CAMPUS_EMAIL}` / `${CAMPUS_TELEFONE}` | contatos institucionais. |
| `${CAMPUS_ENDERECO}` | endereço composto. |
| `${CAMPUS_LOGRADOURO}` / `${CAMPUS_NUMERO}` / `${CAMPUS_BAIRRO}` | partes do endereço. |
| `${CAMPUS_CIDADE}` / `${CAMPUS_UF}` / `${CAMPUS_CEP}` | localidade formatada. |
| `${CAMPUS_REPRESENTANTE_NOME}` | pessoa representante no snapshot da geração. |
| `${CAMPUS_REPRESENTANTE_CARGO}` | cargo institucional no vínculo/snapshot. |
| `${CAMPUS_RESPONSAVEL_ESTAGIOS_NOME}` | signatário institucional configurado para o documento. |
| `${CAMPUS_RESPONSAVEL_ESTAGIOS_CARGO}` | cargo exibido do signatário. |
| `${SEGURO_SEGURADORA}` / `${SEGURO_APOLICE}` | configuração institucional vigente, congelada na geração. |

### Discente, curso e responsável

| Variável | Origem/formato |
| --- | --- |
| `${ALUNO_NOME}` | `student_snapshot.name`. |
| `${ALUNO_EMAIL}` / `${ALUNO_TELEFONE}` | contatos do snapshot. |
| `${ALUNO_MATRICULA}` | matrícula do vínculo discente. |
| `${ALUNO_PERIODO}` | ano/semestre declarado e validado. |
| `${ALUNO_NASCIMENTO}` | `dd/mm/aaaa`. |
| `${ALUNO_CPF}` / `${ALUNO_RG}` | documentos formatados. |
| `${ALUNO_RG_ORGAO}` / `${ALUNO_RG_DATA_EMISSAO}` | emissor e data. |
| `${ALUNO_ENDERECO}` | endereço completo do snapshot. |
| `${ALUNO_LOGRADOURO}` / `${ALUNO_NUMERO}` / `${ALUNO_BAIRRO}` | partes do endereço. |
| `${ALUNO_CIDADE}` / `${ALUNO_UF}` / `${ALUNO_CEP}` | localidade formatada. |
| `${CURSO_NOME}` | curso do estágio. |
| `${RESPONSAVEL_NOME}` / `${RESPONSAVEL_CPF}` | somente para menor não emancipado. |
| `${RESPONSAVEL_PARENTESCO}` / `${RESPONSAVEL_EMAIL}` | dados do responsável legal. |
| `${BLOCO_RESPONSAVEL_LEGAL}` | bloco completo ou vazio; emancipação validada não expõe comprovante. |

### Parte concedente

| Variável | Origem/formato |
| --- | --- |
| `${CONCEDENTE_NOME}` | `granting_party_snapshot.name`. |
| `${CONCEDENTE_DOCUMENTO}` | CPF/CNPJ formatado conforme o tipo. |
| `${CONCEDENTE_EMAIL}` / `${CONCEDENTE_TELEFONE}` | contatos do snapshot. |
| `${CONCEDENTE_AREA_ATUACAO}` | área de atuação. |
| `${CONCEDENTE_ENDERECO}` | endereço completo. |
| `${CONCEDENTE_LOGRADOURO}` / `${CONCEDENTE_NUMERO}` / `${CONCEDENTE_BAIRRO}` | partes do endereço. |
| `${CONCEDENTE_CIDADE}` / `${CONCEDENTE_UF}` / `${CONCEDENTE_CEP}` | localidade formatada. |
| `${CONCEDENTE_REPRESENTANTE_NOME}` | representante legal. |
| `${CONCEDENTE_REPRESENTANTE_CARGO}` | cargo do representante. |
| `${CONCEDENTE_CONSELHO_PROFISSIONAL}` | vazio quando não houver. |
| `${CONCEDENTE_REGISTRO_CONSELHO}` | vazio quando não houver. |
| `${CONCEDENTE_PROCESSO_CREDENCIAMENTO}` | obrigatório apenas no modelo que o exigir. |

### Orientação e supervisão

| Variável | Origem/formato |
| --- | --- |
| `${ORIENTADOR_NOME}` / `${ORIENTADOR_EMAIL}` | snapshot do vínculo orientador. |
| `${ORIENTADOR_MATRICULA}` | matrícula institucional, se exigida. |
| `${SUPERVISOR_NOME}` | `supervisor_snapshot.name`. |
| `${SUPERVISOR_EMAIL}` / `${SUPERVISOR_TELEFONE}` | contatos do snapshot. |
| `${SUPERVISOR_CARGO}` | cargo/função na concedente. |
| `${SUPERVISOR_QUALIFICACAO}` | qualificação declarada e aprovada. |
| `${SUPERVISOR_FORMACAO}` / `${SUPERVISOR_EXPERIENCIA}` | opcionais conforme o documento. |

### Estágio, jornada e remuneração

| Variável | Origem/formato |
| --- | --- |
| `${ESTAGIO_TIPO}` | nome do tipo congelado. |
| `${ESTAGIO_SETOR}` | setor/área de realização. |
| `${ESTAGIO_ATIVIDADES}` | texto do plano de atividades. |
| `${ESTAGIO_DATA_INICIO}` | `dd/mm/aaaa`. |
| `${ESTAGIO_DATA_TERMINO_PREVISTA}` | resultado vigente do cálculo. |
| `${ESTAGIO_CARGA_TOTAL}` / `${ESTAGIO_CARGA_TOTAL_EXTENSO}` | horas exigidas. |
| `${ESTAGIO_CARGA_DIARIA_MAXIMA}` / `${ESTAGIO_CARGA_DIARIA_MAXIMA_EXTENSO}` | maior jornada diária da vigência usada. |
| `${ESTAGIO_CARGA_SEMANAL}` / `${ESTAGIO_CARGA_SEMANAL_EXTENSO}` | soma semanal da vigência usada. |
| `${ESTAGIO_JORNADA_DESCRICAO}` | descrição por dia da semana, pronta para bloco textual. |
| `${ESTAGIO_REMUNERADO}` | `Sim` ou `Não`; usar apenas quando o modelo realmente pedir. |
| `${ESTAGIO_BOLSA_VALOR}` / `${ESTAGIO_BOLSA_EXTENSO}` | moeda BRL e valor por extenso. |
| `${ESTAGIO_AUXILIO_TRANSPORTE_VALOR}` / `${ESTAGIO_AUXILIO_TRANSPORTE_EXTENSO}` | moeda BRL e valor por extenso. |
| `${PARAGRAFO_REMUNERACAO}` | §1º completo e descritivo; substitui definitivamente `ESPECIAL`. |
| `${ESTAGIO_PROTOCOLO_SIGAA}` | protocolo, quando já existir e o documento permitir. |

### Aditivo e rescisão

| Variável | Origem/formato |
| --- | --- |
| `${ADITIVO_NUMERO}` | sequência do aditivo dentro do estágio. |
| `${ADITIVO_VIGENCIA_INICIO}` | data em que a alteração passa a valer. |
| `${ADITIVO_DESCRICAO_ALTERACAO}` | texto produzido a partir das mudanças aprovadas. |
| `${RESCISAO_DATA_EFETIVA}` | data aprovada no pedido de cancelamento. |
| `${RESCISAO_JUSTIFICATIVA}` | motivo aprovado, sem texto fixo no template. |
| `${RESCISAO_SOLICITANTE_NOME}` | pessoa/parte que solicitou, quando exigido. |

### Atestado de orientação e notas

| Variável | Origem/formato |
| --- | --- |
| `${ESTAGIO_NOTA_SUPERVISOR}` | nota aprovada na escala de seu peso. |
| `${ESTAGIO_NOTA_RELATORIO}` / `${ESTAGIO_NOTA_APRESENTACAO}` | contribuições lançadas pelo orientador. |
| `${ESTAGIO_NOTA_FINAL}` | soma consolidada de 0 a 10. |
| `${ESTAGIO_PERIODO}` | início e término formatados em uma expressão. |
| `${ATESTADO_CARGA_ORIENTACAO}` | somente se existir regra institucional própria. |

## Parágrafo de remuneração

Não existe variável `${ESPECIAL}`. `${PARAGRAFO_REMUNERACAO}` recebe o parágrafo completo e é resolvida por regra de domínio:

- não remunerado: texto institucional informando ausência de bolsa e auxílio-transporte;
- remunerado: texto institucional com bolsa e auxílio-transporte, cada valor em BRL e por extenso;
- ausência de auxílio: usar o texto aprovado para zero/ausência, sem produzir `R$ 0,00` por acidente;
- valores são `decimal`/`BigDecimal`, nunca `float`;
- o texto efetivamente usado entra no snapshot da geração.

O texto jurídico deve ser aprovado uma vez pela instituição e coberto por teste de snapshot. O discente não edita o parágrafo.

## Dados obrigatórios por template

A versão armazena `required_variables` e `optional_variables`. Na geração, valor vazio em variável obrigatória interrompe o processo e informa os campos faltantes. Variável opcional vazia vira string vazia ou bloco omitido conforme o contrato. Blocos compostos devem ser preferidos quando remover apenas um valor deixaria rótulos, pontuação ou linhas vazias no documento.

## Testes de aceitação

- template válido e inválido, variável desconhecida e marcador remanescente;
- marcador dividido em múltiplos runs do Word, em tabela, cabeçalho e rodapé;
- acentos, quebras de linha, `&`, `<`, `>` e texto longo;
- maior, menor com responsável e menor emancipado sem exposição da prova;
- remunerado, não remunerado e auxílio ausente;
- TCE padrão, credenciamento, SEDUC, EMATER, aditivo, rescisão e atestado;
- falha antes/depois da criação do temporário com limpeza garantida;
- duas requisições concorrentes e retry idempotente;
- renderização visual de todas as páginas antes de ativar cada versão.

## Referências

- [[SGE - Migration - 13 - Document templates]]
- [[SGE - Migration - 14 - Template versions]]
- [[SGE - Migration - 16 - Generated documents]]
- [[SGE - Helper - NumberToWordsHelper]]
