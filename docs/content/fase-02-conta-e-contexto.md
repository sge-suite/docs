---
id: fase-02-conta-e-contexto
title: Fase 02 — Conta e contexto
description: Checklist de autenticação, vínculos ativos e configurações próprias.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/autenticacao, sge/checklist
related: modelo-de-dados-acesso, e-mails-notificacoes-e-entregas, fluxos-principais, fase-03-activity-log, fase-05-administracao
source_refs: https://github.com/sge-suite/sge/blob/master/app/Support/ActiveAffiliationContext.php, https://github.com/sge-suite/sge/blob/master/app/Http/Middleware/RequireActiveAffiliation.php, https://github.com/sge-suite/sge/blob/master/app/Http/Controllers/AffiliationSelectionController.php, https://github.com/sge-suite/sge/blob/master/app/Console/Commands/CreateAdmin.php, https://github.com/sge-suite/sge/blob/master/resources/views/pages/settings/%E2%9A%A1security.blade.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/ActiveAffiliationContextTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CreateAdminCommandTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Settings/SecurityTest.php
---
Referências: [modelo de acesso](doc:modelo-de-dados-acesso), [E-mails, notificações e entregas](doc:e-mails-notificacoes-e-entregas) e [fluxo de login](doc:fluxos-principais#1-acesso-e-vinculo).

O contexto de vínculo ativo, a proteção do painel, a seleção e troca de vínculo, `admin:create` e as configurações próprias de senha e e-mail estão implementados. O Administrador do Sistema também pode cadastrar contas e vínculos administrativos pela interface, na [Fase 05](doc:fase-05-administracao). A edição de perfil pessoal fora da administração de contas segue pendente.

## Login e recuperação de senha

- [x] Configurar Fortify para autenticar por `users.email`.
- [x] Disponibilizar “Esqueci minha senha” com link de uso único e expiração pelo broker do Fortify.
- [x] Não persistir o envio de recuperação de senha nas tabelas de mensagens e tentativas.
- [ ] Impedir token, URL e conteúdo sensível em logs.
- [x] Aplicar senha de 8–64 caracteres, maiúsculas/minúsculas, número, símbolo e verificação contra senhas comprometidas nos fluxos existentes.
- [x] Testar solicitação, renderização e redefinição com link válido.
- [ ] Completar testes de link expirado, reutilizado e solicitação repetida.

## Criação de conta

- [x] Disponibilizar `php artisan admin:create` para criar uma conta com seu primeiro vínculo ativo de Administrador do Sistema ou adicionar esse vínculo a uma conta encontrada pelo CPF. O comando pode ser executado mesmo quando já existe outro Administrador do Sistema ativo.
- [x] Solicitar primeiro o CPF com 11 dígitos sem pontuação. Se a conta não existir, pedir nome, e-mail e registro institucional; o mesmo e-mail é salvo na conta e no primeiro vínculo. Se a conta já existir para o CPF, conservar seus dados e pedir somente o e-mail do novo vínculo e o registro institucional. O vínculo de Administrador do Sistema não recebe campus nem curso. O comando nunca pede senha: gera uma senha aleatória desconhecida e enfileira um convite para a pessoa solicitar o link de definição de senha.
- [x] Validar cada entrada antes de avançar no `admin:create`: validar CPF, barrar no campo CPF quando a conta já tem Administrador do Sistema ativo e verificar o registro institucional antes de pedir confirmação. Matrículas só podem se repetir entre vínculos da mesma pessoa, inclusive quando o vínculo existente está desativado. Para uma conta nova, exigir e-mail ainda não usado e compartilhá-lo com o primeiro vínculo. Ao adicionar vínculo a uma conta existente, preservar os dados da conta e enfileirar aviso para `users.email` e `affiliations.email`; se os endereços forem iguais, enviar apenas um aviso. O aviso leva ao login. As gravações são transacionais; o Activity Log identifica o ator como `terminal` e exclui senha/hash.
- [x] Não exigir confirmação ou código de verificação de e-mail para o bootstrap inicial.
- [x] Implementar a criação de contas e vínculos administrativos pela interface do Administrador do Sistema; consultar o CPF antes do envio, preservar a conta existente e reutilizar a Action transacional do `admin:create`. Ver [Fase 05](doc:fase-05-administracao).
- [x] No `admin:create`, salvar o conteúdo renderizado do convite e do aviso de novo vínculo junto às tentativas, sem incluir senha, token ou URL assinada. O convite informa o primeiro vínculo e leva à recuperação com o e-mail preenchido para solicitar a definição da senha; o aviso de vínculo novo leva ao login.

`CreateAdminCommandTest` cobre conta nova e CPF existente, validação no prompt de cada entrada, titularidade do registro institucional, e-mails da conta e do vínculo, criação mesmo com outro administrador ativo, confirmação, execução não interativa, autoria `terminal` e rollback. `AffiliationTest` e `UserManagementTest` cobrem reutilização de matrícula pela mesma pessoa e rejeição de matrícula pertencente a outra pessoa. `ProfileUpdateTest` verifica a exibição do e-mail da conta e o encaminhamento para Segurança. `SecurityTest` cobre a troca do e-mail, senha atual, confirmação do novo endereço, unicidade, preservação do e-mail do vínculo, autoria e reserva dos dois avisos. Os testes substituem a fila e não enviam e-mails para SMTP/Mailpit.

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
> `ActiveAffiliationContext` consulta apenas vínculos ativos da conta, valida o identificador guardado em `active_affiliation_id` a cada requisição funcional e exige nova escolha quando inválido, desativado ou pertencente a outra conta. Um único vínculo é selecionado automaticamente. Com vários, restaura o mais recentemente usado quando existe `last_used_at`; se nenhum foi usado, a pessoa escolhe em `affiliations/select`. A seleção e troca explícitas atualizam `last_used_at`; restauração e requisições comuns não atualizam. A seleção do vínculo é memória operacional e não gera registro no Activity Log. `RequireActiveAffiliation` protege o painel e a Policy de notificações exige o vínculo selecionado. O contexto é acessível por injeção do serviço em Policies e Actions. `SetAuditActor` passa o vínculo validado ao `CauserResolver` do Spatie durante ações auditáveis. A rota de seleção continua `affiliations/select`; a troca fica no dropdown do perfil e aparece somente quando há mais de um vínculo ativo. Testes: `ActiveAffiliationContextTest`, `DashboardTest`, `NotificationsTest` e `DatabaseAuditTest`.

## Configurações próprias

- [x] Exibir o e-mail da conta sem edição em Perfil, com link para Segurança. Em Segurança, exigir confirmação de senha para acessar a página e pedir a senha atual e duas entradas iguais do novo e-mail no formulário de troca. Validar formato e unicidade, normalizar o endereço e exigir vínculo ativo da própria conta. A atualização de `users.email` e a reserva de dois avisos na fila ocorrem na mesma transação: um para o endereço anterior e outro para o novo. O novo e-mail passa a ser usado no login e na recuperação de senha; `affiliations.email` permanece igual. O fluxo não exige confirmação pelo novo endereço antes da troca.
- [x] Impedir alteração do nome na configuração atual.
- [x] Permitir ao Administrador do Sistema corrigir o CPF na edição administrativa da conta, validando formato e unicidade; a pessoa não o altera na configuração própria.
- [ ] Permitir ao discente alterar RG, nascimento e endereço atual.
- [ ] Impedir edição de dados pessoais por outro vínculo.

## Fase seguinte na sequência

O contexto e as configurações de acesso implementados dão suporte às próximas fases. A gestão administrativa de contas e vínculos está disponível; seguem em aberto as edições pessoais próprias e as jornadas de domínio.
