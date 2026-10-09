---
id: migration-03-campuses
title: Migration 03 — campuses
description: Contrato da tabela de campi e dos dados do representante legal.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/campus
related: migration-01-addresses
source_refs: https://github.com/sge-suite/sge/blob/master/database/migrations/2026_09_21_132408_create_campuses_table.php, https://github.com/sge-suite/sge/blob/master/app/Models/Campus.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/CampusController.php, https://github.com/sge-suite/sge/blob/master/app/Policies/ActivityPolicy.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeActivityScope.php, https://github.com/sge-suite/sge/blob/master/config/scout.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CampusTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CampusManagementTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CampusInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CampusSearchTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AuditInterfaceTest.php
---
> [!success] Estado
> Implementada com dependência obrigatória de [`addresses`](doc:migration-01-addresses). O representante legal é cadastrado por nome e cargo, sem depender de usuário ou vínculo institucional.

## Contrato

| Campo                                 | Regra                                        |
| ------------------------------------- | -------------------------------------------- |
| `id`                                  | bigint, chave primária.                      |
| `name`                                | nome institucional completo, obrigatório.    |
| `cnpj`                                | `char(14)`, obrigatório, normalizado, sem formatação e sem unicidade. |
| `phone`                              | `varchar` padrão do Laravel, obrigatório e normalizado. |
| `email`                              | `varchar` padrão do Laravel, obrigatório.       |
| `address_id`                          | FK obrigatória para endereço atual.          |
| `legal_representative_name`           | `varchar(255)`, obrigatório no cadastro; nome exibido no documento. |
| `legal_representative_position`       | `varchar(255)`, obrigatório no cadastro; cargo exibido no documento. |
| `insurance_company_name`             | `varchar(255)`, obrigatório no cadastro. |
| `insurance_policy_number`            | `varchar` padrão do Laravel, obrigatório no cadastro. |
| `deactivated_at`                      | `timestamp(0)` nullable e indexado; desativa o campus e bloqueia alterações em seus recursos. |
| timestamps / `deleted_at`             | `timestamp(0)` para auditoria e exclusão lógica. |

Não criar `code`. O campus é delimitado pelo vínculo ativo e o ciclo de ativação pertence ao Administrador do Sistema. Representante legal e cargo são dados cadastrais do campus, não referências a usuário ou `affiliations`. A geração congela nomes, cargos, seguro e endereço no snapshot documental; alterar o campus não reescreve documento anterior.

## Implementação atual

`Campus` usa `SoftDeletes`, registra alterações cadastrais no Activity Log e expõe o escopo `active()` para registros sem `deactivated_at`. O Model oferece `deactivate()`, `reactivate()` e `assertWritable()`; campus desativado só pode ser reativado, sem outras mudanças cadastrais. O endereço atual é obrigatório (`belongsTo`/`hasMany`) e sua exclusão é `RESTRICT`, inclusive enquanto o campus estiver apenas excluído logicamente. O CNPJ é normalizado para 14 dígitos e validado com `laravellegends/pt-br-validator`; o telefone reutiliza `PhoneCast`, aceitando telefone fixo ou celular com DDD e persistindo somente os dígitos.

`CampusController` implementa as rotas web de criação, edição, desativação e reativação por Eloquent. Páginas Livewire com Flux oferecem listagem, cadastro, detalhes e edição exclusivamente ao Administrador do Sistema, enviando as gravações a esse controller. `CampusPolicy` mantém a consulta de backend para o Administrador do Campus do próprio registro; `viewAdministration` restringe a interface global ao vínculo ativo de Administrador do Sistema. A página Meu campus permite ao Administrador do Campus editar nome, CNPJ, endereço, telefone, representante e seguro do próprio campus, conforme o vínculo ativo e selecionado. O formulário de endereço é compartilhado pelas telas de cadastro e edição. A desativação exige a senha atual em cada solicitação, preserva vínculos e estados dos processos, e registra os valores anteriores/novos com autoria do vínculo ativo. A senha não é gravada no log.

Campus inativo permanece consultável para leitura autorizada e sua tela global exibe somente os dados e a opção de reativar. A guarda de escrita está aplicada às operações de campus; sua integração aos demais recursos, futuros Jobs e schedules permanece obrigatória e pendente junto desses fluxos. A interface local do Administrador do Campus permite somente consulta quando o campus está desativado. A reativação não altera vínculos nem dispara processamento atrasado.

Os campos cadastrais acima são obrigatórios no Model, nos Form Requests e na migration original. Somente o CEP do endereço é opcional. Atualizações parciais continuam permitidas, mas não podem limpar esses campos. `CampusFactory` já fornece representante e seguro completos; mantém os estados `withInsurance()` e `deactivated()`.

`Campus` usa Scout com Meilisearch para busca tolerante a erros pelo nome. O índice contém apenas ID, nome e `deactivated_at`; a situação é filtrada no próprio mecanismo de busca. A sincronização usa fila após o commit, evitando publicar registros descartados. O índice é auxiliar: a persistência, a autorização e a auditoria continuam no PostgreSQL. Pode haver um intervalo entre a gravação e a atualização da busca.

`CampusTest`, `CampusManagementTest`, `CampusInterfaceTest`, `CampusSearchTest` e `CnpjCastTest` cobrem schema PostgreSQL, índices, FK `RESTRICT`, obrigatoriedade, casts, validações, relações, consulta por vínculo, permissões, endereço, desativação com senha, reativação, Activity Log, transações, preservação dos vínculos e integração real de busca.

O histórico de alterações do campus aparece na consulta de auditoria do Administrador do Sistema. O acesso exige seu vínculo ativo e selecionado e segue a Policy; a consulta não inclui atividades de estágios, documentos, concedentes ou vínculos sem perfil administrativo.

## Checklist

- [x] Criar migration `create_campuses_table` sem FK circular prematura.
- [x] Criar Model `Campus`, factory e SoftDeletes.
- [x] Normalizar e validar CNPJ e telefone.
- [x] Manter nome e cargo do representante legal no próprio campus, sem vínculo institucional.
- [x] Exigir CNPJ, contatos, representante e seguro já no cadastro do campus.
- [x] Implementar escopo de campus ativo, desativação, reativação, bloqueio de edição enquanto inativo e autorização administrativa.
- [x] Exigir confirmação da senha atual em cada desativação.
- [x] Preservar vínculos e estados de processos ao desativar.
- [x] Criar as views Livewire da gestão administrativa para o Administrador do Sistema.
- [ ] Criar a interface local do Administrador do Campus.
- [ ] Integrar a guarda de campus ativo aos futuros fluxos de escrita, Jobs e schedules dos recursos vinculados.
- [x] Registrar alterações cadastrais no Activity Log.
- [x] Testar campus ativo, desativado, endereço, representante e seguro obrigatórios, CEP opcional e CNPJ repetido.
- [x] Testar migrate/rollback e reaplicação da migration.

## Dependências

- [addresses](doc:migration-01-addresses)
