---
id: migration-03-campuses
title: Migration 03 — campuses
description: Contrato da tabela de campi e dos dados do representante legal.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/campus
related: migration-01-addresses
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_21_132408_create_campuses_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Campus.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/CampusController.php, https://github.com/sge-suite/sge/blob/master/app/Policies/ActivityPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeActivityScope.php, https://github.com/sge-suite/sge/blob/master/config/scout.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusActivityScope.php
---
> [!success] Estado
> Implementada com dependência obrigatória de [`addresses`](doc:migration-01-addresses). O e-mail institucional do Setor de Estágio é cadastrado no campus e é diferente do e-mail geral do campus; o representante legal é cadastrado por nome e cargo, sem depender de usuário ou vínculo institucional.

## Contrato

| Campo                                 | Regra                                        |
| ------------------------------------- | -------------------------------------------- |
| `id`                                  | bigint, chave primária.                      |
| `name`                                | nome institucional completo, obrigatório.    |
| `cnpj`                                | `char(14)`, obrigatório, normalizado, sem formatação e sem unicidade. |
| `phone`                              | `varchar` padrão do Laravel, obrigatório e normalizado. |
| `internship_office_email`            | `varchar(254)`, e-mail institucional do Setor de Estágio, obrigatório, validado e normalizado. |
| `address_id`                          | FK obrigatória para endereço atual.          |
| `legal_representative_name`           | `varchar(255)`, obrigatório no cadastro; nome exibido no documento. |
| `legal_representative_position`       | `varchar(255)`, obrigatório no cadastro; cargo exibido no documento. |
| `insurance_company_name`             | `varchar(255)`, obrigatório no cadastro. |
| `insurance_policy_number`            | `varchar` padrão do Laravel, obrigatório no cadastro. |
| `deactivated_at`                      | `timestamp(0)` nullable e indexado; desativa o campus e bloqueia alterações em seus recursos. |
| timestamps                            | `timestamp(0)` para criação e atualização; não há `deleted_at`. |

Não criar `code`. O campus é delimitado pelo vínculo ativo e o ciclo de ativação pertence ao Administrador do Sistema. Representante legal e cargo são dados cadastrais do campus, não referências a usuário ou `affiliations`. A geração congela nomes, cargos, seguro e endereço no snapshot documental; alterar o campus não reescreve documento anterior.

## Implementação atual

`Campus` usa exclusão física, registra alterações cadastrais no Activity Log e expõe o escopo `active()` para registros sem `deactivated_at`. O Model oferece `deactivate()`, `reactivate()` e `assertWritable()`; campus desativado só pode ser reativado, sem outras mudanças cadastrais. O endereço atual é obrigatório (`belongsTo`/`hasMany`) e sua exclusão é `RESTRICT` enquanto houver uma referência. Excluir o campus também exclui fisicamente seu endereço próprio na mesma transação, com preservação da auditoria e de endereços compartilhados ou históricos. O CNPJ é normalizado para 14 dígitos e validado com `laravellegends/pt-br-validator`; o telefone reutiliza `PhoneCast`, aceitando telefone fixo ou celular com DDD e persistindo somente os dígitos.

`CampusController` implementa as rotas web de criação, edição, desativação e reativação por Eloquent. Páginas Livewire com Flux oferecem listagem, cadastro, detalhes e edição exclusivamente ao Administrador do Sistema, enviando as gravações a esse controller. `CampusPolicy` mantém a consulta de backend para o Setor de Estágio do próprio registro; `viewAdministration` restringe a interface global ao vínculo ativo de Administrador do Sistema. A página Meu campus permite ao Setor de Estágio editar nome, CNPJ, endereço, telefone, e-mail institucional do Setor, representante e seguro do próprio campus, conforme o vínculo ativo e selecionado. O formulário de endereço é compartilhado pelas telas de cadastro e edição. A desativação exige a senha atual em cada solicitação, preserva vínculos e estados dos processos, e registra os valores anteriores/novos com autoria do vínculo ativo. A senha não é gravada no log.

Campus inativo permanece consultável para leitura autorizada e sua tela global exibe somente os dados e a opção de reativar. As Policies e Actions dos recursos locais revalidam o estado do campus; o sincronizador de execução também ignora campi desativados e não cria avisos enquanto estiverem inativos. Fluxos futuros devem aplicar a mesma guarda. A interface local do Setor de Estágio permite somente consulta quando o campus está desativado. A reativação não altera vínculos nem dispara processamento atrasado.

Os campos cadastrais acima são obrigatórios no Model, nos Form Requests e na migration original. `internship_office_email` aceita até 254 caracteres, é validado como e-mail e normalizado com trim e letras minúsculas. O CEP do endereço também é obrigatório, validado com `FormatoCep` do PT-BR Validator e armazenado somente com oito dígitos. Se uma atualização enviar endereço, deve incluir CEP; atualizações de outros dados podem omitir o endereço. Atualizações parciais continuam permitidas, mas não podem limpar esses campos. `CampusFactory` fornece e-mail institucional, representante e seguro completos; mantém os estados `withInsurance()` e `deactivated()`.

O Setor de Estágio do campus consulta e altera esse endereço pela tela **Meu campus**, limitado ao próprio vínculo ativo e selecionado; o Administrador do Sistema administra o campo na gestão global do campus. O endereço também é exibido como contato copiável nos formulários de abertura e avaliação do supervisor. Esse campo não substitui atualmente o e-mail individual usado como destinatário das notificações.

`Campus` usa Scout com Meilisearch para busca tolerante a erros pelo nome. O índice contém apenas ID, nome e `deactivated_at`; a situação é filtrada no próprio mecanismo de busca. A sincronização usa fila após o commit, evitando publicar registros descartados. O índice é auxiliar: a persistência, a autorização e a auditoria continuam no PostgreSQL. Pode haver um intervalo entre a gravação e a atualização da busca.


O histórico de alterações do campus aparece na consulta de auditoria compartilhada pelo Administrador do Sistema e pelo Setor de Estágio. O acesso exige vínculo ativo selecionado e segue a Policy; o Setor consulta somente o próprio campus, inclusive desativado. Referências ao campus e ao endereço mostram nome ou descrição atual junto do ID quando disponíveis e dentro do escopo. A consulta atual não inclui atividades operacionais de estágios, documentos ou concedentes.

## Checklist

- [x] Criar migration `create_campuses_table` sem FK circular prematura.
- [x] Criar Model `Campus`, factory e exclusão física acompanhada do endereço.
- [x] Normalizar e validar CNPJ e telefone.
- [x] Manter nome e cargo do representante legal no próprio campus, sem vínculo institucional.
- [x] Exigir CNPJ, contatos, representante e seguro já no cadastro do campus.
- [x] Implementar escopo de campus ativo, desativação, reativação, bloqueio de edição enquanto inativo e autorização administrativa.
- [x] Exigir confirmação da senha atual em cada desativação.
- [x] Preservar vínculos e estados de processos ao desativar.
- [x] Criar as views Livewire da gestão administrativa para o Administrador do Sistema.
- [x] Criar a interface local Meu campus para o Setor de Estágio.
- [x] Aplicar a guarda de campus ativo às operações atuais e ao sincronizador de execução; exigir a mesma revalidação nos futuros fluxos vinculados.
- [x] Registrar alterações cadastrais no Activity Log.
- [ ] Testar campus ativo, desativado, endereço, representante e seguro obrigatórios, CEP obrigatório sem máscara e CNPJ repetido.
- [ ] Testar migrate/rollback e reaplicação da migration.

## Dependências

- [addresses](doc:migration-01-addresses)
