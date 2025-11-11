#!/bin/bash

# Script para iniciar o servidor de upload FTP
# Execute: bash start-server.sh ou chmod +x start-server.sh && ./start-server.sh

echo "🚀 Iniciando servidor de upload FTP..."
echo ""

# Verificar se estamos na pasta correta
if [ ! -d "server" ]; then
    echo "❌ Erro: Pasta 'server' não encontrada!"
    echo "Execute este script na raiz do projeto."
    exit 1
fi

# Entrar na pasta do servidor
cd server

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências!"
        exit 1
    fi
    echo "✅ Dependências instaladas!"
    echo ""
fi

# Criar pasta uploads se não existir
mkdir -p uploads

echo "✅ Servidor iniciando na porta 3001..."
echo "📡 Endpoint: http://localhost:3001/api/upload-ftp"
echo "🏥 Health check: http://localhost:3001/api/health"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Iniciar o servidor
npm run dev

