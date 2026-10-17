---
id: model-user
title: Model — User
description: Conta autenticável, relações, notificações de senha, autoria no Activity Log e identificação administrável.
type: technical-reference
status: in-progress
visibility: public
tags: sge/models, sge/autenticacao, sge/dados-pessoais
related: cast-cpfcast, migration-02-user-personal-data, migration-04-affiliations, concern-profilevalidationrules
source_refs: https://github.com/sge-suite/sge/blob/master/app/Models/User.php, https://github.com/sge-suite/sge/blob/master/app/Notifications/QueuedPasswordReset.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeActivityScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/AdministrativeEmailLogScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusActivityScope.php, https://github.com/sge-suite/sge/blob/master/app/Support/CampusEmailLogScope.php
---
## Responsabilidade atual

Model autenticável do Laravel. Usa `HasFactory`, `LogsActivity` e `Notifiable`, representa a conta de login e fornece as iniciais para a interface.

| Elemento           | Estado atual                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| atributos fillable | `name`, `cpf`, `email`, `password`, via `#[Fillable]`.                         |
| atributos ocultos  | `password`, `remember_token`, via `#[Hidden]`.                                 |
| casts              | `cpf` → [Cast — CpfCast](doc:cast-cpfcast) (`CpfCast`); `password` → `hashed`.           |
| `initials()`       | Usa `Str::initials()` e retorna primeira/última inicial quando há mais de uma. |
| relações           | `personalData()` é um perfil opcional um-para-um; `affiliations()` retorna os vínculos institucionais; notificações nativas são fornecidas por `Notifiable`. |

## Auditoria e e-mail

`LogsActivity` registra alterações dos campos fillable, exceto `password`. A mudança de senha gera `password_changed` sem valor anterior, senha nova ou hash. `sendPasswordResetNotification()` usa `QueuedPasswordReset`, enfileirada após o commit e criptografada; recuperação não cria linhas em `email_messages` ou `email_delivery_attempts`.

A auditoria e o histórico de e-mails compartilham telas entre Administrador do Sistema e Setor de Estágio, exigindo o vínculo ativo selecionado em cada requisição. Na consulta global, o Administrador inclui contas com vínculos administrativos. O Setor consulta contas com vínculos atuais do próprio campus e seus vínculos locais, exceto Administrador do Sistema; atividades dos dados de acesso de outros administradores ficam protegidas, com exceção para a própria conta. O histórico de e-mails usa o snapshot do registro afetado em `scope_context`, preservado após exclusão de vínculo; não infere autorização pelo destinatário ou solicitante. O Setor consulta mensagens de cadastro e alterações ligadas ao campus e pode ver avisos de alteração do próprio e-mail mesmo quando também possui vínculo global. Detalhes em [Fase 05](doc:fase-05-administracao).


## Delimitação de responsabilidade

`users` mantém autenticação, CPF e e-mail de login. O Administrador do Sistema e o Setor de Estágio autorizado podem editar nome, CPF e e-mail pela área Usuários; o Setor fica limitado às contas do campus, não altera dados de acesso de outros administradores e pode editar a própria conta mesmo quando também possui vínculo de Administrador do Sistema; a alteração do endereço de login envia avisos ao endereço anterior e ao novo. [`user_personal_data`](doc:migration-02-user-personal-data) guarda dados pessoais atuais, telefone compartilhado e cargo/função do supervisor em um perfil por conta. As qualificações do supervisor ficam em uma relação um-para-muitos separada. Cadastro e login não exigem esse perfil. O Setor pode informar ou editar o cargo/função e as qualificações ao cadastrar ou editar um vínculo de supervisor, sem matrícula. A aba Dados pessoais permite ao Supervisor manter várias formações e experiências, além do telefone compartilhado. No contexto Discente, permite RG, órgão emissor, emissão, nascimento, telefone e endereço com busca por CEP e revisão. Policy e Action revalidam a própria conta e o vínculo ativo selecionado, sem editar dados de acesso ou snapshots históricos. Excluir um vínculo não exclui a conta nem esse perfil.

## Checklist

- [x] Configurar autenticação Eloquent para `User`.
- [x] Ocultar senha e remember token.
- [x] Aplicar cast de senha com hash automático.
- [x] Aplicar `CpfCast` no estado atual.
- [x] Criar relações com `Affiliation` e `UserPersonalData` e habilitar notificações nativas do Laravel. A conta não possui relação direta com `EmailMessage`; seu histórico é separado.
- [x] Manter CPF em `$fillable`, docblock e casts de `User`.
- [x] Disponibilizar configuração própria de dados pessoais de Discente e Supervisor por meio do perfil único da conta, com campos restritos ao vínculo ativo selecionado.
- [ ] Testar conta sem dados pessoais completos.
- [ ] Testar conta com múltiplos vínculos em PostgreSQL.
- [x] Permitir a administração de nome, CPF e e-mail de login por `UserController`, preservando as notificações de troca de e-mail e a auditoria sem senha.
- [ ] Testar recuperação enfileirada sem persistir token ou corpo nas tabelas próprias de e-mail.
- [x] Registrar no Activity Log os campos pessoais e profissionais alterados de `UserPersonalData`, com valores anteriores/novos e autoria do vínculo ativo.

## Relacionamentos

- [user_personal_data](doc:migration-02-user-personal-data)
- [CpfCast](doc:cast-cpfcast)
- [ProfileValidationRules](doc:concern-profilevalidationrules)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
