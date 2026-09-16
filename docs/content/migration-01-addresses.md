---
id: migration-01-addresses
title: Migration 01 — addresses
description: Contrato da tabela reutilizável de endereços e das cópias históricas usadas por processos formalizados.
type: migration-reference
status: planned
visibility: public
tags: sge/migrations, sge/banco-de-dados, sge/endereco
related: migration-01a-cities, helper-brazilianaddresshelper, dominio-e-modelo-de-dados, migration-02-user-personal-data, migration-03-campuses, migration-12-granting-parties, migration-15-internships
source_refs:
---
> [!todo] Estado
> Planejada. Depende do catálogo de [`cities`](doc:migration-01a-cities), que já está implementado e deve permanecer criado antes desta tabela.

## Contrato

| Coluna | Tipo PostgreSQL | Nulo | Chaves/índices | Regra |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | não | `PK` | Identificador interno. |
| `city_id` | `bigint` | não | `FK` | Referencia `cities.id`; exclusão `RESTRICT`. A UF é obtida da cidade. |
| `street` | `varchar(255)` | não | — | Rua ou logradouro. |
| `number` | `varchar(32)` | não | — | Número; aceita `s/n`. |
| `neighborhood` | `varchar(120)` | não | — | Bairro. |
| `zip_code` | `char(8)` | sim | índice opcional | CEP sem máscara; pode ser geral da cidade ou ficar vazio. |
| `created_at` | `timestamp(0)` | não | — | Criação no timezone institucional. |
| `updated_at` | `timestamp(0)` | não | — | Última atualização técnica. |

Não criar `complement` agora. A tabela é reutilizável por pessoas, campi, concedentes e estágios. A cidade é normalizada por `city_id`; a UF não é repetida no endereço.

## Preenchimento por CEP

O formulário pode consultar a BrasilAPI ao completar oito dígitos do CEP, preferencialmente por uma Action/serviço do backend. A resposta serve para sugerir `street`, `neighborhood`, `zip_code`, UF e cidade; o usuário sempre pode corrigir os campos. CEP geral de município, CEP inexistente ou indisponibilidade da API não impedem o preenchimento manual.

A resposta externa não é gravada diretamente como cidade. O sistema usa a UF e a cidade retornadas para localizar o município no catálogo local e persistir `addresses.city_id`, garantindo que o endereço termine com o código IBGE oficial. Se a integração fornecer o código IBGE, ele é validado contra `cities`; se fornecer apenas nome e UF, a resolução é feita pelo par normalizado `state` + `name`. Em caso de ambiguidade ou ausência no catálogo, a interface exige a seleção manual da cidade.

Essa consulta de CEP é uma ajuda de UX e não transforma a BrasilAPI em fonte de verdade do cadastro. A tabela `cities` e o `CitySeeder` continuam locais; a API não é chamada para cada select de cidade nem para o cálculo de feriados.

O endereço atual de um cadastro pode mudar, mas uma linha que já estiver apontada por um estágio formalizado não pode ser editada. A alteração cria uma nova linha em `addresses` e troca a FK do cadastro atual. Ao formalizar um estágio, o sistema copia os dados do endereço atual da concedente para uma nova linha nesta mesma tabela e grava essa linha em `internships.workplace_address_id`. Não existe tabela separada de snapshots nem coluna `copied_from_address_id`.

O endereço do aluno segue a mesma regra quando for necessário congelá-lo: `user_personal_data.address_id` aponta para o cadastro atual e `internships.student_address_id` pode apontar para a cópia usada na formalização. Endereços históricos não são apagados nem alterados retroativamente.

## Checklist

- [x] Definir cidade por FK para catálogo IBGE e CEP opcional.
- [x] Definir cópia histórica na própria tabela, sem tabela de snapshots.
- [ ] Confirmar campos e obrigatoriedade com a regra de endereço.
- [ ] Criar migration `create_addresses_table`.
- [ ] Definir índices úteis para busca sem indexar formatação.
- [ ] Criar Model `Address`, factory e cast de exclusão lógica se aplicável.
- [ ] Validar CEP, UF, número e valores `s/n`.
- [ ] Registrar alteração no Activity Log quando o endereço atual for editado.
- [ ] Testar migrate, rollback e banco limpo.
- [ ] Atualizar [Domínio e modelo de dados](doc:dominio-e-modelo-de-dados).

## Próximas dependências

- [user_personal_data](doc:migration-02-user-personal-data)
- [campuses](doc:migration-03-campuses)
- [granting_parties](doc:migration-12-granting-parties)
