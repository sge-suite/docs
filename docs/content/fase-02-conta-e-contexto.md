---
id: fase-02-conta-e-contexto
title: Fase 02 — Conta e contexto
description: Checklist de autenticação, vínculos ativos e configurações próprias.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/autenticacao, sge/checklist
related: modelo-de-dados-acesso, e-mails-notificacoes-e-entregas, fluxos-principais, fase-03-activity-log, fase-05-administracao
source_refs:
---
Referências: [modelo de acesso](doc:modelo-de-dados-acesso), [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas) e [fluxo de login](doc:fluxos-principais#1-acesso-e-vinculo).

O trabalho começa pelo backend: serviço único para resolver e validar o vínculo ativo, proteção das rotas e testes de sessão/troca. Depois será criada a tela de seleção, antes das interfaces administrativas.

## Login e recuperação de senha

- [x] Configurar Fortify para autenticar por `users.email`.
- [x] Disponibilizar “Esqueci minha senha” com link de uso único e expiração pelo broker do Fortify.
- [ ] Integrar registro seguro em `email_messages` e `email_delivery_attempts`.
- [ ] Impedir token, URL e conteúdo sensível em logs.
- [x] Aplicar senha de 8–64 caracteres, maiúsculas/minúsculas, número, símbolo e verificação contra senhas comprometidas nos fluxos existentes.
- [x] Testar solicitação, renderização e redefinição com link válido.
- [ ] Completar testes de link expirado, reutilizado e solicitação repetida.

## Criação de conta

- [ ] Criar conta e vínculo em transação.
- [x] Não exigir confirmação ou código de verificação de e-mail.
- [ ] Definir o fluxo seguro de definição da senha inicial para contas criadas pela instituição.

## Seleção de vínculo

- [ ] Carregar vínculos ativos depois da autenticação.
- [ ] Bloquear acesso funcional sem vínculo ativo.
- [ ] Selecionar automaticamente um único vínculo e exibir escolha para vários.
- [ ] Armazenar vínculo atual na sessão.
- [ ] Permitir troca sem novo login.
- [ ] Atualizar contexto de autorização, campus e `last_used_at`.
- [ ] Registrar middleware/serviço único para resolver o vínculo ativo em cada requisição.
- [ ] Registrar o vínculo usado em ações relevantes.

> [!info] Preparação do último contexto
> A Migration 04 oferece `active()`, ordenação por `last_used_at DESC NULLS LAST` com desempate determinístico e `markAsUsed()` para seleção explícita. O timestamp não é atualizado em cada requisição e não representa auditoria de login. A integração com sessão, restauração automática e escolha entre vínculos permanece pendente nesta fase. Vínculos desativados nunca são restaurados; múltiplos vínculos ativos sem uso anterior exigem escolha.

## Configurações próprias

- [x] Permitir alteração da própria senha; a alteração do e-mail ainda não está disponível.
- [x] Impedir alteração do nome na configuração atual.
- [ ] Manter o CPF imutável após criação da conta.
- [ ] Permitir ao discente alterar RG, nascimento e endereço atual.
- [ ] Impedir edição de dados pessoais por outro vínculo.

## Próxima fase

[Fase 03 — Activity Log](doc:fase-03-activity-log)
