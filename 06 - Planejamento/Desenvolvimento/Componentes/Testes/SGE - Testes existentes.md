---
title: SGE — Testes existentes
description: Mapa da cobertura de testes já presente no projeto novo e lacunas conhecidas.
type: technical-reference
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/testes
  - sge/checklist
aliases:
  - Cobertura atual de testes do SGE
---
Este mapa acompanha o código real no repositório Laravel irmão, em `../sge`. Ao criar uma classe ou migration, atualize a matriz e a nota técnica correspondente.

## Cobertura atual

| Área     | Teste                                              | O que cobre                                                             |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Cast     | `tests/Unit/CpfCastTest.php`                       | CPF mascarado válido, armazenamento sem máscara e CPF inválido.         |
| Enums    | `tests/Unit/Enums/AffiliationTypeTest.php`         | valores, labels, options e case de coordenador.                         |
| Enums    | `tests/Unit/Enums/GeneratedDocumentOriginTest.php` | valores, labels e opções de origem.                                     |
| Enums    | `tests/Unit/Enums/GeneratedDocumentStatusTest.php` | valores, labels e opções de status documental.                          |
| Enums    | `tests/Unit/Enums/GeneratedDocumentTypeTest.php`   | cases, valores, labels, opções e conversão de tipo documental.          |
| Enums    | `tests/Unit/Enums/InternshipStatusTest.php`        | valores, labels e opções do ciclo do estágio.                           |
| Enums    | `tests/Unit/Enums/PartyDocumentTypeTest.php`       | valores, labels e opções de CPF/CNPJ.                                   |
| Helpers  | `tests/Unit/Helpers/FormattingHelpersTest.php`     | timezone/data, placeholders, telefone com DDI e telefone internacional. |
| Auth     | `tests/Feature/Auth/*`                             | login, confirmação, reset de senha.                                     |
| Settings | `tests/Feature/Settings/*`                         | atualização de perfil e segurança.                                      |
| App      | `tests/Feature/DashboardTest.php`                  | acesso ao dashboard.                                                    |

## Lacunas prioritárias

- [ ] Criar testes para cada migration de domínio em banco limpo.
- [ ] Criar testes de rollback das migrations reversíveis.
- [ ] Criar testes para `CurrencyHelper`, todos os formatos de `DateHelper` e todos os comprimentos de telefone/documentos.
- [ ] Cobrir `null`, vazio, formato inválido e timezone em todos os helpers.
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

- [[SGE - Componentes técnicos]]
- [[SGE - Desenvolvimento - Checklist de funcionalidade|Checklist de funcionalidade]]
- [[SGE - Guia de desenvolvimento]]
