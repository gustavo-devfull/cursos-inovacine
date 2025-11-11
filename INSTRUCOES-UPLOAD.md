# 🔧 Instruções para Resolver o Erro 404 no Upload

## ❌ Erro Atual
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Erro no upload FTP: Error: Erro ao fazer upload da imagem
```

## ✅ Solução

O erro 404 ocorre porque o **servidor de API FTP não está rodando**. Siga estes passos:

### 1. Instalar Dependências do Servidor

Abra um terminal e execute:

```bash
cd server
npm install
```

Isso instalará as dependências necessárias:
- `express` - Servidor web
- `multer` - Upload de arquivos
- `basic-ftp` - Cliente FTP
- `cors` - Permissão de CORS

### 2. Iniciar o Servidor de Upload

**Opção A - Usando script do projeto:**
```bash
# Na raiz do projeto
npm run server:dev
```

**Opção B - Manualmente:**
```bash
cd server
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

### 3. Verificar se o Servidor Está Funcionando

Abra no navegador ou use curl:
```
http://localhost:3001/api/health
```

Você deve ver:
```json
{"status":"ok","service":"ftp-upload-api"}
```

### 4. Configurar a URL da API (Opcional)

Se o servidor estiver em outro endereço, crie um arquivo `.env` na raiz:

```env
VITE_FTP_UPLOAD_API=http://localhost:3001/api/upload-ftp
```

### 5. Testar o Upload

Agora você pode:
1. Ir ao painel administrativo
2. Criar ou editar um curso
3. Clicar em "Fazer Upload"
4. Selecionar uma imagem
5. O upload deve funcionar!

## 🚀 Executar Frontend e Backend Juntos

Você precisa ter **dois terminais** abertos:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Servidor de Upload:**
```bash
npm run server:dev
```

## 🔍 Verificar Logs

Se ainda houver problemas, verifique:

1. **Porta 3001 está livre?**
   - O servidor precisa da porta 3001
   - Se estiver ocupada, mude no arquivo `server/ftp-upload-api.js`

2. **Credenciais FTP estão corretas?**
   - Verifique em `server/ftp-upload-api.js`
   - Host: `ftp.brincar.ia.br`
   - Usuário: `u715606397.bloginova`
   - Porta: `21`

3. **Pasta blog_inova existe no FTP?**
   - O servidor tentará criar automaticamente
   - Se não conseguir, crie manualmente no servidor FTP

## 📝 Estrutura Esperada

```
Blog/
├── server/
│   ├── ftp-upload-api.js  ← Servidor de API
│   ├── package.json
│   └── node_modules/       ← Instalar com npm install
├── src/
│   └── services/
│       └── ftpUpload.js    ← Cliente de upload
└── .env                    ← Opcional (URL da API)
```

## ⚠️ Problemas Comuns

### Erro: "Cannot find module 'express'"
**Solução:** Execute `cd server && npm install`

### Erro: "Port 3001 already in use"
**Solução:** 
- Feche outros processos usando a porta 3001
- Ou mude a porta no arquivo `server/ftp-upload-api.js`

### Erro: "ECONNREFUSED"
**Solução:** Certifique-se de que o servidor está rodando

### Erro: "FTP connection failed"
**Solução:** Verifique as credenciais FTP e se o servidor FTP está acessível

## 🎯 Próximos Passos

Após resolver o erro 404:
1. ✅ Servidor rodando em `http://localhost:3001`
2. ✅ Frontend rodando em `http://localhost:5173`
3. ✅ Testar upload de imagem no painel admin
4. ✅ Verificar se a imagem aparece no servidor FTP

