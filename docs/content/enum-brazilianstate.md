---
id: enum-brazilianstate
title: Enum — BrazilianState
description: Siglas oficiais das 27 unidades federativas brasileiras usadas por cidades, endereços e calendários estaduais.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/cadastros, sge/calendario
related: migration-01a-cities, migration-01-addresses, migration-03-campuses, migration-22-holidays, service-internshipenddatecalculator
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/BrazilianState.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Enums/BrazilianStateTest.php
---
> [!success] Estado
> A classe e os testes unitários já existem em `app/Enums/BrazilianState.php`. O cast no model `City` já está implementado; os casts e integrações em endereços, campi e calendários continuam planejados.

Os valores persistidos são as siglas oficiais em maiúsculas. `label()` apresenta o nome da unidade federativa em português e `options()` serve diretamente aos campos de seleção.

O model `City` persiste `state` como sigla e o expõe como `BrazilianState` por meio do cast Eloquent. A validação do `CitySeeder` aceita somente as 27 siglas definidas neste enum.

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

Para o cálculo do estágio, a UF e a cidade do endereço histórico do local de trabalho definem os feriados estaduais e municipais aplicáveis. O catálogo de cidades é local e carregado pelo `CitySeeder`; a BrasilAPI/IBGE pode ser usada para gerar ou revisar o arquivo de carga. No formulário, a BrasilAPI também pode sugerir dados quando o usuário informa um CEP, mas o sistema resolve a cidade no catálogo local e persiste seu código IBGE. O calendário importado é persistido e versionado em [`holidays`](doc:migration-22-holidays).

## Checklist

- [x] Criar enum, rótulos, `values()` e `options()`.
- [x] Cobrir cases, siglas, rótulos e opções com teste unitário.
- [x] Adicionar o cast de UF ao model `City`.
- [ ] Adicionar o cast de UF aos modelos de endereço, campus e calendário.
- [x] Criar o catálogo local de cidades e carregá-lo pelo `CitySeeder`.
- [ ] Criar a tabela e a importação versionada dos feriados nacionais, estaduais e municipais.
- [ ] Usar o calendário persistido no cálculo da previsão de término.
