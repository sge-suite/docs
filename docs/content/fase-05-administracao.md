---
id: fase-05-administracao
title: Fase 05 — Administração
description: Checklist de policies, escopos, perfis e catálogos administrativos do SGE.
type: development-phase
status: planned
visibility: public
tags: sge/desenvolvimento, sge/autorizacao, sge/checklist
related: pessoas-e-responsabilidades, matriz-de-autorizacao, perfis-e-responsabilidades-por-vinculo, fase-06-documentos
source_refs:
---
Base: [papéis por vínculo](doc:pessoas-e-responsabilidades), [Matriz de autorização](doc:matriz-de-autorizacao) e [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).

## Policies e escopo

- [ ] Criar Policies para pessoa, vínculo, campus, curso, tipo, concedente, estágio e documento.
- [ ] Validar usuário, vínculo ativo, `AffiliationType`, campus/curso, posse e estado do registro em toda ação.
- [ ] Registrar `Gate::before` exclusivamente para acesso global do Administrador do Sistema e testar que o vínculo ativo continua obrigatório.
- [ ] Criar testes positivos e negativos por função.
- [ ] Cobrir para cada `AffiliationType` as ações, limites, destinatários de notificação e consultas descritos em [Perfis e responsabilidades por vínculo](doc:perfis-e-responsabilidades-por-vinculo).
- [ ] Impedir que Administrador do Campus cadastre Administrador do Sistema.
- [ ] Permitir ao Setor de Estágio cadastrar usuários permitidos, exceto administradores.
- [ ] Aplicar as mesmas regras para edição e criação.

## Administrador do Sistema

- [ ] Cadastrar, editar, ativar e desativar campi.
- [ ] Administrar Administradores do Sistema e do Campus conforme permissão.
- [ ] Reutilizar o subfluxo de conta/adicionar vínculo.
- [ ] Avisar sobre novo vínculo em `users.email` e, se diferente, também em `affiliations.email` quando o canal de e-mail estiver permitido; dados de acesso inicial vão somente para o e-mail da conta.
- [ ] Aplicar a mesma regra quando um vínculo for adicionado a uma conta existente, sem duplicar o envio quando os endereços coincidirem.

## Administrador do Campus

- [ ] Editar nome, CNPJ, endereço, telefone, e-mail e representante do próprio campus.
- [ ] Impedir campus alheio, novos campi e alteração do ciclo de ativação.
- [ ] Administrar usuários e vínculos dentro do escopo.
- [ ] Criar/editar cursos, dois coordenadores e tipos de estágio.
- [ ] Impedir acesso a outro campus.

## Setor de Estágio

- [ ] Administrar templates DOCX e versões.
- [ ] Administrar concedentes e solicitações pendentes.
- [ ] Administrar a importação do calendário nacional/estadual e o cadastro manual de feriados municipais.
- [ ] Analisar estágios enviados.
- [ ] Analisar solicitações de supervisor/concedente.
- [ ] Validar documentos, avaliações, pendências e liberação.
- [ ] Consultar o calendário aplicável e registrar exceções por estágio, sem alterar o calendário global.

## Próxima fase

[Fase 06 — Templates e documentos](doc:fase-06-documentos)
