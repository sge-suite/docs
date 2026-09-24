---
id: concerns
title: Concerns
description: Índice dos traits que centralizam regras reutilizáveis de validação.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/validacao, sge/checklist
related: concern-passwordvalidationrules, concern-profilevalidationrules, migration-01a-cities, migration-01-addresses, migration-22-holidays, componentes-tecnicos, fase-02-conta-e-contexto
source_refs:
---
Concerns devem conter regras coesas e reutilizáveis, sem conhecer uma tela específica. Cada método precisa deixar claro quando é usado e quais mensagens/contratos produz.

## Inventário

- [`PasswordValidationRules`](doc:concern-passwordvalidationrules) — senha nova e senha atual.
- [`ProfileValidationRules`](doc:concern-profilevalidationrules) — nome e e-mail de perfil.
- [`CityValidationRules`](doc:migration-01a-cities) — código IBGE, nome e UF, aplicado ao model `City`, ao `CitySeeder` e à coleta do catálogo.
- [`HolidayValidationRules`](doc:migration-22-holidays) — data, nome, escopo, UF e cidade, aplicado ao model `Holiday` e à importação da BrasilAPI.
- [`AddressValidationRules`](doc:migration-01-addresses) — cidade existente e campos textuais obrigatórios de endereço, aplicada ao salvar `Address`; sem validação de CEP nesta etapa.

## Checklist comum

- [ ] Manter regras compartilhadas em um único lugar.
- [x] Testar cada método do trait via a classe que o consome.
- [ ] Não colocar persistência, autorização ou efeitos colaterais no concern.
- [ ] Atualizar a documentação quando um campo ou requisito mudar.

## Navegação

- [Componentes técnicos](doc:componentes-tecnicos)
- [Fase de conta e contexto](doc:fase-02-conta-e-contexto)
