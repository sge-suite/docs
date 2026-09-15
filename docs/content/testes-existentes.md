---
id: testes-existentes
title: Testes existentes
description: Mapa da cobertura de testes já presente no projeto novo e lacunas conhecidas.
type: technical-reference
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/testes, sge/checklist
related: componentes-tecnicos, desenvolvimento-checklist-de-funcionalidade
source_refs: https://github.com/sge-suite/sge/blob/master/tests/Unit/CpfCastTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/FormattingHelpersTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/NumberToWordsHelperTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Auth/PasswordResetTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Settings/SecurityTest.php
---
Este mapa acompanha o código real no repositório Laravel irmão, em `../sge`. Ao criar uma classe ou migration, atualize a matriz e a nota técnica correspondente.

## Cobertura atual

| Área     | Teste                                              | O que cobre                                                             |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Cast     | `tests/Unit/CpfCastTest.php`                       | CPF mascarado válido, armazenamento sem máscara e CPF inválido.         |
| Enums    | `tests/Unit/Enums/AffiliationTypeTest.php`         | cases, valores, labels e options de vínculo.                            |
| Enums    | `tests/Unit/Enums/EmailDeliveryAttemptStatusTest.php` | cases, valores, labels e opções das tentativas de e-mail.             |
| Enums    | `tests/Unit/Enums/EmailMessagePurposeTest.php`     | cases, valores, labels e opções das finalidades de e-mail.             |
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

## Lacunas prioritárias

- [ ] Criar testes de integração para cada migration de domínio em banco limpo, quando as migrations forem implementadas.
- [ ] Criar testes de rollback das migrations reversíveis.
- [ ] Ampliar a cobertura de `CurrencyHelper`, dos formatos de `DateHelper` e dos comprimentos de telefone/documentos.
- [ ] Completar a cobertura de `null`, vazio, formato inválido e timezone em todos os helpers.
- [ ] Cobrir `ProfileValidationRules` e todos os requisitos de `PasswordValidationRules`.
- [ ] Cobrir `ResetUserPassword` com senha fraca, confirmação divergente e sucesso.
- [ ] Cobrir `AppServiceProvider` e `FortifyServiceProvider` por comportamento observável.
- [ ] Criar testes de autorização antes de implementar catálogos e estágio.

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
