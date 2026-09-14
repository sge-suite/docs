---
id: helpers
title: Helpers
description: Índice dos helpers de formatação, normalização e apresentação do SGE.
type: technical-hub
status: in-progress
visibility: public
tags: sge/desenvolvimento, sge/helpers, sge/checklist
related: helper-currencyhelper, helper-numbertowordshelper, helper-datehelper, helper-digitshelper, helper-braziliandocumenthelper, helper-braziliancontacthelper, helper-brazilianaddresshelper, helper-funcoes-globais, componentes-tecnicos, casts, desenvolvimento-checklist-de-funcionalidade
source_refs:
---
Helpers devem concentrar transformações pequenas, determinísticas e reutilizáveis. Não devem consultar banco, disparar Jobs ou decidir autorização.

## Inventário

- [`CurrencyHelper`](doc:helper-currencyhelper) — moeda com locale configurado.
- [`NumberToWordsHelper`](doc:helper-numbertowordshelper) — números e valores em reais por extenso (implementado).
- [`DateHelper`](doc:helper-datehelper) — datas, horários e datas relativas.
- [`DigitsHelper`](doc:helper-digitshelper) — normalização para dígitos.
- [`BrazilianDocumentHelper`](doc:helper-braziliandocumenthelper) — CPF e CNPJ.
- [`BrazilianContactHelper`](doc:helper-braziliancontacthelper) — telefone brasileiro.
- [`BrazilianAddressHelper`](doc:helper-brazilianaddresshelper) — CEP.
- [`app/helpers.php`](doc:helper-funcoes-globais) — fachada de funções globais.

## Checklist comum

- [ ] Definir entradas aceitas e retorno para `null`, vazio e inválido.
- [ ] Manter formatação de apresentação separada do valor persistido.
- [ ] Usar locale/timezone configurados, sem valores mágicos espalhados.
- [ ] Não duplicar função global e implementação de classe: a global deve delegar.
- [ ] Criar teste unitário para cada método público e casos-limite.
- [ ] Documentar exemplos que possam ser copiados para Blade/Livewire.
- [ ] Atualizar esta página quando um helper for criado, renomeado ou removido.

## Navegação

- [Componentes técnicos](doc:componentes-tecnicos)
- [Casts](doc:casts)
- [Checklist de funcionalidade](doc:desenvolvimento-checklist-de-funcionalidade)
