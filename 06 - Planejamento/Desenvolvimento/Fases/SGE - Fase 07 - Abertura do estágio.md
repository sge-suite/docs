---
title: SGE — Fase 07 — Abertura do estágio
description: Checklist de criação da solicitação, envio, análise e formalização inicial do estágio.
type: development-phase
status: planned
order: 7
tags:
  - sge/desenvolvimento
  - sge/estagio
  - sge/checklist
---
Base: [[SGE - Fluxos principais#2 Solicitação|fluxo de abertura]].

## Formulário e solicitação do discente

- [ ] Criar `internship_requests` com status inicial `draft`.
- [ ] Salvar o `draft` incrementalmente com Livewire, aceitando campos nulos fora dos identificadores técnicos.
- [ ] Exigir, ao enviar ou em qualquer estado não terminal, todos os campos obrigatórios conforme o caminho condicional escolhido.
- [ ] Exibir ao discente a lista das próprias solicitações com status e última atualização, sem expor Activity Log.
- [ ] Exigir perfil pessoal completo quando a regra determinar.
- [ ] Filtrar curso, tipo e opções pelo vínculo/campus atual.
- [ ] Relacionar curso e tipo por FKs.
- [ ] Copiar regras do tipo para snapshot JSONB.
- [ ] Relacionar concedente por FK e snapshot.
- [ ] Relacionar supervisor por pessoa/vínculo e snapshot.
- [ ] Registrar atividades, datas, jornada, remuneração, protocolo e observações.
- [ ] Validar a data proposta contra o prazo mínimo após o envio e calcular a data prevista de término.
- [ ] Criar rádio de capacidade civil: maior de idade, menor de idade ou menor emancipado.
- [ ] Exigir responsável legal somente quando o discente selecionar menor de idade.
- [ ] Exigir upload privado do comprovante pelo próprio SGE quando selecionar menor emancipado, criando `emancipation_evidences` e mídia privada sem apagar envios anteriores.
- [ ] Implementar decisão manual do Setor: validar ou recusar com motivo; o envio nunca aprova automaticamente.
- [ ] Validar no servidor que a opção maior de idade corresponde à data de nascimento e que menor emancipado contém comprovante.
- [ ] Validar carga horária, período, feriados, pausas e regras do tipo.

## Formalização inicial

- [ ] Criar `internships` com status inicial `pending_formalization` somente após aceitar a solicitação.
- [ ] Copiar para o estágio os dados aprovados e os snapshots históricos.
- [ ] Associar `internship_id` à mesma solicitação que originou o estágio.

## Cadastros relacionados

- [ ] Exigir que a concedente já esteja cadastrada antes do envio do formulário.
- [ ] Criar solicitação de supervisor ainda não cadastrado.
- [ ] Permitir aprovar, recusar ou complementar pelo Setor de Estágio.
- [ ] Reutilizar subfluxo de conta/vínculo quando necessário.
- [ ] Associar resultado aprovado sem perder dados informados originalmente.

## Envio e análise

- [ ] Exibir erros sem perder dados do rascunho.
- [ ] Enviar para análise e bloquear edição indevida.
- [ ] Solicitar pendência com motivo.
- [ ] Permitir correção e reenvio pelo discente.
- [ ] Permitir devolver a mesma solicitação depois da criação e antes da liberação do estágio.
- [ ] Aplicar ao estágio somente dados corrigidos que recebam nova aprovação, com recálculo e reemissão documental quando necessário.
- [ ] Permitir recusa/cancelamento com motivo e histórico.
- [ ] Aceitar e encaminhar para documento principal.
- [ ] Aplicar a matriz de canais: aviso individual ao discente, seleção explícita de interessados na disponibilização para assinatura e resumo interno agrupado para o Setor de Estágio.

## Próxima fase

[[SGE - Fase 08 - Estágio em andamento|Fase 08 — Estágio em andamento]]
