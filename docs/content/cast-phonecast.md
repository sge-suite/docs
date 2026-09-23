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
> Implementado em `app/Casts/PhoneCast.php` e usado por `UserPersonalData::$phone`, `Campus::$phone` e `GrantingParty::$phone`.

## Responsabilidade

`PhoneCast` aceita telefone brasileiro fixo ou celular com DDD, com máscara ou somente dígitos. Para a entrada sem máscara, monta o formato esperado por `LaravelLegends\PtBrValidator\Rules\CelularComDdd` antes de validar. Armazena a forma canônica apenas com dígitos, usando `DigitsHelper`.

| Entrada | Comportamento |
| --- | --- |
| Telefone fixo com DDD, como `(55) 9999-9999` | Aceito e salvo como `5599999999`. |
| Celular com DDD, como `(55) 99999-9999` | Aceito e salvo como `55999999999`. |
| Telefone com DDD sem máscara, como `5599999999` ou `55999999999` | Aceito e salvo com os mesmos dígitos. |
| `null`, string vazia ou espaços | Persiste `null`. |
| Telefone sem DDD, com tamanho inválido ou caracteres indevidos | Lança `InvalidArgumentException`. |
| `get()` | Retorna `null` para `null`; nos demais casos retorna os dígitos persistidos. |

A coluna `user_personal_data.phone` é `varchar(255)`; o cast define o formato aceito e não impõe limite próprio de tamanho textual.

## Testes

`tests/Unit/PhoneCastTest.php` cobre telefone fixo e celular com e sem máscara, persistência apenas dos dígitos, valor vazio e entradas inválidas.

## Relacionamentos

- [Casts](doc:casts)
- [Migration 02 — user_personal_data](doc:migration-02-user-personal-data)
- [Helper — DigitsHelper](doc:helper-digitshelper)
