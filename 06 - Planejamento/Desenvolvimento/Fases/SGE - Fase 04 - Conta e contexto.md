---
title: SGE — Fase 04 — Conta e contexto
description: Checklist de autenticação, vínculos ativos e configurações próprias.
type: development-phase
status: planned
order: 4
tags:
  - sge/desenvolvimento
  - sge/autenticacao
  - sge/checklist
---
Referências: [[SGE - Modelo de dados - Acesso|modelo de acesso]], [[SGE - E-mails, notificações e entregas]] e [[SGE - Fluxos principais#1 Acesso e vínculo|fluxo de login]].

## Login e recuperação de senha

- [ ] Configurar Fortify para autenticar por `users.email`.
- [ ] Implementar “Esqueci minha senha” com link de uso único e expiração.
- [ ] Integrar registro seguro em `email_messages` e `email_delivery_attempts`.
- [ ] Impedir token, URL e conteúdo sensível em logs.
- [ ] Aplicar senha de 8–64 caracteres, maiúsculas/minúsculas, número, símbolo e verificação contra senhas comprometidas.
- [ ] Testar link válido, expirado, reutilizado e solicitação repetida.

## Criação de conta

- [ ] Criar conta e vínculo em transação.
- [x] Não exigir confirmação ou código de verificação de e-mail.
- [ ] Definir o fluxo seguro de definição da senha inicial sem verificação de e-mail.

## Seleção de vínculo

- [ ] Carregar vínculos ativos depois da autenticação.
- [ ] Bloquear acesso funcional sem vínculo ativo.
- [ ] Selecionar automaticamente um único vínculo e exibir escolha para vários.
- [ ] Armazenar vínculo atual na sessão.
- [ ] Permitir troca sem novo login.
- [ ] Atualizar contexto de autorização, campus e `last_used_at`.
- [ ] Registrar middleware/serviço único para resolver o vínculo ativo em cada requisição.
- [ ] Registrar o vínculo usado em ações relevantes.

## Configurações próprias

- [ ] Permitir alteração da própria senha e e-mail de login.
- [ ] Impedir alteração do nome na configuração.
- [ ] Permitir ao discente alterar RG, nascimento e endereço atual.
- [ ] Impedir edição de dados pessoais por outro vínculo.

## Próxima fase

[[SGE - Fase 05 - Administração|Fase 05 — Administração e catálogos]]
