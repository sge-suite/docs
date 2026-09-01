---
title: SGE — Fase 05 — Administração
description: Checklist de policies, escopos, perfis e catálogos administrativos do SGE.
type: development-phase
status: planned
order: 5
tags:
  - sge/desenvolvimento
  - sge/autorizacao
  - sge/checklist
---
Base: [[SGE - Pessoas e responsabilidades|papéis por vínculo]], [[SGE - Matriz de autorização]] e [[SGE - Perfis e responsabilidades por vínculo]].

## Policies e escopo

- [ ] Criar Policies para pessoa, vínculo, campus, curso, tipo, concedente, estágio e documento.
- [ ] Validar usuário, vínculo ativo, `AffiliationType`, campus/curso, posse e estado do registro em toda ação.
- [ ] Registrar `Gate::before` exclusivamente para acesso global do Administrador do Sistema e testar que o vínculo ativo continua obrigatório.
- [ ] Criar testes positivos e negativos por função.
- [ ] Cobrir para cada `AffiliationType` as ações, limites, destinatários de notificação e consultas descritos em [[SGE - Perfis e responsabilidades por vínculo]].
- [ ] Impedir que Administrador do Campus cadastre Administrador do Sistema.
- [ ] Permitir ao Setor de Estágio cadastrar usuários permitidos, exceto administradores.
- [ ] Aplicar as mesmas regras para edição e criação.

## Administrador do Sistema

- [ ] Cadastrar, editar, ativar e desativar campi.
- [ ] Administrar Administradores do Sistema e do Campus conforme permissão.
- [ ] Reutilizar o subfluxo de conta/adicionar vínculo.
- [ ] Disparar aviso de novo vínculo em conta nova, quando o canal de e-mail estiver permitido.
- [ ] Avisar quando apenas um vínculo for adicionado a conta existente.

## Administrador do Campus

- [ ] Editar nome, CNPJ, endereço, telefone, e-mail e representante do próprio campus.
- [ ] Impedir campus alheio, novos campi e alteração do ciclo de ativação.
- [ ] Administrar usuários e vínculos dentro do escopo.
- [ ] Criar/editar cursos, dois coordenadores e tipos de estágio.
- [ ] Impedir acesso a outro campus.

## Setor de Estágio

- [ ] Administrar templates DOCX e versões.
- [ ] Administrar concedentes e solicitações pendentes.
- [ ] Analisar estágios enviados.
- [ ] Analisar solicitações de supervisor/concedente.
- [ ] Validar documentos, avaliações, pendências e liberação.

## Próxima fase

[[SGE - Fase 06 - Documentos|Fase 06 — Templates e documentos]]
