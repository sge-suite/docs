---
id: cast-phonecast
title: Cast — PhoneCast
description: Cast Eloquent que valida telefones brasileiros com DDD e persiste somente os dígitos.
type: technical-reference
status: implemented
visibility: public
tags: sge/casts, sge/contato, sge/dados-pessoais
related: migration-02-user-personal-data, casts, helper-digitshelper
source_refs: https://github.com/sge-suite/sge/blob/master/app/Casts/PhoneCast.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/PhoneCastTest.php
---
> [!success] Estado atual
> Implementado em `app/Casts/PhoneCast.php` e usado por `UserPersonalData::$phone`.

## Responsabilidade

`PhoneCast` valida o telefone recebido com `LaravelLegends\PtBrValidator\Rules\CelularComDdd` e armazena a forma canônica apenas com dígitos, usando `DigitsHelper`.

| Entrada | Comportamento |
| --- | --- |
| Telefone fixo com DDD, como `(55) 9999-9999` | Aceito e salvo como `5599999999`. |
| Celular com DDD, como `(55) 99999-9999` | Aceito e salvo como `55999999999`. |
| `null`, string vazia ou espaços | Persiste `null`. |
| Telefone sem a máscara exigida pela regra com DDD | Lança `InvalidArgumentException`. |
| `get()` | Retorna `null` para `null`; nos demais casos retorna os dígitos persistidos. |

A coluna `user_personal_data.phone` é `varchar(255)`; o cast define o formato aceito e não impõe limite próprio de tamanho textual.

## Testes

`tests/Unit/PhoneCastTest.php` cobre telefone fixo e celular, persistência sem máscara, valor vazio e rejeição de formato sem máscara.

## Relacionamentos

- [Casts](doc:casts)
- [Migration 02 — user_personal_data](doc:migration-02-user-personal-data)
- [Helper — DigitsHelper](doc:helper-digitshelper)
