---
id: concerns
title: Concerns
description: Índice dos traits que centralizam regras reutilizáveis de validação.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/validacao, sge/checklist
related: concern-passwordvalidationrules, concern-profilevalidationrules, componentes-tecnicos, fase-04-conta-e-contexto
source_refs:
---
Concerns devem conter regras coesas e reutilizáveis, sem conhecer uma tela específica. Cada método precisa deixar claro quando é usado e quais mensagens/contratos produz.

## Inventário

- [`PasswordValidationRules`](doc:concern-passwordvalidationrules) — senha nova e senha atual.
- [`ProfileValidationRules`](doc:concern-profilevalidationrules) — nome e e-mail de perfil.

## Checklist comum

- [ ] Manter regras compartilhadas em um único lugar.
- [ ] Testar cada método do trait via a classe que o consome.
- [ ] Não colocar persistência, autorização ou efeitos colaterais no concern.
- [ ] Atualizar a documentação quando um campo ou requisito mudar.

## Navegação

- [Componentes técnicos](doc:componentes-tecnicos)
- [Fase de conta e contexto](doc:fase-04-conta-e-contexto)
