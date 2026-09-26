---
id: fase-02-conta-e-contexto
title: Fase 02 — Conta e contexto
description: Checklist de autenticação, vínculos ativos e configurações próprias.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/autenticacao, sge/checklist
related: modelo-de-dados-acesso, e-mails-notificacoes-e-entregas, fluxos-principais, fase-03-activity-log, fase-05-administracao
source_refs: https://github.com/sge-suite/sge/blob/master/app/Support/ActiveAffiliationContext.php, https://github.com/sge-suite/sge/blob/master/app/Http/Middleware/RequireActiveAffiliation.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/AffiliationSelectionController.php, https://github.com/sge-suite/sge/blob/master/app/Console/Commands/CreateAdmin.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/ActiveAffiliationContextTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CreateAdminCommandTest.php
---
Referências: [modelo de acesso](doc:modelo-de-dados-acesso), [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas) e [fluxo de login](doc:fluxos-principais#1-acesso-e-vinculo).

O contexto de vínculo ativo, a proteção do painel, a tela de seleção e o comando de bootstrap do primeiro Administrador do Sistema estão implementados. Os testes do comando e a suíte completa passaram via Sail: 561 testes passaram e 2 foram ignorados, de 563.

## Login e recuperação de senha

- [x] Configurar Fortify para autenticar por `users.email`.
- [x] Disponibilizar “Esqueci minha senha” com link de uso único e expiração pelo broker do Fortify.
- [x] Não persistir o envio de recuperação de senha nas tabelas de mensagens e tentativas.
- [ ] Impedir token, URL e conteúdo sensível em logs.
- [x] Aplicar senha de 8–64 caracteres, maiúsculas/minúsculas, número, símbolo e verificação contra senhas comprometidas nos fluxos existentes.
- [x] Testar solicitação, renderização e redefinição com link válido.
- [ ] Completar testes de link expirado, reutilizado e solicitação repetida.

## Criação de conta

- [x] Disponibilizar `php artisan admin:create` para criar o primeiro vínculo ativo de Administrador do Sistema em uma transação Eloquent. O comando só prossegue quando não existe administrador do sistema ativo; contas comuns e vínculos administradores desativados não impedem o bootstrap.
- [x] Solicitar primeiro o CPF com 11 dígitos sem pontuação. Se a conta não existir, pedir nome, e-mail da conta, registro institucional e senha com confirmação oculta; o mesmo e-mail é salvo na conta e no vínculo. Se a conta já existir para o CPF, conservar seus dados e pedir somente o e-mail do novo vínculo e o registro institucional, sem pedir nova senha. O vínculo não recebe campus nem curso. Para uma nova conta, exibir as regras de senha antes do primeiro campo e validá-las na primeira entrada; só pedir a confirmação depois que a senha passar.
- [x] Validar campos e CPF antes de gravar. Para uma nova conta, exigir e-mail de conta ainda não usado; o e-mail do vínculo da conta existente é validado como endereço, sem exigir unicidade entre contas. O comando não envia e-mail. A criação é atribuída ao sistema no Activity Log e a senha e seu hash ficam fora do evento.
- [x] Não exigir confirmação ou código de verificação de e-mail para o bootstrap inicial.
- [ ] Implementar a criação de contas e vínculos pelo fluxo da aplicação.
- [ ] Enviar convite inicial e registrar somente a tentativa de entrega, sem conteúdo salvo. O link deve abrir a tela de recuperação de senha com o e-mail preenchido; a pessoa solicita o link de redefinição nessa tela. Esse fluxo de convite ainda não foi implementado.

`CreateAdminCommandTest` cobre os caminhos de conta nova e CPF existente, e-mails da conta e do vínculo, validações, bloqueio por administrador ativo, vínculo inativo, confirmação, execução não interativa, auditoria e rollback. `ProfileUpdateTest` cobre a alteração do e-mail da conta, unicidade e preservação do e-mail do vínculo.

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

- [x] Permitir alteração da própria senha e do e-mail da conta autenticada. O novo e-mail passa a ser usado no login e na recuperação de senha; a alteração não modifica `affiliations.email` e, no escopo atual, não pede confirmação por e-mail.
- [x] Impedir alteração do nome na configuração atual.
- [ ] Manter o CPF imutável após criação da conta.
- [ ] Permitir ao discente alterar RG, nascimento e endereço atual.
- [ ] Impedir edição de dados pessoais por outro vínculo.

## Fase seguinte na sequência

O contexto da conta e do vínculo ativo está implementado. [Fase 03 — Activity Log](doc:fase-03-activity-log) registra a etapa seguinte, também já implementada; a criação de contas pela interface, o convite e as demais pendências desta fase continuam em aberto.
