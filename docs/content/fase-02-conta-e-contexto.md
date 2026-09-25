---
id: fase-02-conta-e-contexto
title: Fase 02 — Conta e contexto
description: Checklist de autenticação, vínculos ativos e configurações próprias.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/autenticacao, sge/checklist
related: modelo-de-dados-acesso, e-mails-notificacoes-e-entregas, fluxos-principais, fase-03-activity-log, fase-05-administracao
source_refs:
---
Referências: [modelo de acesso](doc:modelo-de-dados-acesso), [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas) e [fluxo de login](doc:fluxos-principais#1-acesso-e-vinculo).

O contexto de vínculo ativo, a proteção do painel e a tela de seleção estão implementados. A execução dos testes via Sail ainda depende do Docker/Podman neste ambiente. Criação de conta e convite inicial permanecem pendentes.

## Login e recuperação de senha

- [x] Configurar Fortify para autenticar por `users.email`.
- [x] Disponibilizar “Esqueci minha senha” com link de uso único e expiração pelo broker do Fortify.
- [x] Não persistir o envio de recuperação de senha nas tabelas de mensagens e tentativas.
- [ ] Impedir token, URL e conteúdo sensível em logs.
- [x] Aplicar senha de 8–64 caracteres, maiúsculas/minúsculas, número, símbolo e verificação contra senhas comprometidas nos fluxos existentes.
- [x] Testar solicitação, renderização e redefinição com link válido.
- [ ] Completar testes de link expirado, reutilizado e solicitação repetida.

## Criação de conta

- [ ] Criar conta e vínculo em transação.
- [x] Não exigir confirmação ou código de verificação de e-mail.
- [ ] Enviar convite inicial e registrar somente a tentativa de entrega, sem conteúdo salvo. O link deve abrir a tela de recuperação de senha com o e-mail preenchido; a pessoa solicita o link de redefinição nessa tela. Esse fluxo de convite ainda não foi implementado.

## Seleção de vínculo

- [x] Carregar vínculos ativos depois da autenticação.
- [x] Bloquear acesso funcional sem vínculo ativo.
- [x] Selecionar automaticamente um único vínculo e exibir escolha para vários.
- [x] Armazenar vínculo atual na sessão.
- [x] Permitir troca sem novo login.
- [x] Atualizar contexto de autorização, campus e `last_used_at`.
- [x] Registrar middleware/serviço único para resolver o vínculo ativo em cada requisição.
- [x] Registrar o vínculo usado em ações relevantes.

> [!info] Contexto implementado
> `ActiveAffiliationContext` consulta apenas vínculos ativos da conta, valida o identificador guardado em `active_affiliation_id` a cada requisição funcional e exige nova escolha quando inválido, desativado ou pertencente a outra conta. Um único vínculo é selecionado automaticamente. Com vários, restaura o mais recentemente usado quando existe `last_used_at`; se nenhum foi usado, a pessoa escolhe em `affiliations/select`. A seleção e troca explícitas atualizam `last_used_at`; restauração e requisições comuns não atualizam. `RequireActiveAffiliation` protege o painel e a Policy de notificações exige o vínculo selecionado. O contexto é acessível por injeção do serviço em Policies e Actions. `SetAuditActor` passa o vínculo validado ao `CauserResolver` do Spatie durante a requisição, e a seleção explícita também usa o vínculo escolhido para auditar `last_used_at`. A rota de seleção continua `affiliations/select`; a troca fica no dropdown do perfil e aparece somente quando há mais de um vínculo ativo. Testes: `ActiveAffiliationContextTest`, `DashboardTest`, `NotificationsTest` e `DatabaseAuditTest`.

## Configurações próprias

- [x] Permitir alteração da própria senha; a alteração do e-mail ainda não está disponível.
- [x] Impedir alteração do nome na configuração atual.
- [ ] Manter o CPF imutável após criação da conta.
- [ ] Permitir ao discente alterar RG, nascimento e endereço atual.
- [ ] Impedir edição de dados pessoais por outro vínculo.

## Próxima fase

[Fase 03 — Activity Log](doc:fase-03-activity-log)
