@echo off
echo Instalando Sistema de Gestion Medica...
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js no esta instalado.
    echo Por favor, instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si MariaDB está instalado
sc query MariaDB >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: MariaDB no esta instalado.
    echo Por favor, instale MariaDB desde https://mariadb.org/download/
    pause
    exit /b 1
)

REM Verificar si el servicio de MariaDB está corriendo
sc query MariaDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo Error: El servicio de MariaDB no esta corriendo.
    echo Por favor, inicie el servicio desde el Administrador de Servicios de Windows.
    pause
    exit /b 1
)

echo Instalando dependencias...
call npm install

echo.
echo Configurando la base de datos...
echo Por favor, asegurese de que:
echo 1. MariaDB esta corriendo
echo 2. Ha importado el archivo BDmedico.sql usando HeidiSQL
echo 3. Las credenciales en config.js son correctas
echo.

echo Iniciando el servidor...
echo.
echo Si todo esta configurado correctamente, abra su navegador en:
echo http://localhost:3000
echo.
echo Presione Ctrl+C para detener el servidor
echo.

call npm start 