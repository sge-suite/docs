---
id: component-file-upload
title: Componente de upload de arquivos
description: Campo reutilizável de arquivo com suporte ao envio temporário do Livewire e interação por clique ou arrastar e soltar.
type: technical-reference
status: implemented
visibility: public
tags: sge/interface, sge/livewire, sge/componentes
related: componentes-tecnicos, fase-05-administracao, migration-12-granting-parties
source_refs: https://github.com/sge-suite/sge/blob/master/resources/views/components/file-upload.blade.php, https://github.com/sge-suite/sge/blob/master/resources/js/file-upload.js, https://github.com/sge-suite/sge/blob/master/resources/views/components/import-upload-form.blade.php
---
O componente `<x-file-upload>` apresenta campos de arquivo em telas Livewire e mantém o envio temporário sob controle do Livewire. Seleção pelo seletor nativo e arrastar e soltar usam o mesmo `wire:model`; as regras de formato, tamanho, armazenamento e validação continuam definidas pela tela que o utiliza.

## Propriedades

| Propriedade | Uso |
| --- | --- |
| `label` | Rótulo acessível do campo. |
| `description` | Orientação exibida abaixo do convite de seleção. |
| `accept` | Tipos de arquivo aceitos pelo seletor do navegador. A validação definitiva permanece no servidor. |
| `files` | Upload temporário ou lista de uploads já selecionados para exibir nome, tamanho e ação de remoção. |
| `multiple` | Permite selecionar ou soltar mais de um arquivo. |
| `inline` | Usa a apresentação compacta horizontal. |
| `preview` | Exibe prévia quando o upload selecionado é uma imagem que o Livewire pode pré-visualizar. |
| `disabled`, `required` | Controlam os estados HTML correspondentes; `required` deixa de ser aplicado quando já há arquivo selecionado. |

O componente exibe progresso e permite cancelar o envio em andamento. Depois de enviado, mostra o nome e tamanho do arquivo e permite remover o temporário. Erros de validação do Livewire são apresentados junto ao campo. O tamanho é mostrado em B, KB ou MB em base decimal. Nenhum arquivo é persistido pelo componente por conta própria.

## Uso atual

As telas de importação de usuários/vínculos e partes concedentes usam o layout compacto. Cada uma mantém seus próprios limites, tipos aceitos e validações no servidor; sair da tela continua descartando o estado temporário da prévia.

Consulte a [fase de administração](doc:fase-05-administracao) e a [referência da importação de concedentes](doc:migration-12-granting-parties) para os contratos dessas importações.
