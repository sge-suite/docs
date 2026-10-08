---
id: testes-existentes
title: Testes existentes
description: Mapa da cobertura de testes já presente no projeto novo e lacunas conhecidas.
type: technical-reference
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/testes, sge/checklist
related: componentes-tecnicos, desenvolvimento-checklist-de-funcionalidade
source_refs: https://github.com/sge-suite/sge/blob/master/tests/Feature/AffiliationTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CourseTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/NotificationsTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailMessageTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryAttemptTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailLogInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AuditInterfaceTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AddressesTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/UserPersonalDataTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CityCatalogValidationTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/HolidaysTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/FetchCitiesCommandTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/CpfCastTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/PhoneCastTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/FormattingHelpersTest.php, https://github.com/sge-suite/sge/blob/master/tests/Unit/Helpers/NumberToWordsHelperTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Auth/PasswordResetTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/Settings/SecurityTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/CreateAdminCommandTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/EmailDeliveryFlowTest.php, https://github.com/sge-suite/sge/blob/master/tests/Feature/AccordionComponentTest.php
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
| Console  | `tests/Feature/CreateAdminCommandTest.php`         | `admin:create`: CPF primeiro; conta e primeiro vínculo com e-mail igual ou novo vínculo em conta existente; validação de e-mail/CPF, avisos enfileirados, autoria `terminal`, ausência da senha na auditoria, administrador ativo já existente, cancelamento, não interativo e rollback. |
| Settings | `tests/Feature/Settings/*`                         | Perfil exibe e-mail com acesso a Segurança; troca de e-mail exige senha, confirmação do endereço e vínculo ativo, preserva o e-mail do vínculo, registra autoria e reserva dois avisos; unicidade e atualização de senha. |
| App      | `tests/Feature/DashboardTest.php`                  | acesso ao dashboard com vínculo ativo.                                  |
| Contexto | `tests/Feature/ActiveAffiliationContextTest.php` | seleção automática, último vínculo usado, escolha, troca, sessão inválida, desativação e vínculo de outra conta. |
| Gestão de campi | `tests/Feature/CampusManagementTest.php` | permissões e consulta por vínculo, cadastro, campos editáveis por perfil, endereço exclusivo, auditoria, desativação com senha, bloqueio em campus inativo, reativação, preservação de vínculos e rollback. |
| Interface de campi | `tests/Feature/CampusInterfaceTest.php` | páginas e navegação exclusivas do Administrador do Sistema, contexto selecionado, busca por nome, filtros e paginação, cidades por UF, erros e dados do formulário, confirmação de desativação sem preservar senha, leitura de campus inativo, reautorização Livewire e identidade bloqueada. |
| Busca de campi e cidades | `tests/Feature/CampusSearchTest.php` | Meilisearch real em índices isolados, tolerância a erro no nome, ausência de resultado para CNPJ formatado, situação e UF, criação/edição/transições/exclusão, sincronização após commit, fila e rollback sem publicar registros descartados. |
| Select customizado | `tests/Feature/SelectComponentTest.php` | contrato de formulário, valor selecionado, campo obrigatório, marcação acessível, estilos Flux, ícones opcionais, versões com/sem busca, compilação dos atributos Alpine, escape de opções e erros de validação. |
| Consulta de CNPJ | `tests/Feature/BrasilApiCompanyLookupTest.php` | validação e normalização sem chamada para CNPJ inválido, mapeamento da BrasilAPI, falhas HTTP/conexão/resposta, preenchimento editável sem gravação/auditoria, cidade por código IBGE e UF, dados parciais e preservação manual, nova tentativa, reautorização e identidade do campus bloqueada. As chamadas HTTP são simuladas. |
| Auditoria Eloquent | `tests/Feature/DatabaseAuditTest.php` | inventário de Models e tabelas; criação, edição e exclusão; campos fillable e `emancipation_verified_at` com valores anteriores/novos e autoria por vínculo (sem id ou timestamps); credenciais excluídas; catálogo de cidades, Jobs, mídia, notificações, cascata Eloquent e rollback transacional. |
| Interface de auditoria | `tests/Feature/AuditInterfaceTest.php` | Vínculo ativo e selecionado de Administrador do Sistema, autorização em cada requisição/ação Livewire, perfis e contextos negados, escopo de campi/contas/vínculos administrativos, valores realmente registrados, criações sem coluna anterior, histórico ao fim dos detalhes e ausência de atividades geradas pela leitura. |
| Endereços | `tests/Feature/AddressesTest.php`                  | Schema e rollback em PostgreSQL, relações, factories, regras obrigatórias, CEP opcional sem validação de formato, cópia histórica e Activity Log. |
| Dados pessoais e profissionais | `tests/Feature/UserPersonalDataTest.php`          | Schema PostgreSQL, constraints, relações, campos profissionais opcionais compartilhados entre vínculos de supervisor do mesmo usuário, CPF em `users`, validação e rollback da migration. |
| Catálogo de cidades | `tests/Feature/CityCatalogValidationTest.php` / `tests/Unit/FetchCitiesCommandTest.php` | Regras compartilhadas no model/seeder, validação das respostas da coleta e preservação do catálogo diante de payloads inválidos. |
| Feriados | `tests/Feature/HolidaysTest.php`                  | Regras compartilhadas no model e na importação, coerência de escopo/localização e preservação dos registros diante de payloads inválidos. |
| Vínculos | `tests/Feature/AffiliationTest.php` | Schema PostgreSQL, FKs e exclusão, múltiplos vínculos, curso obrigatório para discente, validação PHP e cast enum, ciclo de vida, último uso, factory e Activity Log. |
| Cursos | `tests/Feature/CourseTest.php` | Schema PostgreSQL das Migrations 09 e 10, FKs, dois coordenadores opcionais e elegíveis, campus, vínculos discentes por curso, desativação, exclusão restrita e rollback/reaplicação das Migrations 15, 11, 10 e 09. |
| Tipos de estágio | `tests/Feature/InternshipTypeTest.php` | Schema PostgreSQL com campos escalares, FK para curso, casts, consultas por curso/campus, desativação, validação Laravel em português de pesos inteiros e conceitos, limites mínimos de 6/30, margem e exclusão restrita; o conceito “Ótimo” deriva do peso do supervisor e “Insatisfatório” é configurável por tipo, com padrão zero. |
| Partes concedentes | `tests/Feature/GrantingPartyTest.php` | Schema PostgreSQL com FK/index de campus, rollback, documento CPF/CNPJ conforme enum, telefone com DDD com ou sem máscara, endereço e representante obrigatórios, exclusão restrita do endereço, campos opcionais, CPF/CNPJ repetidos, campus imutável, soft deletes e Activity Log. |
| Pedidos de supervisor | `tests/Feature/SupervisorRegistrationRequestTest.php` | Schema PostgreSQL, FK do vínculo resultante e bloqueio de exclusão pelo Model, casts, relação com Affiliation, estados `Draft` e não-`Draft`, validação e obrigatoriedade, CPF normalizado, motivos de decisão, aprovação vinculada a supervisor e rollback/reaplicação. |
| Pedidos de concedente | `tests/Feature/GrantingPartyRegistrationRequestTest.php` | Schema PostgreSQL com FK/index de campus, FK restrita e rollback, casts e normalização de CPF/CNPJ, UF, CEP e telefone, estados `Draft` e não-`Draft`, campos obrigatórios, motivos de decisão, aprovação vinculada a concedente do mesmo campus, campus imutável e bloqueio de exclusão pelo Model. |
| Templates de documentos | `tests/Feature/DocumentTemplateTest.php` | Schema PostgreSQL sem `key`, FK e rollback com a 14, nomes repetidos permitidos, casts, scopes de campus e atividade, desativação e Activity Log. |
| Versões de templates | `tests/Feature/TemplateVersionTest.php` | Schema PostgreSQL com JSONB, FKs e unicidade de número/hash por template; casts, relações, seleção da versão validada mais recente, mídia DOCX privada e única, exclusão de versão sem uso e rollback. |
| Avaliações do supervisor | `tests/Feature/SupervisorEvaluationTest.php` | Schema PostgreSQL com respostas em colunas e rollback da Migration 18, FKs restritas, histórico do supervisor responsável, unicidade por estágio/supervisor, casts, rascunho, ramos condicionais do formulário, critérios, carga horária, análise, cancelamento, imutabilidade do envio, Activity Log e avaliação aprovada vigente. |
| Solicitações de estágio | `tests/Feature/InternshipRequestTest.php` | Schema PostgreSQL e rollback da Migration 19, FKs restritas, unicidade do estágio associado, casts, rascunho e envio, aceite dos termos por data, curso/tipo, caminhos de concedente e supervisor com escopo de campus, capacidade civil e CPF do responsável, jornada, remuneração, Activity Log, aceite e bloqueio de exclusão. |
| Estágios | `tests/Feature/InternshipTest.php` | Schema PostgreSQL da Migration 15, FKs restritas, snapshots e jornada inicial em JSONB, casts, vínculo discente, concedente do mesmo campus e tipo do curso, limites históricos de jornada, remuneração, status, Activity Log e rollback. |
| Documentos gerados | `tests/Feature/GeneratedDocumentTest.php` | Schema PostgreSQL da Migration 16, FKs, token único, origem SGE/externa, template validado, snapshot, transições, cancelamento, Activity Log e rollback com dependências. |
| Pausas de estágio | `tests/Feature/InternshipPauseTest.php` | Schema da Migration 17, FK restrita, datas, sobreposição, estágio em andamento, Activity Log e rollback. |
| Evidências de emancipação | `tests/Feature/EmancipationEvidenceTest.php` | Schema da Migration 19A, mídia privada por envio, análise, vínculo com a solicitação, FK restrita e rollback. |
| Correções de solicitação | `tests/Feature/InternshipRequestCorrectionTest.php` | Schema JSONB da Migration 20, seções, estados, uma correção aberta, datas, FK restrita e rollback. |
| Pedidos de cancelamento | `tests/Feature/InternshipCancellationRequestTest.php` | Schema da Migration 21, estados, motivos, data efetiva, pedido pendente único, FK restrita e rollback. |
| Exceções de calendário | `tests/Feature/InternshipCalendarOverrideTest.php` | Schema da Migration 22A, unicidade por estágio/data, motivo, Activity Log e rollback. |
| Vigências de jornada | `tests/Feature/InternshipWorkScheduleTest.php` | Schema JSONB da Migration 23, aditivo assinado, limites diários e semanais, continuidade, imutabilidade, FKs restritas e rollback. |
| Notificações | `tests/Feature/NotificationsTest.php` | Schema PostgreSQL nativo com `jsonb` e UUID, relação polimórfica, leitura/não leitura, isolamento entre vínculos da mesma conta, notificações destinadas a `User`, Policy de vínculo ativo e rollback/reaplicação. |
| Mensagens de e-mail | `tests/Feature/EmailMessageTest.php` | Schema PostgreSQL, conteúdo de mensagens operacionais e administrativas, snapshot imutável, finalidade e chave UUID única de idempotência. |
| Tentativas de entrega | `tests/Feature/EmailDeliveryAttemptTest.php` | Schema PostgreSQL, relação opcional com conteúdo para compatibilidade histórica, destinatário e vínculo solicitante, contexto imutável, estados, marcos, motivo sanitizado e imutabilidade das tentativas concluídas. |
| Entregas de e-mail | `tests/Feature/EmailDeliveryFlowTest.php` | Reserva idempotente, autoria do solicitante, fila após commit, renderização e persistência dos templates administrativos, conteúdo anterior/novo do aviso e falha/reprocessamento; testes sem entrega SMTP. |
| Consulta de e-mails | `tests/Feature/EmailLogInterfaceTest.php` | Acesso por vínculo ativo e selecionado de Administrador do Sistema, revalidação por Policy, exclusão de perfis/contextos não autorizados, escopo administrativo por registro afetado, conteúdo e tentativas, fallback seguro e isolamento do HTML. |
| Interface | `tests/Feature/AccordionComponentTest.php` | Componente genérico com título/conteúdo fornecidos pela chamada e atributos de acessibilidade. |

## Lacunas prioritárias

- [ ] Criar testes de integração para as futuras migrations de domínio, em banco limpo.
- [ ] Criar testes de rollback das migrations reversíveis.
- [ ] Ampliar a cobertura de `CurrencyHelper`, dos formatos de `DateHelper` e dos comprimentos de telefone/documentos.
- [ ] Completar a cobertura de `null`, vazio, formato inválido e timezone em todos os helpers.
- [ ] Integrar e testar diretamente `ProfileValidationRules`; o formulário atual de Segurança usa regras próprias.
- [ ] Ampliar os casos negativos de `PasswordValidationRules` e cobrir tokens de redefinição expirados/reutilizados.
- [ ] Cobrir locale/timezone de `AppServiceProvider` e configurações de `FortifyServiceProvider`; autoria e integridade do Activity Log já têm testes de feature.
- [ ] Completar testes de autorização dos catálogos e fluxos de estágio; a caixa de notificações já cobre propriedade da conta e vínculo ativo.

Os testes de `admin:create` e da troca de e-mail usam fila falsa; os testes de templates validam a renderização em memória. A matriz descreve cobertura, não uma execução recente da suíte.

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
