#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PYTHON_VERSION="3.13.5"
INSTALLER="tools/python-windows-amd64.exe"
WIN_PY="$HOME/.wine/drive_c/users/$USER/AppData/Local/Programs/Python/Python313/python.exe"

if ! command -v wine >/dev/null 2>&1; then
  echo "Wine nao encontrado. Instale com: sudo apt install wine winetricks"
  exit 1
fi

mkdir -p tools

if [ ! -f "$INSTALLER" ]; then
  echo "Baixando Python Windows $PYTHON_VERSION..."
  curl -L --fail -o "$INSTALLER" "https://www.python.org/ftp/python/$PYTHON_VERSION/python-$PYTHON_VERSION-amd64.exe"
fi

if [ ! -f "$WIN_PY" ]; then
  echo "Instalando Python Windows dentro do Wine..."
  wine "$INSTALLER" /quiet InstallAllUsers=0 PrependPath=1 Include_pip=1 Include_test=0
fi

if [ ! -f "$WIN_PY" ]; then
  echo "Python Windows nao foi encontrado em: $WIN_PY"
  echo "Procure manualmente com: find ~/.wine/drive_c -iname python.exe"
  exit 1
fi

echo "Instalando dependencias no Python Windows..."
wine "$WIN_PY" -m pip install --upgrade pip
wine "$WIN_PY" -m pip install -r requirements.txt

echo "Gerando Fina.exe..."
wine "$WIN_PY" build.py

echo
echo "Pronto: dist/Fina.exe"
