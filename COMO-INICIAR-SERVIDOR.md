# 🚀 Como Iniciar o Servidor de Upload FTP

## ⚠️ Erro Atual
```
Não foi possível conectar ao servidor de upload. 
Certifique-se de que o servidor está rodando em http://localhost:3001.
```

## ✅ Solução Rápida

### Opção 1: Usando Scripts NPM (Recomendado)

**Passo 1:** Instalar dependências (apenas na primeira vez):
```bash
npm run server:setup
```

**Passo 2:** Iniciar o servidor:
```bash
npm run server:dev
```

### Opção 2: Manual

**Passo 1:** Entrar na pasta do servidor:
```bash
cd server
```

**Passo 2:** Instalar dependências (apenas na primeira vez):
```bash
npm install
```

**Passo 3:** Iniciar o servidor:
```bash
npm run dev
```

### Opção 3: Scripts Automáticos

**Linux/Mac:**
```bash
chmod +x start-server.sh
./start-server.sh
```

**Windows:**
```cmd
start-server.bat
```

## 📋 Verificação

Após iniciar o servidor, você deve ver:

```
🚀 Servidor de upload FTP rodando na porta 3001
📁 Pasta FTP: blog_inova
🌐 URL base: https://brincar.ia.br/blog_inova
```

### Testar se está funcionando:

1. **Health Check:**
   Abra no navegador: http://localhost:3001/api/health
   
   Deve retornar:
   ```json
   {"status":"ok","service":"ftp-upload-api"}
   ```

2. **No Console do Servidor:**
   Você verá mensagens quando receber requisições

## 🔧 Executar Frontend e Backend Juntos

Você precisa de **DOIS TERMINAIS** abertos:

### Terminal 1 - Frontend (React):
```bash
npm run dev
```
Frontend rodando em: http://localhost:5173

### Terminal 2 - Backend (Servidor FTP):
```bash
npm run server:dev
```
Backend rodando em: http://localhost:3001

## ❌ Problemas Comuns

### 1. Erro: "Cannot find module 'express'"
**Causa:** Dependências não instaladas
**Solução:**
```bash
cd server
npm install
```

### 2. Erro: "Port 3001 already in use"
**Causa:** Outro processo usando a porta 3001
**Solução:**
- Feche outros processos na porta 3001
- Ou mude a porta no arquivo `server/ftp-upload-api.js`:
  ```javascript
  const PORT = process.env.PORT || 3002  // Mude para 3002
  ```

### 3. Erro: "EADDRINUSE"
**Causa:** Servidor já está rodando
**Solução:** 
- Pare o servidor anterior (Ctrl+C)
- Ou use outra porta

### 4. Erro: "ENOENT: no such file or directory"
**Causa:** Pasta uploads não existe
**Solução:** O servidor criará automaticamente, mas você pode criar manualmente:
```bash
cd server
mkdir uploads
```

## 🎯 Checklist

Antes de testar o upload, verifique:

- [ ] Dependências instaladas (`cd server && npm install`)
- [ ] Servidor rodando (`npm run server:dev`)
- [ ] Health check funcionando (http://localhost:3001/api/health)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Nenhum erro no console do servidor

## 📝 Estrutura Esperada

```
Blog/
├── server/
│   ├── ftp-upload-api.js
│   ├── package.json
│   ├── node_modules/     ← Criado após npm install
│   └── uploads/           ← Criado automaticamente
├── src/
└── package.json
```

## 🆘 Ainda com Problemas?

1. **Verifique os logs do servidor** - Eles mostram o que está errado
2. **Verifique se Node.js está instalado:**
   ```bash
   node --version
   npm --version
   ```
3. **Limpe e reinstale:**
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   ```

## ✅ Quando Funcionar

Você saberá que está funcionando quando:
- ✅ Servidor mostra "rodando na porta 3001"
- ✅ Health check retorna `{"status":"ok"}`
- ✅ Upload de imagem funciona sem erro 404
- ✅ Imagem aparece no servidor FTP

