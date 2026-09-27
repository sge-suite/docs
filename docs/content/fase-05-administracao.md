---
id: fase-05-administracao
title: Fase 05 — Administração hierárquica
description: Implementação do backend e das interfaces administrativas em ordem de escopo, do global ao local.
type: development-phase
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/autorizacao, sge/checklist
related: pessoas-e-responsabilidades, matriz-de-autorizacao, perfis-e-responsabilidades-por-vinculo, fase-06-documentos
source_refs:
---
Base: [papéis por vínculo](doc:pessoas-e-responsabilidades), [Matriz de autorização](doc:matriz-de-autorizacao) e [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).

A estrutura de perfis e o contexto de vínculo existem. O provisionamento inicial ou a inclusão de Administrador do Sistema já pode ser feita com `admin:create`. O backend de gestão de campi foi implementado em `CampusController`, com `CampusPolicy`, Form Requests, Eloquent e testes. As views e as demais operações administrativas continuam pendentes. As futuras telas usarão Livewire segundo as convenções do projeto, mantendo controllers para fluxos HTTP tradicionais; a reatividade será aplicada onde trouxer benefício, sem duplicar autorização ou validação.

## Policies e escopo

- [x] Disponibilizar o contexto único do vínculo ativo para Policies e Actions por `ActiveAffiliationContext`; completar os resolvedores de escopo por recurso junto de cada fluxo.
- [x] Criar `CampusPolicy` para consulta e gestão de campi, usando somente o vínculo ativo selecionado.
- [ ] Criar Policies para pessoa, vínculo, curso, tipo, concedente, estágio e documento.
- [ ] Validar usuário, vínculo ativo, `AffiliationType`, campus/curso, posse e estado do registro em toda ação.
- [ ] Registrar `Gate::before` exclusivamente para acesso global do Administrador do Sistema e testar que o vínculo ativo continua obrigatório.
- [x] Criar testes positivos e negativos para as operações de campus.
- [ ] Criar testes positivos e negativos dos demais recursos por função.
- [ ] Cobrir para cada `AffiliationType` as ações, limites, destinatários de notificação e consultas descritos em [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).
- [ ] Impedir que Administrador do Campus cadastre Administrador do Sistema.
- [ ] Permitir ao Setor de Estágio cadastrar usuários permitidos, exceto administradores.
- [ ] Aplicar as mesmas regras para edição e criação.

## Administrador do Sistema

- [ ] Definir e testar as operações globais permitidas antes de criar suas telas.
- [x] Implementar o backend de cadastro, edição, desativação e reativação de campi por `CampusController`, usando `Campus::create()`, `$campus->update()` e métodos de ciclo de vida do Model.
- [x] Exigir a senha atual em cada desativação; bloquear alterações no campus inativo e manter os vínculos existentes.
- [ ] Criar as telas Livewire de gestão de campus.
- [ ] Administrar Administradores do Sistema e do Campus conforme permissão.
- [ ] Reutilizar o subfluxo de conta/adicionar vínculo.
- [x] O comando `admin:create` avisa os e-mails da conta e do vínculo quando adiciona um vínculo existente, deduplicando endereços; na conta nova, cria primeiro vínculo e envia convite apenas ao e-mail compartilhado.
- [ ] Integrar o mesmo comportamento às futuras telas administrativas de criação de conta e vínculo.

## Administrador do Campus

- [x] Limitar e testar a gestão local ao campus do vínculo ativo selecionado.
- [x] Permitir ao Administrador do Campus editar telefone, representante legal e dados do seguro do próprio campus; não permitir alterar nome, CNPJ, endereço, e-mail ou ciclo de ativação.
- [ ] Criar a tela Livewire de edição permitida do campus.
- [x] Impedir acesso a campus alheio, criação de campus e alteração do ciclo de ativação pelo Administrador do Campus.
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
