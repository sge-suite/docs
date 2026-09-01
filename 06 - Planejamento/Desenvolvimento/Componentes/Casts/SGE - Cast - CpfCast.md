---
title: SGE — Cast — CpfCast
description: Cast Eloquent que valida CPF e armazena o documento sem máscara.
type: technical-reference
status: implemented
code_path: app/Casts/CpfCast.php
test_path: tests/Unit/CpfCastTest.php
tags:
  - sge/casts
  - sge/dados-pessoais
  - sge/seguranca
aliases:
  - Cast de CPF
---
> [!success] Estado atual
> Implementado em `app/Casts/CpfCast.php` e usado hoje em `User::$cpf`.

## Responsabilidade

Implementa `CastsAttributes<string, string>` para controlar a fronteira entre o valor recebido pela aplicação e o valor persistido.

| Operação                   | Comportamento                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `get()`                    | Retorna `null` para `null`; para os demais valores, retorna string sem alterar o valor.                        |
| `set()` com `null` ou `''` | Persiste `null`.                                                                                               |
| `set()` com valor          | Usa o helper global `unmask()`, valida com `LaravelLegends\PtBrValidator\Rules\Cpf` e retorna somente dígitos. |
| CPF inválido               | Lança `InvalidArgumentException` com mensagem em português.                                                    |

## Exemplo

```php
$user->cpf = '529.982.247-25';
$user->save();

// banco: 52998224725
```

## Uso atual e destino

Hoje `User` possui `cpf` no `$fillable`, na docblock e no cast. O modelo de destino separa CPF em `user_personal_data`; antes da [[SGE - Migration - 02 - User personal data|migration 02]] ser adotada, decidir se o cast será movido para `UserPersonalData` e remover o CPF da conta de autenticação.

## Checklist

- [x] Implementar `get()` e `set()`.
- [x] Remover máscara antes da persistência.
- [x] Rejeitar CPF inválido.
- [x] Cobrir CPF mascarado, limpo e inválido em `tests/Unit/CpfCastTest.php`.
- [ ] Definir comportamento para string composta apenas por espaços.
- [ ] Mover o cast para o Model de dados pessoais quando o domínio deixar de guardar CPF em `users`.
- [ ] Confirmar que CPF não é editável pela configuração do usuário.
- [ ] Garantir que consultas e snapshots usem o formato canônico.

## Relacionamentos

- [[SGE - Model - User|Model User]]
- [[SGE - Helpers|Helpers]]
- [[SGE - Migration - 02 - User personal data|Migration de user_personal_data]]
