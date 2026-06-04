# Build do Fina

Este projeto já está preparado para empacotamento com PyInstaller.

## Dependências

- Python 3.10+.
- Bottle.
- `PyInstaller` instalado no ambiente Python.

## Instalação das dependências

```bash
python -m pip install -r requirements.txt
```

Se o `pip` não existir no sistema, instale primeiro o pacote do Python que fornece `pip`.
Em Linux, se o sistema bloquear instalação global, crie um ambiente virtual:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Gerar executável

```bash
python build.py
```

Isso gera o binário dentro de `dist/`.

O executável resultante abre um servidor Bottle local e lança o navegador automaticamente em `http://127.0.0.1:8080`.

## Windows sem programação

No Windows, use o arquivo:

```bat
build-windows.bat
```

Passos:

1. Instale o Python em https://www.python.org/downloads/.
2. Durante a instalação, marque `Add python.exe to PATH`.
3. Baixe ou clone este projeto.
4. Dê dois cliques em `build-windows.bat`.
5. Pegue o executável em `dist\Fina.exe`.

## Windows gratuito pelo GitHub

Se você não tiver um computador Windows, use o GitHub Actions:

1. Envie o projeto para o GitHub na branch `main`.
2. Abra o repositório no navegador.
3. Entre em `Actions`.
4. Clique em `Build Windows Executable`.
5. Clique em `Run workflow`.
6. Aguarde terminar.
7. Baixe o arquivo em `Artifacts`, chamado `fina-windows-exe`.

Esse método gera o `.exe` em uma máquina Windows real do GitHub, de graça para repositório público.

## Windows pelo Linux usando Wine

Também existe um script para gerar o `.exe` no Linux usando Wine:

```bash
./build-windows-linux.sh
```

O script:

1. Usa o Wine instalado no Linux.
2. Baixa o instalador do Python para Windows, se ainda não existir.
3. Instala o Python de Windows dentro do Wine.
4. Instala `Bottle` e `PyInstaller` nesse Python.
5. Gera `dist/Fina.exe`.

Se o Wine ainda não estiver instalado:

```bash
sudo apt update
sudo apt install wine winetricks
```

## Ícone do Windows

Se você colocar um arquivo `assets/app.ico` ou `app.ico` na raiz do projeto, o build vai usar esse ícone automaticamente.

## Observação importante

- O executável Windows (`.exe`) deve ser gerado em uma máquina Windows.
- Em Linux, o mesmo comando gera um executável Linux.
- O app salva os dados no navegador/localStorage do usuário.
