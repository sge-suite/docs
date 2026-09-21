---
id: cast-cpfcast
title: Cast — CpfCast
description: Cast Eloquent que valida CPF e armazena o documento sem máscara.
type: technical-reference
status: implemented
visibility: public
tags: sge/casts, sge/dados-pessoais, sge/seguranca
related: migration-02-user-personal-data, model-user, helpers
source_refs: https://github.com/sge-suite/sge/blob/master/app/Casts/CpfCast.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/CpfCastTest.php
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

## Uso

`User` possui `cpf` no `$fillable`, na docblock e no cast. O CPF permanece na conta como identificador único; [`user_personal_data`](doc:migration-02-user-personal-data) não o replica.

## Checklist

- [x] Implementar `get()` e `set()`.
- [x] Remover máscara antes da persistência.
- [x] Rejeitar CPF inválido.
- [x] Cobrir CPF mascarado, limpo e inválido em `tests/Unit/CpfCastTest.php`.
- [ ] Definir comportamento para string composta apenas por espaços.
- [x] Manter o cast em `User`, sem duplicar CPF no Model de dados pessoais.
- [ ] Confirmar que CPF não é editável pela configuração do usuário.
- [ ] Garantir que consultas e snapshots usem o formato canônico.

## Relacionamentos

- [Model User](doc:model-user)
- [Helpers](doc:helpers)
- [Migration de user_personal_data](doc:migration-02-user-personal-data)
