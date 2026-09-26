---
id: testes-existentes
title: Testes existentes
description: Mapa da cobertura de testes já presente no projeto novo e lacunas conhecidas.
type: technical-reference
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/testes, sge/checklist
related: componentes-tecnicos, desenvolvimento-checklist-de-funcionalidade
source_refs: https://github.com/sge-suite/sge/blob/master/tests/Feature/AffiliationTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CourseTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/NotificationsTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailMessageTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryAttemptTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AddressesTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/UserPersonalDataTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CityCatalogValidationTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/HolidaysTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/FetchCitiesCommandTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/CpfCastTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/PhoneCastTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/FormattingHelpersTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/NumberToWordsHelperTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Auth/PasswordResetTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Settings/SecurityTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CreateAdminCommandTest.php
---
Este mapa acompanha o código real no repositório Laravel irmão, em `../sge`. Ao criar uma classe ou migration, atualize a matriz e a nota técnica correspondente.

## Cobertura atual

| Área     | Teste                                              | O que cobre                                                             |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Cast     | `tests/Unit/CpfCastTest.php`                       | CPF mascarado válido, armazenamento sem máscara e CPF inválido.         |
| Cast     | `tests/Unit/PhoneCastTest.php`                     | Telefone fixo/celular com DDD, entrada com ou sem máscara, armazenamento apenas dos dígitos, vazio e formato inválido. |
| Enums    | `tests/Unit/Enums/AffiliationTypeTest.php`         | cases, valores, labels e options de vínculo.                            |
| Enums    | `tests/Unit/Enums/BrazilianStateTest.php`          | cases, siglas, rótulos e opções das unidades federativas.               |
| Enums    | `tests/Unit/Enums/EmailDeliveryAttemptStatusTest.php` | cases, valores, labels e opções das tentativas de e-mail.             |
| Enums    | `tests/Unit/Enums/EmailMessagePurposeTest.php`     | cases, valores, labels e opções das finalidades de e-mail.             |
| Enums    | `tests/Unit/Enums/EmancipationEvidenceStatusTest.php` | cases, valores, labels e opções de evidências de emancipação.        |
| Enums    | `tests/Unit/Enums/EvaluationStatusTest.php`        | cases, valores, labels e opções das avaliações.                         |
| Enums    | `tests/Unit/Enums/GeneratedDocumentOriginTest.php` | valores, labels e opções de origem.                                     |
| Enums    | `tests/Unit/Enums/GeneratedDocumentStatusTest.php` | valores, labels e opções de status documental.                          |
| Enums    | `tests/Unit/Enums/GeneratedDocumentTypeTest.php`   | cases, valores, labels, opções e conversão de tipo documental.          |
| Enums    | `tests/Unit/Enums/InternshipCancellationRequestStatusTest.php` | cases, valores, labels e opções de pedidos de cancelamento.      |
| Enums    | `tests/Unit/Enums/InternshipRequestCorrectionStatusTest.php` | cases, valores, labels e opções de pendências.                   |
| Enums    | `tests/Unit/Enums/InternshipRequestStatusTest.php` | cases, valores, labels e opções de solicitações.                       |
| Enums    | `tests/Unit/Enums/InternshipStatusTest.php`        | valores, labels e opções do ciclo do estágio.                           |
| Enums    | `tests/Unit/Enums/LegalCapacityDeclarationTest.php` | cases, valores, labels e opções de capacidade civil.                  |
| Enums    | `tests/Unit/Enums/PartyDocumentTypeTest.php`       | valores, labels e opções de CPF/CNPJ.                                   |
| Enums    | `tests/Unit/Enums/RegistrationRequestStatusTest.php` | cases, valores, labels e opções de cadastros pendentes.               |
| Helpers  | `tests/Unit/Helpers/FormattingHelpersTest.php`     | timezone/data, placeholders, telefone com DDI e telefone internacional. |
| Helpers  | `tests/Unit/Helpers/NumberToWordsHelperTest.php`   | números e valores em reais por extenso, incluindo entradas inválidas.  |
| Auth     | `tests/Feature/Auth/*`                             | login, confirmação, reset de senha.                                     |
| Console  | `tests/Feature/CreateAdminCommandTest.php`         | `admin:create`: CPF primeiro; conta nova ou novo vínculo em conta existente, e-mail próprio do vínculo, validações, senha fora da auditoria, administrador ativo, cancelamento, não interativo e rollback. 17 cenários passaram pelo Sail. |
| Settings | `tests/Feature/Settings/*`                         | atualização de perfil e segurança.                                      |
| App      | `tests/Feature/DashboardTest.php`                  | acesso ao dashboard com vínculo ativo.                                  |
| Contexto | `tests/Feature/ActiveAffiliationContextTest.php` | seleção automática, último vínculo usado, escolha, troca, sessão inválida, desativação e vínculo de outra conta. |
| Auditoria Eloquent | `tests/Feature/DatabaseAuditTest.php` | inventário de Models, alterações e exclusões Eloquent, autoria, catálogo de cidades, Jobs, mídia, notificações e transações. |
| Endereços | `tests/Feature/AddressesTest.php`                  | Schema e rollback em PostgreSQL, relações, factories, regras obrigatórias, CEP opcional sem validação de formato, cópia histórica e Activity Log. |
| Dados pessoais e profissionais | `tests/Feature/UserPersonalDataTest.php`          | Schema PostgreSQL, constraints, relações, campos profissionais opcionais compartilhados entre vínculos de supervisor do mesmo usuário, CPF em `users`, validação e rollback da migration. |
| Catálogo de cidades | `tests/Feature/CityCatalogValidationTest.php` / `tests/Unit/FetchCitiesCommandTest.php` | Regras compartilhadas no model/seeder, validação das respostas da coleta e preservação do catálogo diante de payloads inválidos. |
| Feriados | `tests/Feature/HolidaysTest.php`                  | Regras compartilhadas no model e na importação, coerência de escopo/localização e preservação dos registros diante de payloads inválidos. |
| Vínculos | `tests/Feature/AffiliationTest.php` | Schema PostgreSQL, FKs e exclusão, múltiplos vínculos, curso obrigatório para discente, validação PHP e cast enum, ciclo de vida, último uso, factory e Activity Log. |
| Cursos | `tests/Feature/CourseTest.php` | Schema PostgreSQL das Migrations 09 e 10, FKs, dois coordenadores opcionais e elegíveis, campus, vínculos discentes por curso, desativação, exclusão restrita e rollback/reaplicação das Migrations 15, 11, 10 e 09. |
| Tipos de estágio | `tests/Feature/InternshipTypeTest.php` | Schema PostgreSQL com campos escalares, FK para curso, casts, consultas por curso/campus, desativação, validação Laravel em português de pesos inteiros e conceitos, limites mínimos de 6/30, margem e exclusão restrita; o conceito “Ótimo” deriva do peso do supervisor e “Insatisfatório” é configurável por tipo, com padrão zero. |
| Partes concedentes | `tests/Feature/GrantingPartyTest.php` | Schema PostgreSQL, rollback, documento CPF/CNPJ conforme enum, telefone com DDD com ou sem máscara, endereço e representante obrigatórios, área de atuação obrigatória, exclusão restrita do endereço, campos opcionais, unidades com mesmo CNPJ, soft deletes e Activity Log. |
| Pedidos de supervisor | `tests/Feature/SupervisorRegistrationRequestTest.php` | Schema PostgreSQL, FK do vínculo resultante e bloqueio de exclusão pelo Model, casts, relação com Affiliation, estados `Draft` e não-`Draft`, validação e obrigatoriedade, CPF normalizado, motivos de decisão, aprovação vinculada a supervisor e rollback/reaplicação. |
| Pedidos de concedente | `tests/Feature/GrantingPartyRegistrationRequestTest.php` | Schema PostgreSQL, FK restrita e rollback, casts e normalização de CPF/CNPJ, UF, CEP e telefone, estados `Draft` e não-`Draft`, campos obrigatórios, motivos de decisão, aprovação vinculada a concedente, unidades com mesmo CNPJ e bloqueio de exclusão pelo Model. |
| Templates de documentos | `tests/Feature/DocumentTemplateTest.php` | Schema PostgreSQL sem `key`, FK e rollback com a 14, nomes repetidos permitidos, casts, scopes de campus e atividade, desativação e Activity Log. |
| Versões de templates | `tests/Feature/TemplateVersionTest.php` | Schema PostgreSQL com JSONB, FKs e unicidade de número/hash por template; casts, relações, seleção da versão validada mais recente, mídia DOCX privada e única, exclusão de versão sem uso e rollback. |
| Avaliações do supervisor | `tests/Feature/SupervisorEvaluationTest.php` | Schema PostgreSQL com respostas em colunas e rollback da Migration 18, FKs restritas, histórico do supervisor responsável, unicidade por estágio/supervisor, casts, rascunho, ramos condicionais do formulário, critérios, carga horária, análise, cancelamento, imutabilidade do envio, Activity Log e avaliação aprovada vigente. |
| Solicitações de estágio | `tests/Feature/InternshipRequestTest.php` | Schema PostgreSQL e rollback da Migration 19, FKs restritas, unicidade do estágio associado, casts, rascunho e envio, aceite dos termos por data, curso/tipo, caminhos de concedente e supervisor, capacidade civil e CPF do responsável, jornada, remuneração, Activity Log, aceite e bloqueio de exclusão. |
| Estágios | `tests/Feature/InternshipTest.php` | Schema PostgreSQL da Migration 15, FKs restritas, snapshots e jornada inicial em JSONB, casts, vínculo discente e tipo do curso, limites históricos de jornada, remuneração, status, Activity Log e rollback. |
| Documentos gerados | `tests/Feature/GeneratedDocumentTest.php` | Schema PostgreSQL da Migration 16, FKs, token único, origem SGE/externa, template validado, snapshot, transições, cancelamento, Activity Log e rollback com dependências. |
| Pausas de estágio | `tests/Feature/InternshipPauseTest.php` | Schema da Migration 17, FK restrita, datas, sobreposição, estágio em andamento, Activity Log e rollback. |
| Evidências de emancipação | `tests/Feature/EmancipationEvidenceTest.php` | Schema da Migration 19A, mídia privada por envio, análise, vínculo com a solicitação, FK restrita e rollback. |
| Correções de solicitação | `tests/Feature/InternshipRequestCorrectionTest.php` | Schema JSONB da Migration 20, seções, estados, uma correção aberta, datas, FK restrita e rollback. |
| Pedidos de cancelamento | `tests/Feature/InternshipCancellationRequestTest.php` | Schema da Migration 21, estados, motivos, data efetiva, pedido pendente único, FK restrita e rollback. |
| Exceções de calendário | `tests/Feature/InternshipCalendarOverrideTest.php` | Schema da Migration 22A, unicidade por estágio/data, motivo, Activity Log e rollback. |
| Vigências de jornada | `tests/Feature/InternshipWorkScheduleTest.php` | Schema JSONB da Migration 23, aditivo assinado, limites diários e semanais, continuidade, imutabilidade, FKs restritas e rollback. |
| Notificações | `tests/Feature/NotificationsTest.php` | Schema PostgreSQL nativo com `jsonb` e UUID, relação polimórfica, leitura/não leitura, isolamento entre vínculos da mesma conta, notificações destinadas a `User`, Policy de vínculo ativo e rollback/reaplicação. 7 testes e 77 assertions passaram por Sail. |
| Mensagens de e-mail | `tests/Feature/EmailMessageTest.php` | Schema PostgreSQL, conteúdo de notificação sem destinatário, snapshot imutável, finalidade e chave UUID única de idempotência. |
| Tentativas de entrega | `tests/Feature/EmailDeliveryAttemptTest.php` | Schema PostgreSQL, mensagem opcional para convite, destinatário e vínculo solicitante, estados, marcos, motivo sanitizado e imutabilidade das tentativas concluídas. |

## Lacunas prioritárias

- [ ] Criar testes de integração para as futuras migrations de domínio, em banco limpo.
- [ ] Criar testes de rollback das migrations reversíveis.
- [ ] Ampliar a cobertura de `CurrencyHelper`, dos formatos de `DateHelper` e dos comprimentos de telefone/documentos.
- [ ] Completar a cobertura de `null`, vazio, formato inválido e timezone em todos os helpers.
- [ ] Cobrir `ProfileValidationRules` e todos os requisitos de `PasswordValidationRules`.
- [ ] Cobrir `ResetUserPassword` com senha fraca, confirmação divergente e sucesso.
- [ ] Cobrir `AppServiceProvider` e `FortifyServiceProvider` por comportamento observável.
- [ ] Completar testes de autorização dos catálogos e fluxos de estágio; a caixa de notificações já cobre propriedade da conta e vínculo ativo.

Os 17 cenários de `admin:create` estão incluídos na suíte completa, executada via Sail: 561 testes passaram e 2 foram ignorados, de 563.

## Comandos

```bash
cd ../sge
./vendor/bin/sail composer run lint:check
./vendor/bin/sail composer run types:check
./vendor/bin/sail artisan test
./vendor/bin/sail composer run test
```

## Relacionamentos

- [Componentes técnicos](doc:componentes-tecnicos)
- [Checklist de funcionalidade](doc:desenvolvimento-checklist-de-funcionalidade)
- [Painel de desenvolvimento](doc:painel-de-desenvolvimento)
