---
title: SGE — Helpers
description: Índice dos helpers de formatação, normalização e apresentação do SGE.
type: technical-hub
status: in-progress
tags:
  - sge/desenvolvimento
  - sge/helpers
  - sge/checklist
aliases:
  - Índice de helpers do SGE
---
Helpers devem concentrar transformações pequenas, determinísticas e reutilizáveis. Não devem consultar banco, disparar Jobs ou decidir autorização.

## Inventário

- [[SGE - Helper - CurrencyHelper|`CurrencyHelper`]] — moeda com locale configurado.
- [[SGE - Helper - NumberToWordsHelper|`NumberToWordsHelper`]] — números e valores em reais por extenso (implementado).
- [[SGE - Helper - DateHelper|`DateHelper`]] — datas, horários e datas relativas.
- [[SGE - Helper - DigitsHelper|`DigitsHelper`]] — normalização para dígitos.
- [[SGE - Helper - BrazilianDocumentHelper|`BrazilianDocumentHelper`]] — CPF e CNPJ.
- [[SGE - Helper - BrazilianContactHelper|`BrazilianContactHelper`]] — telefone brasileiro.
- [[SGE - Helper - BrazilianAddressHelper|`BrazilianAddressHelper`]] — CEP.
- [[SGE - Helper - Global helpers|`app/helpers.php`]] — fachada de funções globais.

## Checklist comum

- [ ] Definir entradas aceitas e retorno para `null`, vazio e inválido.
- [ ] Manter formatação de apresentação separada do valor persistido.
- [ ] Usar locale/timezone configurados, sem valores mágicos espalhados.
- [ ] Não duplicar função global e implementação de classe: a global deve delegar.
- [ ] Criar teste unitário para cada método público e casos-limite.
- [ ] Documentar exemplos que possam ser copiados para Blade/Livewire.
- [ ] Atualizar esta página quando um helper for criado, renomeado ou removido.

## Navegação

- [[SGE - Componentes técnicos]]
- [[SGE - Casts]]
- [[SGE - Desenvolvimento - Checklist de funcionalidade|Checklist de funcionalidade]]
