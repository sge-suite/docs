---
id: fase-05-administracao
title: Fase 05 — Administração hierárquica
description: Implementação do backend e das interfaces administrativas em ordem de escopo, do global ao local.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/autorizacao, sge/checklist
related: pessoas-e-responsabilidades, matriz-de-autorizacao, perfis-e-responsabilidades-por-vinculo, fase-06-documentos
source_refs:
---
Base: [papéis por vínculo](doc:pessoas-e-responsabilidades), [Matriz de autorização](doc:matriz-de-autorizacao) e [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).

A estrutura de perfis e o contexto de vínculo existem. O provisionamento inicial ou a inclusão de Administrador do Sistema já pode ser feita com `admin:create`; esta fase ainda precisa construir as operações administrativas do sistema e suas interfaces. Implemente cada perfil em duas partes: primeiro Policy/escopo, Action e testes; depois a interface que chama esse backend.

## Policies e escopo

- [x] Disponibilizar o contexto único do vínculo ativo para Policies e Actions por `ActiveAffiliationContext`; completar os resolvedores de escopo por recurso junto de cada fluxo.
- [ ] Criar Policies para pessoa, vínculo, campus, curso, tipo, concedente, estágio e documento.
- [ ] Validar usuário, vínculo ativo, `AffiliationType`, campus/curso, posse e estado do registro em toda ação.
- [ ] Registrar `Gate::before` exclusivamente para acesso global do Administrador do Sistema e testar que o vínculo ativo continua obrigatório.
- [ ] Criar testes positivos e negativos por função.
- [ ] Cobrir para cada `AffiliationType` as ações, limites, destinatários de notificação e consultas descritos em [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).
- [ ] Impedir que Administrador do Campus cadastre Administrador do Sistema.
- [ ] Permitir ao Setor de Estágio cadastrar usuários permitidos, exceto administradores.
- [ ] Aplicar as mesmas regras para edição e criação.

## Administrador do Sistema

- [ ] Definir e testar as operações globais permitidas antes de criar suas telas.
- [ ] Cadastrar, editar, ativar e desativar campi.
- [ ] Administrar Administradores do Sistema e do Campus conforme permissão.
- [ ] Reutilizar o subfluxo de conta/adicionar vínculo.
- [x] O comando `admin:create` avisa os e-mails da conta e do vínculo quando adiciona um vínculo existente, deduplicando endereços; na conta nova, cria primeiro vínculo e envia convite apenas ao e-mail compartilhado.
- [ ] Integrar o mesmo comportamento às futuras telas administrativas de criação de conta e vínculo.

## Administrador do Campus

- [ ] Definir e testar o limite de campus antes de criar as telas de gestão local.
- [ ] Editar nome, CNPJ, endereço, telefone, e-mail e representante do próprio campus.
- [ ] Impedir campus alheio, novos campi e alteração do ciclo de ativação.
- [ ] Administrar usuários e vínculos dentro do escopo.
- [ ] Criar/editar cursos, dois coordenadores e tipos de estágio.
- [ ] Impedir acesso a outro campus.

## Setor de Estágio

- [ ] Implementar autorização e Actions de gestão dos cadastros e análises antes de criar as telas operacionais.
- [ ] Administrar templates DOCX e versões.
- [ ] Administrar concedentes e solicitações pendentes.
- [ ] Administrar a importação do calendário nacional/estadual e o cadastro manual de feriados municipais.
- [ ] Analisar estágios enviados.
- [ ] Analisar solicitações de supervisor/concedente.
- [ ] Validar documentos, avaliações, pendências e liberação.
- [ ] Consultar o calendário aplicável e registrar exceções por estágio, sem alterar o calendário global.

## Próxima fase

[Fase 06 — Documentos](doc:fase-06-documentos)
