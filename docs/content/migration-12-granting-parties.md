---
id: migration-12-granting-parties
title: Migration 12 — granting_parties
description: Cadastro de partes concedentes por campus, com dados cadastrais e credenciamento.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/concedente, sge/banco-de-dados
related: migration-01-addresses, enum-partydocumenttype
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_23_152827_create_granting_parties_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/GrantingParty.php, https://github.com/sge-suite/sge/blob/master/database/factories/GrantingPartyFactory.php
---
> [!info] Estado
> O cadastro e seu escopo por campus estão implementados na migration, no Model, na factory e nas validações. A gestão direta, sua autorização, as telas e a importação CSV estão implementadas. A aprovação de solicitações continua planejada. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador da concedente/unidade. |
| `campus_id` | `bigint` | não | `FK` para `campuses.id`, `RESTRICT`, índice | Campus proprietário do cadastro. |
| `document_type` | `varchar(255)` | não | — | `cpf` ou `cnpj`, validado por [`PartyDocumentType`](doc:enum-partydocumenttype). |
| `document_number` | `varchar(255)` | não | — | Documento textual sem pontuação; CPF numérico ou CNPJ numérico/alfanumérico, com letras maiúsculas e validação em PHP. |
| `name` | `varchar(255)` | não | — | Nome completo ou razão social. |
| `address_id` | `bigint` | não | `FK`, `RESTRICT` | Endereço atual obrigatório; trocar a FK antes de excluir a linha antiga. |
| `representative_name` | `varchar(255)` | não | — | Nome do representante atual. |
| `representative_role` | `varchar(255)` | não | — | Cargo do representante atual. |
| `phone` | `varchar(255)` | sim | — | Telefone atual com DDD; aceita máscara ou somente dígitos e armazena apenas dígitos pelo `PhoneCast`. |
| `email` | `varchar(255)` | sim | — | E-mail atual. |
| `field_of_activity` | `varchar(255)` | não | — | Área de atuação. |
| `professional_council` | `varchar(255)` | sim | — | Conselho profissional, quando aplicável. |
| `council_registration_number` | `varchar(255)` | sim | — | Registro no conselho, quando aplicável. |
| `credentialing_process_number` | `varchar(255)` | sim | — | Processo de credenciamento, quando aplicável. |
| `deactivated_at` | `timestamp(0)` | sim | — | Indisponibilidade para novas associações, independente de exclusão física. |
| `created_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel, preenchido pelo Eloquent. |
| `updated_at` | `timestamp(0)` | sim | — | Timestamp nativo do Laravel, atualizado pelo Eloquent. |

Cada linha de `granting_parties` pertence a um campus por meio de `campus_id` (FK obrigatória com exclusão restrita e índice). Esse escopo não será alterado na edição comum; para usar a mesma organização ou pessoa em outro campus, será criado outro cadastro local. Os cadastros serão separados por campus, mesmo quando uma empresa exigir o CNPJ da matriz para uma filial ou várias escolas estaduais compartilharem o mesmo CNPJ. O CPF também poderá aparecer em cadastros de campi diferentes; dados de conselho, credenciamento, contatos e endereço ficam no cadastro local e não são compartilhados automaticamente. Não criar unicidade global nem por campus para `document_number`; CPF/CNPJ identificam o documento informado, mas não distinguem necessariamente a unidade operacional. O CPF da parte concedente é independente de `users.cpf` e não deve mesclar contas de usuário. Para ser selecionada na solicitação de estágio, a concedente precisa estar cadastrada para o campus do estágio. Quando houver, o número do processo de credenciamento preenche o campo correspondente do documento. O estágio guardará FK e snapshot.

`name` contém o nome completo da concedente ou unidade. O único índice secundário é o de `campus_id`, sem unicidade por documento. O Model valida o campus, impede a transferência do cadastro para outro campus e registra alterações no Activity Log. A validação também exige que a concedente usada por uma solicitação de estágio ou estágio pertença ao campus do vínculo discente ou curso. `document_type` usa o cast de `PartyDocumentType` e `document_number` é normalizado e validado no evento `saving` com os casts existentes `CpfCast` e `CnpjCast`, de acordo com o tipo. `PhoneCast` aceita telefone brasileiro fixo ou celular com DDD, com máscara ou somente dígitos; valida e armazena apenas dígitos, convertendo telefone vazio em `null`. O model também valida os limites dos campos opcionais e registra alterações cadastrais no Activity Log.

As colunas textuais usam `$table->string()` sem comprimento explícito (`varchar(255)` no PostgreSQL). Os limites de domínio, incluindo os tamanhos de CPF e CNPJ, são aplicados em PHP, sem constraints `CHECK` no banco. Endereço, representante e área de atuação são obrigatórios para a concedente. O CEP é obrigatório na tabela de endereços, validado com PT-BR Validator no Model e armazenado como oito dígitos em coluna textual, sem máscara.

Os campos de endereço continuam em `addresses`, e não são repetidos nesta tabela. A FK usa `RESTRICT`. Ao atualizar o endereço atual, a aplicação cria uma nova linha exclusiva da concedente e troca `address_id`; não seleciona uma linha já pertencente a outro cadastro, mesmo que os valores sejam iguais. A remoção física da linha anterior só é elegível depois que nenhuma relação a referenciar. Ao criar um estágio, o sistema copia o endereço apontado por `address_id` para uma nova linha de `addresses`; o estágio guarda essa nova FK em `workplace_address_id`. Telefone, representante, conselho e processo continuam sendo dados atuais da concedente e entram no snapshot do estágio somente no aceite.

## Disponibilidade e integridade

`deactivated_at` nulo identifica cadastro ativo. Novas associações de solicitação ou estágio exigem concedente ativa e não excluída; referências existentes podem ser mantidas depois da desativação. Alterações cadastrais preservam snapshots e endereços históricos. A exclusão física é bloqueada quando houver estágios, solicitações de estágio ou solicitações de cadastro relacionadas, em qualquer estado. O endereço próprio é removido fisicamente junto com a concedente quando não houver outra referência, na mesma transação; a auditoria é preservada. Referências de outro cadastro ou estágio preservam o endereço disponível. Não há exclusão lógica nem restauração. A migration original foi ajustada antes da implantação em produção, sem migration adicional.

A coluna foi incorporada à migration original antes da implantação em produção. Bancos locais já migrados não recebem a coluna apenas executando `migrate`; a sincronização desses ambientes exige tratamento separado, sem pressupor descarte de dados.

## Importação CSV

A tela **Importar CSV**, acessível no índice de concedentes, exige a mesma permissão de cadastro (`GrantingPartyPolicy::create`). O destino é o campus do vínculo ativo selecionado, obtido no servidor; o arquivo não pode indicar campus, IDs internos, situação ou datas administrativas. A confirmação e cada lote revalidam a autorização e exigem o vínculo original. Não há permissão automática para Administrador do Sistema.

### Arquivo e validação

- Até **500 registros não vazios**, **2 MiB** no arquivo comum e **8 MiB** no arquivo de correção. Há limite adicional de 2.000 registros para conter linhas vazias excessivas.
- UTF-8 com ou sem BOM; separador `;` por padrão ou `,` escolhido explicitamente no envio. Downloads incluem BOM. São aceitos LF, CRLF, aspas duplicadas e campos delimitados com separadores ou quebras de linha.
- Cabeçalhos são comparados sem diferença de caixa ou espaços nas extremidades. Cabeçalhos desconhecidos, repetidos ou obrigatórios ausentes impedem a prévia. Estrutura irrecuperável e codificação inválida são erros do arquivo; células divergentes recuperáveis são erros da linha.
- Obrigatórios: `tipo_documento` (`cpf` ou `cnpj`), `documento`, `nome`, `representante_nome`, `representante_cargo`, `atividade`, `logradouro`, `numero`, `bairro`, `cep`, `cidade`, `uf`.
- Opcionais: `telefone`, `email`, `conselho_profissional`, `registro_conselho`, `processo_credenciamento`; os respectivos cabeçalhos podem ser omitidos.

A validação reutiliza as regras do cadastro e os casts existentes. Todos os valores são texto: CPF, CNPJ, telefone e CEP não recebem zeros artificiais. Ao usar planilhas, essas colunas devem ser importadas como texto para preservar zeros à esquerda. O CNPJ aceita letras sem perdê-las na normalização, formatação ou busca por documento completo. Os exemplos do modelo são `ZG.MXB.TA3/0001-93` e `83.916.474/0001-05`. Consultas externas por CNPJ continuam opcionais no formulário; ausência de resultado exibe erro e permite preenchimento manual. A importação não consulta BrasilAPI por linha.

Cidade e UF são resolvidas exclusivamente no catálogo local, com UF em maiúsculas e chave do nome sem acentos, diferença de caixa ou espaços. É obrigatória uma única correspondência; ausência ou ambiguidade gera erro na linha. Não há aproximação nem criação automática de cidade.

### Prévia, duplicidades e processamento

O modelo baixado respeita o separador selecionado na tela. A infraestrutura de CSV, upload, paginação, downloads e controle de lotes é compartilhada com a importação de usuários, preservando as regras próprias de cada cadastro.

A prévia é validada integralmente antes de criar endereços ou concedentes. Exibe filtros, **100 linhas por página**, erros e cadastros duplicados locais, incluindo os desativados. Todas as ocorrências válidas de documento repetido no arquivo exigem confirmação, assim como documentos já existentes no campus. Cadastros de outros campi não são exibidos como conflito local.

Cada linha duplicada tem confirmação individual inicialmente desmarcada. **Selecionar todas as duplicidades** e **Desmarcar todas** abrangem todas as páginas e filtros; apenas linhas válidas são elegíveis. A aprovação permite criar outro cadastro, inclusive cópia exata; não atualiza, reativa nem mescla cadastros. Duplicidades sem aprovação são ignoradas com motivo explícito. Um conflito novo após a prévia gera erro e exige reenvio para nova revisão.

A confirmação congela as decisões e informa a quantidade selecionada. Alpine envia requisições Livewire sequenciais, com até **25 linhas** por lote e interrupção do lote após cinco segundos entre linhas. Cada linha usa uma transação própria envolvendo `ManageGrantingParty::handle`, preservando endereço, auditoria e rollback. Erros isolados permitem continuar; falhas gerais pausam o processamento. O resultado apresenta importadas, ignoradas, com erro e pendentes, com links para os cadastros criados.

Não existem tabelas de importação, histórico de origens ou fingerprints. A prévia e o progresso ficam no estado da tela; o upload temporário do Livewire é eliminado após a análise. Downloads são gerados sob autorização, sem armazenamento de prévia ou CSV de erros. Sair da tela perde esse estado e interrompe os próximos lotes; um lote em andamento pode concluir. Enquanto a tela permanecer aberta, é possível pausar e continuar. Ao retornar, reenvie o arquivo: documentos já cadastrados serão duplicidades que exigem nova confirmação para criar outro cadastro. Não há garantia persistida de execução única após perda da resposta; confira os cadastros antes de repetir.

O CSV de erros contém somente linhas com erro, preservando os cabeçalhos cadastrais originais, sua ordem e valores anteriores à normalização. Acrescenta `__sge_formato` (`erros-v1`), `__sge_linha_original`, `__sge_erros`, `__sge_excedentes` e `__sge_escape`. Preserva a linha física inicial e o intervalo de registros multilinha. Fórmulas são neutralizadas com escape reversível; ao reenviar, o servidor restaura o valor e recalcula validação, cidade e duplicidades, sem reutilizar decisões ou erros antigos. Valores excedentes devem ser redistribuídos nas colunas corretas e a célula de controle limpa após revisão.

A importação mantém a auditoria normal das mutações Eloquent de concedentes e endereços, com autoria pelo vínculo. Não gera evento extra de conclusão nem registro de alteração do campus. O índice de concedentes usa a rolagem da página, sem limite vertical interno na tabela.

### Exportação do SGE-IFFarSA

Na branch `dev` do sistema anterior, **Exportar Empresas → Importar no novo SGE: cadastro completo** gera os mesmos 17 cabeçalhos cadastrais do modelo, respeitando o filtro de cidade e excluindo registros removidos. Até 500 registros resultam em `concedentes_sge.csv`; acima disso, o download é `concedentes_sge.zip`, com CSVs numerados de até 500 registros cada. Os arquivos usam UTF-8 com BOM e ponto e vírgula; cada CSV deve ser enviado separadamente ao novo SGE. Dados incompletos ou inválidos do legado continuam sujeitos à validação da prévia. A exportação de contatos continua disponível em CSV.

## Checklist

- [x] Usar `name` para o nome completo da concedente/unidade nesta implementação.
- [x] Criar migration e cast de `PartyDocumentType` no Model.
- [x] Adicionar FK obrigatória `campus_id`, índice e validar o escopo por campus no cadastro e nos fluxos de estágio.
- [x] Preservar `document_number` sem unicidade global ou por campus.
- [ ] Definir índices adicionais de busca em etapa posterior, além do índice de campus, sem impor unicidade indevida.
- [x] Criar factory para CPF, CNPJ e unidades distintas.
- [x] Validar documento e normalização.
- [ ] Criar solicitação de cadastro para análise do Setor de Estágio.
- [x] Definir que o cadastro é suficiente para validar a parte concedente no formulário de estágio.
- [x] Definir número de processo como dado simples de credenciamento.
- [ ] Testar endereço alterado e snapshot no estágio.
- [ ] Testar migrate/rollback da migration e restrições PostgreSQL.
