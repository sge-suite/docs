---
id: enum-brazilianstate
title: Enum — BrazilianState
description: Siglas oficiais das 27 unidades federativas brasileiras usadas por cidades, endereços e calendários estaduais.
type: enum-reference
status: implemented
visibility: public
tags: sge/enums, sge/cadastros, sge/calendario
related: migration-01a-cities, migration-01-addresses, migration-03-campuses, migration-22-holidays, service-internshipenddatecalculator
source_refs: https://github.com/sge-suite/sge/blob/master/app/Enums/BrazilianState.php
---
> [!success] Estado
> A classe existe em `app/Enums/BrazilianState.php`. O cast no model `City` já está implementado; `Address` obtém a UF pelo relacionamento com a cidade, sem coluna ou cast de UF próprios. As integrações com campi e o cálculo do calendário continuam planejadas. Não há testes automatizados no repositório atualmente; a validação fica para a preparação para produção.

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

Para o cálculo do estágio, a UF e a cidade do endereço histórico do local de trabalho definem os feriados estaduais e municipais aplicáveis. O catálogo de cidades é local e carregado pelo `CitySeeder`; a BrasilAPI/IBGE pode ser usada para gerar ou revisar o arquivo de carga. A consulta opcional de CEP nos formulários de campus resolve a cidade por nome normalizado e UF no catálogo local, preservando sua identidade IBGE; ausência ou ambiguidade exige seleção manual. O calendário importado é persistido em [`holidays`](doc:migration-22-holidays).

## Checklist

- [x] Criar enum, rótulos, `values()` e `options()`.
- [ ] Cobrir cases, siglas, rótulos e opções com teste unitário.
- [x] Adicionar o cast de UF ao model `City`.
- [x] Expor a UF de `Address` pelo relacionamento com `City`, sem duplicar coluna ou cast.
- [ ] Integrar a UF ao cadastro de campus conforme seu contrato.
- [x] Criar o catálogo local de cidades e carregá-lo pelo `CitySeeder`.
- [x] Criar a tabela, o model e a importação BrasilAPI de feriados nacionais e estaduais; o cadastro municipal permanece pendente.
- [ ] Usar o calendário persistido no cálculo da previsão de término.
