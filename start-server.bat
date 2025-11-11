@echo off
REM Script para iniciar o servidor de upload FTP (Windows)
REM Execute: start-server.bat

echo 🚀 Iniciando servidor de upload FTP...
echo.

REM Verificar se estamos na pasta correta
if not exist "server" (
    echo ❌ Erro: Pasta 'server' não encontrada!
    echo Execute este script na raiz do projeto.
    pause
    exit /b 1
)

REM Entrar na pasta do servidor
cd server

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas!
    echo.
)

REM Criar pasta uploads se não existir
if not exist "uploads" mkdir uploads

echo ✅ Servidor iniciando na porta 3001...
echo 📡 Endpoint: http://localhost:3001/api/upload-ftp
echo 🏥 Health check: http://localhost:3001/api/health
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Iniciar o servidor
call npm run dev

pause

