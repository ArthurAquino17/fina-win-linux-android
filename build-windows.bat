@echo off
setlocal

cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  set "PYTHON=py -3"
) else (
  set "PYTHON=python"
)

echo.
echo === Fina: preparando ambiente Windows ===
%PYTHON% --version
if errorlevel 1 (
  echo.
  echo Python nao encontrado.
  echo Instale o Python em https://www.python.org/downloads/
  echo Marque a opcao "Add python.exe to PATH" durante a instalacao.
  pause
  exit /b 1
)

if not exist ".venv" (
  echo.
  echo Criando ambiente virtual...
  %PYTHON% -m venv .venv
  if errorlevel 1 (
    echo Falha ao criar ambiente virtual.
    pause
    exit /b 1
  )
)

call ".venv\Scripts\activate.bat"

echo.
echo Instalando dependencias...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo Falha ao instalar dependencias.
  pause
  exit /b 1
)

echo.
echo Gerando Fina.exe...
python build.py
if errorlevel 1 (
  echo Build falhou.
  pause
  exit /b 1
)

echo.
echo Pronto! O executavel foi criado em:
echo %CD%\dist\Fina.exe
echo.
pause
