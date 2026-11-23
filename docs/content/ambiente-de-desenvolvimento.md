---
id: ambiente-de-desenvolvimento
title: Ambiente de desenvolvimento
description: Requisitos e comandos para preparar e executar o ambiente local de desenvolvimento do SGE.
type: development-guide
status: maintained
visibility: public
tags: sge/desenvolvimento, sge/operacao
related: visao-geral, pessoas-e-responsabilidades, guia-para-desenvolvedores
source_refs:
---
## Para quem esta página serve

Esta página é destinada a quem prepara o ambiente de desenvolvimento do SGE. Para entender a arquitetura, o papel de cada pasta, a origem dos dados e como usar agentes de IA na manutenção, consulte também o [Guia para desenvolvedores](doc:guia-para-desenvolvedores). Pessoas que apenas usam o sistema não precisam executar estes comandos: para entender o processo, devem começar em [Visão geral](doc:visao-geral) ou [Pessoas e responsabilidades](doc:pessoas-e-responsabilidades).

Os comandos abaixo criam uma cópia local do sistema para desenvolvimento; eles não devem ser executados em um computador institucional de produção sem orientação da equipe técnica. Não há suíte automatizada nesta etapa; veja [Testes automatizados](doc:testes-existentes).

## Por que usar Docker e Laravel Sail é indispensável

O SGE não depende apenas de PHP e banco de dados: o funcionamento completo exige **5 serviços integrados** definidos no arquivo `compose.yaml`:

1. **Aplicação (`laravel.test`):** runtime **PHP 8.5**, Node.js/NPM e extensões necessárias.
2. **PostgreSQL 18 (`pgsql`):** banco de dados principal.
3. **Meilisearch (`meilisearch`):** motor de busca obrigatório para listagens e para os seletores `<x-select>` do sistema (não há fallback SQL `LIKE`).
4. **Gotenberg + LibreOffice (`gotenberg`):** serviço interno (`http://gotenberg:3000`) que converte os documentos `.docx` gerados pelo PHPWord em `.pdf`.
5. **Mailpit (`mailpit`):** servidor SMTP local com painel web para inspecionar todos os e-mails disparados pelo sistema sem enviá-los para fora.

Tentar rodar o projeto diretamente no sistema operacional sem o **Laravel Sail** exige instalar, configurar portas, permissões e versões exatas de todos esses serviços manualmente. Com o **Docker** e o **Sail**, um único comando (`./vendor/bin/sail up -d`) sobe toda a infraestrutura pronta.

---

## Sistema operacional recomendado e preparo por plataforma

> [!tip] Recomendação: utilize Linux
> **Recomendamos fortemente utilizar uma distribuição Linux** (Ubuntu, Debian, Fedora, Arch, etc.) para desenvolver e dar manutenção no SGE. No Linux o Docker roda nativamente, o acesso a arquivos é imediato e as permissões Unix (`0700`/`0600`) exigidas pela geração privada de documentos funcionam sem camadas intermediárias.

Caso o computador de trabalho utilize **Windows**, o projeto também funciona perfeitamente, desde que executado **dentro do WSL 2 (Subsistema Windows para Linux)** com Docker Desktop, seguindo as instruções abaixo.

### Opção A — Linux (Recomendado)

1. Instale o **Git**, o **Docker Engine** e o plugin **Docker Compose v2** pelos pacotes oficiais da sua distribuição ([guia oficial do Docker Engine](https://docs.docker.com/engine/install/)).
2. Adicione seu usuário ao grupo `docker` para executar containers sem `sudo` e reinicie a sessão:
   ```bash
   sudo usermod -aG docker $USER
   ```
3. Confirme que o Docker está ativo:
   ```bash
   docker info
   docker compose version
   ```

### Opção B — Windows 10 ou Windows 11 (via WSL 2 + Docker Desktop)

No Windows, o Laravel Sail **não roda diretamente no CMD ou PowerShell tradicional**; ele precisa de um ambiente Linux via **WSL 2**:

1. **Instale o WSL 2 com Ubuntu:** abra o PowerShell como **Administrador** e execute:
   ```powershell
   wsl --install -d Ubuntu
   ```
   Reinicie o computador se solicitado e, ao abrir o aplicativo **Ubuntu**, defina seu usuário e senha Linux.
2. **Instale o Docker Desktop para Windows:** baixe em [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).
   - Em *Settings → General*, marque **Use the WSL 2 based engine**.
   - Em *Settings → Resources → WSL Integration*, ative a chave da sua distribuição **Ubuntu** e clique em *Apply & Restart*.
3. **Regra fundamental no Windows — clone o projeto dentro do Linux (WSL 2):**
   - Abra o terminal do **Ubuntu (WSL)** e guarde o projeto dentro da sua pasta do Linux (por exemplo, `~/code/sge-suite`):
     ```bash
     mkdir -p ~/code
     cd ~/code
     ```
   - **Nunca clone o projeto em `/mnt/c/...` (pastas do `C:\` do Windows).** Rodar containers Docker lendo arquivos do `/mnt/c/` deixa o sistema muito lento, pode converter quebras de linha para `CRLF` (impedindo a execução do `./vendor/bin/sail`) e quebra as permissões privadas `0700` do diretório temporário de geração de PDFs.
   - Para editar no **VS Code**, instale a extensão oficial **WSL** no VS Code do Windows e, dentro da pasta do projeto no terminal do Ubuntu, digite `code .`.

### Opção C — macOS

1. Instale o [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop/) (ou [OrbStack](https://orbstack.dev/)) e o **Git**.
2. Execute todos os comandos abaixo normalmente pelo terminal do macOS.

---

## Primeira configuração (passo a passo)

Abra o terminal (no Linux, macOS ou no Ubuntu do WSL 2 no Windows) dentro da pasta `sge/`:

```bash
cd /caminho/para/o/projeto/sge
cp .env.example .env
```

### 1. Instalar as dependências do PHP (`vendor/`)

Se você **já tiver PHP 8.3+ e Composer** instalados na máquina local:

```bash
composer install
```

Se você **não tiver PHP ou Composer instalados na máquina** (apenas o Docker), rode este comando oficial do Laravel para baixar a pasta `vendor/` usando um container descartável:

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php85-composer:latest \
    composer install --ignore-platform-reqs
```

### 2. Subir os containers e preparar o banco, índices e assets

Com a pasta `vendor/` criada, o comando `./vendor/bin/sail` já estará disponível:

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan scout:sync-index-settings --no-interaction
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
```

> [!info] Regra de ouro com o Sail
> Nunca execute `php artisan ...`, `composer ...` ou `npm ...` diretamente fora do Sail, pois no sistema hospedeiro o PHP pode ser de outra versão e não enxergará os hosts internos do Docker (`pgsql`, `meilisearch`, `gotenberg`, `mailpit`). Use sempre o prefixo `./vendor/bin/sail` (ex.: `./vendor/bin/sail artisan migrate`).

Para facilitar a digitação, você pode criar um alias no seu `~/.bashrc` ou `~/.zshrc`:

```bash
alias sail='./vendor/bin/sail'
```

Depois disso, `sail artisan ...` equivale a `./vendor/bin/sail artisan ...`.

## Comandos úteis

```bash
./vendor/bin/sail up -d
./vendor/bin/sail down
./vendor/bin/sail logs -f laravel.test
./vendor/bin/sail shell
./vendor/bin/sail artisan migrate
./vendor/bin/sail composer run lint:check
./vendor/bin/sail composer run types:check
./vendor/bin/sail npm run dev
```

Para o desenvolvimento contínuo, o projeto também possui o script Composer `dev`:

```bash
./vendor/bin/sail composer run dev
```

## Serviços locais

| Serviço     | Endereço padrão         | Uso                                           |
| ----------- | ----------------------- | --------------------------------------------- |
| Aplicação   | `http://localhost`      | Interface web.                                |
| Vite        | `http://localhost:5173` | Assets e hot reload.                          |
| Mailpit     | `http://localhost:8025` | Visualização dos e-mails enviados localmente. |
| Meilisearch | `http://localhost:7700` | Busca local.                                  |
| PostgreSQL  | `localhost:5432`        | Banco local, conforme as variáveis do `.env`. |

As portas podem ser alteradas no `.env` por `APP_PORT`, `VITE_PORT`, `FORWARD_DB_PORT`, `FORWARD_MAILPIT_DASHBOARD_PORT` e `FORWARD_MEILISEARCH_PORT`.

## Geração DOCX e PDF

Após atualizar o sistema, execute `./vendor/bin/sail composer install` e `./vendor/bin/sail up -d` para instalar PHPWord e iniciar/conectar o conversor. O primeiro início baixa a imagem `gotenberg/gotenberg:8.38.1-libreoffice`. O serviço é acessível pela aplicação em `http://gotenberg:3000`, sem porta pública, em rede interna.

`DOCUMENT_PDF_CONVERTER_URL` é opcional e usa esse endereço por padrão. Em outro ambiente, configure um conversor privado equivalente. Após mudar configuração em ambiente com cache, atualize o cache de configuração.

O usuário da aplicação precisa gravar em `storage/app/private/generated-documents-tmp`, diretório privado com permissão 0700; os arquivos recebem 0600. O servidor transmite e remove DOCX/PDF; o scheduler limpa órfãos com mais de uma hora. Execute o scheduler pelo Sail no desenvolvimento e configure sua execução em produção, conforme [Schedules](doc:schedules).

Fontes e versão do LibreOffice influenciam o PDF. Os limites de fidelidade visual e a conferência dos modelos estão no [contrato documental](doc:geracao-de-documentos-docx-e-variaveis#arquivos-temporarios-e-pdf).

## Cuidados

> [!danger] Segredos e dados reais
> Nunca versionar `.env`, credenciais de provedores externos ou dados reais. Alterações de banco, fluxo ou regra devem atualizar também a documentação relacionada.

- Nunca registrar `.env` ou credenciais de provedores externos no Git.
- Não usar dados reais em ambientes locais.
- Não executar `php artisan` ou `npm` no host quando a intenção for usar o ambiente do projeto; prefira o prefixo `./vendor/bin/sail`.
- Para apagar volumes e dados locais, confirmar o alvo antes de usar comandos destrutivos do Docker.
- Toda migration deve ser revisável e reversível quando possível.
- Atualizar a documentação junto com alterações de fluxo ou banco.
