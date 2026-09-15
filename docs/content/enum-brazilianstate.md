---
id: enum-brazilianstate
title: Enum — BrazilianState
description: Siglas oficiais das 27 unidades federativas brasileiras usadas pelos campi e pelo calendário estadual.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/cadastros, sge/calendario
related: migration-03-campuses, service-internshipenddatecalculator
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/BrazilianState.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/BrazilianStateTest.php
---
> [!success] Estado
> A classe e os testes unitários já existem em `app/Enums/BrazilianState.php`. O cast nos modelos e a integração com os campi e o calendário de feriados continuam planejados.

Os valores persistidos são as siglas oficiais em maiúsculas. `label()` apresenta o nome da unidade federativa em português e `options()` serve diretamente aos campos de seleção.

| Case | Valor | Rótulo |
| --- | --- | --- |
| `Acre` | `AC` | Acre |
| `Alagoas` | `AL` | Alagoas |
| `Amapa` | `AP` | Amapá |
| `Amazonas` | `AM` | Amazonas |
| `Bahia` | `BA` | Bahia |
| `Ceara` | `CE` | Ceará |
| `DistritoFederal` | `DF` | Distrito Federal |
| `EspiritoSanto` | `ES` | Espírito Santo |
| `Goias` | `GO` | Goiás |
| `Maranhao` | `MA` | Maranhão |
| `MatoGrosso` | `MT` | Mato Grosso |
| `MatoGrossoDoSul` | `MS` | Mato Grosso do Sul |
| `MinasGerais` | `MG` | Minas Gerais |
| `Para` | `PA` | Pará |
| `Paraiba` | `PB` | Paraíba |
| `Parana` | `PR` | Paraná |
| `Pernambuco` | `PE` | Pernambuco |
| `Piaui` | `PI` | Piauí |
| `RioDeJaneiro` | `RJ` | Rio de Janeiro |
| `RioGrandeDoNorte` | `RN` | Rio Grande do Norte |
| `RioGrandeDoSul` | `RS` | Rio Grande do Sul |
| `Rondonia` | `RO` | Rondônia |
| `Roraima` | `RR` | Roraima |
| `SantaCatarina` | `SC` | Santa Catarina |
| `SaoPaulo` | `SP` | São Paulo |
| `Sergipe` | `SE` | Sergipe |
| `Tocantins` | `TO` | Tocantins |

Para o cálculo do estágio, a UF do campus define os feriados estaduais aplicáveis. O SGE importa o calendário da BrasilAPI com `GET /api/feriados/v1/{ano}?uf={UF}`, persiste e versiona os resultados. A API não é consultada durante o cálculo de previsão de término.

## Checklist

- [x] Criar enum, rótulos, `values()` e `options()`.
- [x] Cobrir cases, siglas, rótulos e opções com teste unitário.
- [ ] Adicionar o cast de UF aos modelos que representam campus e endereço.
- [ ] Criar a tabela e a importação versionada dos feriados nacionais e estaduais.
- [ ] Usar o calendário persistido no cálculo da previsão de término.
