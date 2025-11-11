# Servidor de Upload FTP

Este servidor faz upload de imagens para o servidor FTP configurado.

## 📋 Instalação

1. Entre na pasta do servidor:
```bash
cd server
```

2. Instale as dependências:
```bash
npm install
```

## 🚀 Execução

### Modo Desenvolvimento
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 🔧 Configuração

As credenciais FTP estão configuradas no arquivo `ftp-upload-api.js`:

- **Host**: ftp.brincar.ia.br
- **Usuário**: u715606397.bloginova
- **Porta**: 21
- **Pasta**: blog_inova

## 📡 Endpoints

### POST /api/upload-ftp
Faz upload de uma imagem para o servidor FTP.

**Request:**
- Content-Type: multipart/form-data
- Body: `image` (arquivo de imagem)

**Response:**
```json
{
  "success": true,
  "url": "https://brincar.ia.br/blog_inova/1234567890_imagem.jpg",
  "imageUrl": "https://brincar.ia.br/blog_inova/1234567890_imagem.jpg",
  "fileName": "1234567890_imagem.jpg"
}
```

### GET /api/health
Verifica se o servidor está funcionando.

## 🔒 Segurança

⚠️ **IMPORTANTE**: Em produção, mova as credenciais FTP para variáveis de ambiente:

```javascript
const FTP_CONFIG = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  port: parseInt(process.env.FTP_PORT || '21'),
  secure: process.env.FTP_SECURE === 'true'
}
```

E crie um arquivo `.env`:
```
FTP_HOST=ftp.brincar.ia.br
FTP_USER=u715606397.bloginova
FTP_PASSWORD=@Lulipop1
FTP_PORT=21
FTP_SECURE=false
```

## 🌐 Deploy

Este servidor pode ser deployado em:
- Vercel (como serverless function)
- Netlify (como serverless function)
- Railway
- Heroku
- Qualquer servidor Node.js

Para Vercel/Netlify, você precisará adaptar o código para o formato de função serverless.

