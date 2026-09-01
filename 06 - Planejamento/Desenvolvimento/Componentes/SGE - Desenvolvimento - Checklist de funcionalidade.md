---
title: SGE — Desenvolvimento — Checklist de funcionalidade
description: Checklist reutilizável para implementar qualquer funcionalidade ou regra do SGE.
type: checklist-template
status: maintained
tags:
  - sge/desenvolvimento
  - sge/checklist
aliases:
  - Checklist de implementação do SGE
---
Copie este bloco para a nota da fase ou da funcionalidade. Marque somente o que se aplica e justifique itens não aplicáveis.

## Entendimento

- [ ] Problema e regra descritos em linguagem simples.
- [ ] Decisão registrada em [[SGE - Backlog e decisões]], quando necessário.
- [ ] Fluxo e estados descritos em [[SGE - Fluxos principais]] ou nota própria.

## Dados

- [ ] Entidades, campos, estados, FKs, índices e snapshots definidos.
- [ ] [[SGE - Migrations|Migration]] criada e revisada.
- [ ] Modelos, relacionamentos e casts implementados.
- [ ] Casts e helpers existentes foram reutilizados ou a duplicação foi justificada.
- [ ] Factory/seed criada, se aplicável.
- [ ] `migrate` em banco limpo executado.
- [ ] `migrate:rollback` testado quando a reversão for segura.

## Comportamento

- [ ] Action/Service ou regra de domínio implementada.
- [ ] Validações de entrada e de transição implementadas.
- [ ] Gate/Policy e matriz de vínculo implementados; sem permissões persistidas.
- [ ] Escopo por usuário, vínculo e campus validado.
- [ ] Interface implementada no contexto correto.
- [ ] Activity Log e notificações avaliados.
- [ ] Jobs, filas, idempotência e reprocessamento avaliados.
- [ ] Concerns, Actions e Providers afetados foram documentados.

## Qualidade e entrega

- [ ] Testes unitários, feature e autorização criados.
- [ ] Caminho feliz e caminhos de erro testados.
- [ ] `./vendor/bin/sail composer run test` executado com sucesso.
- [ ] Fluxo Mermaid e canvas atualizados quando necessário.
- [ ] Documentação textual atualizada.
- [ ] Commit preparado com descrição objetiva.

## Definição de pronto

- [ ] Fluxo principal funciona do início ao fim.
- [ ] Usuário permitido e proibido foram testados.
- [ ] Dados históricos não dependem somente de cadastros atuais.
- [ ] E-mails/notificações previstos foram verificados no Mailpit.
- [ ] Migration funciona em banco limpo.
- [ ] Não há regra duplicada ou contraditória entre código e documentação.
