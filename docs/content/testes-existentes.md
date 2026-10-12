---
id: testes-existentes
title: Testes automatizados
description: Estado atual da suíte e decisão sobre validação automatizada antes da produção.
type: technical-reference
status: maintained
visibility: public
tags: sge/desenvolvimento, sge/testes, sge/checklist
related: desenvolvimento-checklist-de-funcionalidade, fases-de-desenvolvimento
---

## Estado atual

O repositório SGE não contém arquivos de testes automatizados. A árvore `tests/` foi removida porque executar e manter a suíte estava atrasando o desenvolvimento das funcionalidades. A retomada dos testes fica para a preparação da versão de produção, quando o escopo funcional estiver mais estável.

Durante a implementação, a equipe não precisa executar `sail test`. A configuração e as dependências de desenvolvimento do runner podem ser reutilizadas quando a suíte for criada novamente; elas não representam cobertura ativa. Referências de teste em checklists antigos passam a ser critérios para a preparação da produção, não bloqueios para concluir cada funcionalidade.

## Preparação para produção

Antes da publicação, definir e implementar uma suíte pequena, rápida e direcionada às regras de negócio críticas. Dar prioridade aos cálculos de término de estágio quando suas regras forem definidas, às transições de estado, às gravações transacionais e às permissões por vínculo e campus. Não recriar testes de HTML, navegação ou integração real com Meilisearch.

As validações de produção devem ocorrer em banco de testes isolado, com execução reproduzível e sem concorrer com operações que recriam o schema. O resultado dessa etapa deve atualizar esta página e a documentação funcional correspondente.
