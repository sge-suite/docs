---
title: SGE — Concerns
description: Índice dos traits que centralizam regras reutilizáveis de validação.
type: technical-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/validacao
  - sge/checklist
aliases:
  - Índice de concerns do SGE
---
Concerns devem conter regras coesas e reutilizáveis, sem conhecer uma tela específica. Cada método precisa deixar claro quando é usado e quais mensagens/contratos produz.

## Inventário

- [[SGE - Concern - PasswordValidationRules|`PasswordValidationRules`]] — senha nova e senha atual.
- [[SGE - Concern - ProfileValidationRules|`ProfileValidationRules`]] — nome e e-mail de perfil.

## Checklist comum

- [ ] Manter regras compartilhadas em um único lugar.
- [ ] Testar cada método do trait via a classe que o consome.
- [ ] Não colocar persistência, autorização ou efeitos colaterais no concern.
- [ ] Atualizar a documentação quando um campo ou requisito mudar.

## Navegação

- [[SGE - Componentes técnicos]]
- [[SGE - Fase 04 - Conta e contexto|Fase de conta e contexto]]
