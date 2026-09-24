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

Implemente cada perfil em duas partes: primeiro Policy/escopo, Action e testes; depois a interface que chama esse backend. A sequência começa no Administrador do Sistema, desce para Administrador do Campus e Setor de Estágio, e então continua nos papéis de curso e nos participantes do estágio conforme as Fases 06–09.

## Policies e escopo

- [ ] Criar um resolvedor comum de vínculo ativo e escopo, reutilizado pelas Policies e Actions.
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
- [ ] Avisar sobre novo vínculo em `users.email` e, se diferente, também em `affiliations.email` quando o canal de e-mail estiver permitido; dados de acesso inicial vão somente para o e-mail da conta.
- [ ] Aplicar a mesma regra quando um vínculo for adicionado a uma conta existente, sem duplicar o envio quando os endereços coincidirem.

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
