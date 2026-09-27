---
id: migration-03-campuses
title: Migration 03 — campuses
description: Contrato da tabela de campi e dos dados do representante legal.
type: migration-reference
status: implemented
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/campus
related: migration-01-addresses
source_refs:
---
> [!success] Estado
> Implementada com dependência obrigatória de [`addresses`](doc:migration-01-addresses). O representante legal é cadastrado por nome e cargo, sem depender de usuário ou vínculo institucional.

## Contrato

| Campo                                 | Regra                                        |
| ------------------------------------- | -------------------------------------------- |
| `id`                                  | bigint, chave primária.                      |
| `name`                                | nome institucional completo, obrigatório.    |
| `cnpj`                                | `char(14)`, nullable, normalizado e sem formatação. |
| `phone`                              | `varchar` padrão do Laravel, nullable e normalizado. |
| `email`                              | `varchar` padrão do Laravel, nullable.       |
| `address_id`                          | FK obrigatória para endereço atual.          |
| `legal_representative_name`           | `varchar(255)`, nullable no cadastro inicial; nome exibido no documento. |
| `legal_representative_position`       | `varchar(255)`, nullable no cadastro inicial; cargo exibido no documento. |
| `insurance_company_name`             | `varchar(255)`, nullable no cadastro inicial; obrigatório se o template citar o seguro. |
| `insurance_policy_number`            | `varchar` padrão do Laravel, nullable no cadastro inicial; obrigatório se o template citar o seguro. |
| `deactivated_at`                      | `timestamp(0)` nullable e indexado; desativa o campus e bloqueia alterações em seus recursos. |
| timestamps / `deleted_at`             | `timestamp(0)` para auditoria e exclusão lógica. |

Não criar `code`. O campus é delimitado pelo vínculo ativo e o ciclo de ativação pertence ao Administrador do Sistema. Representante legal e cargo são dados cadastrais do campus, não referências a usuário ou `affiliations`. A geração congela nomes, cargos, seguro e endereço no snapshot documental; alterar o campus não reescreve documento anterior.

## Implementação atual

`Campus` usa `SoftDeletes`, registra alterações cadastrais no Activity Log e expõe o escopo `active()` para registros sem `deactivated_at`. O Model oferece `deactivate()`, `reactivate()` e `assertWritable()`; campus desativado só pode ser reativado, sem outras mudanças cadastrais. O endereço atual é obrigatório (`belongsTo`/`hasMany`) e sua exclusão é `RESTRICT`, inclusive enquanto o campus estiver apenas excluído logicamente. O CNPJ é normalizado para 14 dígitos e validado com `laravellegends/pt-br-validator`; o telefone reutiliza `PhoneCast`, aceitando telefone fixo ou celular com DDD e persistindo somente os dígitos.

`CampusController` implementa as rotas web de criação, edição, desativação e reativação por Eloquent, sem views nesta etapa. `CampusPolicy` limita a consulta ao Administrador do Sistema e ao Administrador do Campus do próprio registro. O Administrador do Campus pode alterar apenas telefone, representante e seguro; o Administrador do Sistema pode alterar todos os campos cadastrais. A desativação exige a senha atual em cada solicitação, preserva vínculos e estados dos processos, e registra os valores anteriores/novos com autoria do vínculo ativo. A senha não é gravada no log.

Campus inativo permanece consultável para leitura autorizada, mas nenhum recurso ligado a ele pode ser alterado. As telas, gestão de outros recursos e integração dessa guarda a futuros Jobs e schedules permanecem pendentes. A reativação não altera vínculos nem dispara processamento atrasado.

`CampusFactory` cobre o representante legal, o cadastro inicial sem seguro, o estado `withInsurance()` e o estado `deactivated()`. A configuração de seguro exigida por um template permanece para o futuro serviço de geração documental.

`tests/Feature/CampusTest.php`, `tests/Feature/CampusManagementTest.php` e `tests/Unit/CnpjCastTest.php` cobrem schema PostgreSQL, índices, FK `RESTRICT`, nulabilidade, casts, validações, relações, consulta por vínculo, permissões, endereço, desativação com senha, reativação, Activity Log, transações e preservação dos vínculos.

## Checklist

- [x] Criar migration `create_campuses_table` sem FK circular prematura.
- [x] Criar Model `Campus`, factory e SoftDeletes.
- [x] Normalizar e validar CNPJ e telefone.
- [x] Manter nome e cargo do representante legal no próprio campus, sem vínculo institucional.
- [ ] Exigir a configuração de seguro quando o template documental a citar.
- [x] Implementar escopo de campus ativo, desativação, reativação, bloqueio de edição enquanto inativo e autorização administrativa.
- [x] Exigir confirmação da senha atual em cada desativação.
- [x] Preservar vínculos e estados de processos ao desativar.
- [ ] Criar as views Livewire da gestão administrativa.
- [ ] Integrar a guarda de campus ativo aos futuros fluxos de escrita, Jobs e schedules dos recursos vinculados.
- [x] Registrar alterações cadastrais no Activity Log.
- [x] Testar campus ativo, desativado, endereço obrigatório, representante e seguro opcional.
- [x] Testar migrate/rollback e reaplicação da migration.

## Dependências

- [addresses](doc:migration-01-addresses)
