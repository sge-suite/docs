---
id: testes-existentes
title: Testes existentes
description: Mapa da cobertura de testes já presente no projeto novo e lacunas conhecidas.
type: technical-reference
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/testes, sge/checklist
related: componentes-tecnicos, desenvolvimento-checklist-de-funcionalidade
source_refs: https://github.com/sge-suite/sge/blob/master/tests/Feature/AffiliationTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/NotificationsTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailMessageTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryAttemptTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AddressesTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/UserPersonalDataTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CityCatalogValidationTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/HolidaysTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/FetchCitiesCommandTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/CpfCastTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/PhoneCastTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/FormattingHelpersTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/NumberToWordsHelperTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Auth/PasswordResetTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Settings/SecurityTest.php
---
Este mapa acompanha o código real no repositório Laravel irmão, em `../sge`. Ao criar uma classe ou migration, atualize a matriz e a nota técnica correspondente.

## Cobertura atual

| Área     | Teste                                              | O que cobre                                                             |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Cast     | `tests/Unit/CpfCastTest.php`                       | CPF mascarado válido, armazenamento sem máscara e CPF inválido.         |
| Cast     | `tests/Unit/PhoneCastTest.php`                     | Telefone fixo/celular com DDD, armazenamento sem máscara, vazio e formato inválido. |
| Enums    | `tests/Unit/Enums/AffiliationTypeTest.php`         | cases, valores, labels e options de vínculo.                            |
| Enums    | `tests/Unit/Enums/BrazilianStateTest.php`          | cases, siglas, rótulos e opções das unidades federativas.               |
| Enums    | `tests/Unit/Enums/EmailDeliveryAttemptStatusTest.php` | cases, valores, labels e opções das tentativas de e-mail.             |
| Enums    | `tests/Unit/Enums/EmailMessagePurposeTest.php`     | cases, valores, labels e opções das finalidades de e-mail.             |
| Enums    | `tests/Unit/Enums/EmancipationEvidenceStatusTest.php` | cases, valores, labels e opções de evidências de emancipação.        |
| Enums    | `tests/Unit/Enums/EvaluationStatusTest.php`        | cases, valores, labels e opções das avaliações.                         |
| Enums    | `tests/Unit/Enums/GeneratedDocumentOriginTest.php` | valores, labels e opções de origem.                                     |
| Enums    | `tests/Unit/Enums/GeneratedDocumentStatusTest.php` | valores, labels e opções de status documental.                          |
| Enums    | `tests/Unit/Enums/GeneratedDocumentTypeTest.php`   | cases, valores, labels, opções e conversão de tipo documental.          |
| Enums    | `tests/Unit/Enums/InternshipCancellationRequestStatusTest.php` | cases, valores, labels e opções de pedidos de cancelamento.      |
| Enums    | `tests/Unit/Enums/InternshipRequestCorrectionStatusTest.php` | cases, valores, labels e opções de pendências.                   |
| Enums    | `tests/Unit/Enums/InternshipRequestStatusTest.php` | cases, valores, labels e opções de solicitações.                       |
| Enums    | `tests/Unit/Enums/InternshipStatusTest.php`        | valores, labels e opções do ciclo do estágio.                           |
| Enums    | `tests/Unit/Enums/LegalCapacityDeclarationTest.php` | cases, valores, labels e opções de capacidade civil.                  |
| Enums    | `tests/Unit/Enums/PartyDocumentTypeTest.php`       | valores, labels e opções de CPF/CNPJ.                                   |
| Enums    | `tests/Unit/Enums/RegistrationRequestStatusTest.php` | cases, valores, labels e opções de cadastros pendentes.               |
| Helpers  | `tests/Unit/Helpers/FormattingHelpersTest.php`     | timezone/data, placeholders, telefone com DDI e telefone internacional. |
| Helpers  | `tests/Unit/Helpers/NumberToWordsHelperTest.php`   | números e valores em reais por extenso, incluindo entradas inválidas.  |
| Auth     | `tests/Feature/Auth/*`                             | login, confirmação, reset de senha.                                     |
| Settings | `tests/Feature/Settings/*`                         | atualização de perfil e segurança.                                      |
| App      | `tests/Feature/DashboardTest.php`                  | acesso ao dashboard.                                                    |
| Endereços | `tests/Feature/AddressesTest.php`                  | Schema e rollback em PostgreSQL, relações, factories, regras obrigatórias, CEP opcional sem validação de formato, cópia histórica e Activity Log. |
| Dados pessoais | `tests/Feature/UserPersonalDataTest.php`          | Schema PostgreSQL, constraints, relações, campos opcionais, CPF em `users`, validação e rollback da migration. |
| Catálogo de cidades | `tests/Feature/CityCatalogValidationTest.php` / `tests/Unit/FetchCitiesCommandTest.php` | Regras compartilhadas no model/seeder, validação das respostas da coleta e preservação do catálogo diante de payloads inválidos. |
| Feriados | `tests/Feature/HolidaysTest.php`                  | Regras compartilhadas no model e na importação, coerência de escopo/localização e preservação dos registros diante de payloads inválidos. |
| Vínculos | `tests/Feature/AffiliationTest.php` | Schema PostgreSQL, FKs e exclusão, múltiplos vínculos, validação PHP e cast enum, lifecycle, último uso, factory e Activity Log. 22 testes e 158 assertions passaram por Sail. |
| Notificações | `tests/Feature/NotificationsTest.php` | Schema PostgreSQL nativo com `jsonb` e UUID, relação polimórfica, leitura/não leitura, isolamento entre vínculos da mesma conta, notificações destinadas a `User`, Policy de vínculo ativo e rollback/reaplicação. 7 testes e 77 assertions passaram por Sail. |
| Mensagens de e-mail | `tests/Feature/EmailMessageTest.php` | Schema PostgreSQL, FKs, ID `bigint`, criptografia de destinatário e conteúdo, snapshot imutável, regras por finalidade e unicidade da chave UUID de idempotência. |
| Tentativas de entrega | `tests/Feature/EmailDeliveryAttemptTest.php` | Schema PostgreSQL com ID e FK `bigint`, sequência única, estados e marcos, motivo sanitizado, preservação de tentativas anteriores e rollback/reaplicação na ordem das FKs. |

## Lacunas prioritárias

- [ ] Criar testes de integração para as migrations de domínio ainda não implementadas, em banco limpo.
- [ ] Criar testes de rollback das migrations reversíveis.
- [ ] Ampliar a cobertura de `CurrencyHelper`, dos formatos de `DateHelper` e dos comprimentos de telefone/documentos.
- [ ] Completar a cobertura de `null`, vazio, formato inválido e timezone em todos os helpers.
- [ ] Cobrir `ProfileValidationRules` e todos os requisitos de `PasswordValidationRules`.
- [ ] Cobrir `ResetUserPassword` com senha fraca, confirmação divergente e sucesso.
- [ ] Cobrir `AppServiceProvider` e `FortifyServiceProvider` por comportamento observável.
- [ ] Completar testes de autorização dos catálogos e fluxos de estágio; a caixa de notificações já cobre propriedade da conta e vínculo ativo.

## Comandos

```bash
cd ../sge
./vendor/bin/sail composer run lint:check
./vendor/bin/sail composer run types:check
./vendor/bin/sail artisan test
./vendor/bin/sail composer run test
```

## Relacionamentos

- [Componentes técnicos](doc:componentes-tecnicos)
- [Checklist de funcionalidade](doc:desenvolvimento-checklist-de-funcionalidade)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
