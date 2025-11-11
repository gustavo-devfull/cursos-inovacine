# Configuração de Upload FTP

## 📋 Visão Geral

O sistema foi configurado para fazer upload de imagens para o servidor FTP:
- **Host**: ftp.brincar.ia.br
- **Usuário**: u715606397.bloginova
- **Porta**: 21
- **Pasta**: blog_inova

## 🚀 Como Usar

### 1. Iniciar o Servidor de Upload FTP

O upload FTP requer um servidor backend separado. Execute:

```bash
# Instalar dependências do servidor
cd server
npm install

# Iniciar servidor em modo desenvolvimento
npm run dev

# Ou iniciar em modo produção
npm start
```

O servidor estará rodando em `http://localhost:3001`

### 2. Configurar a URL da API no Frontend

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_FTP_UPLOAD_API=http://localhost:3001/api/upload-ftp
```

Para produção, substitua pela URL do seu servidor de API.

### 3. Usar no Formulário de Cursos

No painel administrativo, ao criar ou editar um curso:

1. Clique na aba **"Fazer Upload"**
2. Selecione uma imagem (PNG, JPG, GIF até 5MB)
3. A imagem será enviada automaticamente para o servidor FTP
4. A URL será salva automaticamente no campo `imageUrl`

## 📁 Estrutura de Arquivos

```
server/
├── ftp-upload-api.js    # Servidor de API para upload FTP
├── package.json         # Dependências do servidor
└── README.md            # Documentação do servidor

src/
├── services/
│   └── ftpUpload.js     # Serviço de upload FTP (cliente)
└── components/
    └── CourseForm.jsx   # Formulário atualizado para usar FTP
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente (Recomendado para Produção)

No arquivo `server/ftp-upload-api.js`, você pode mover as credenciais para variáveis de ambiente:

```javascript
const FTP_CONFIG = {
  host: process.env.FTP_HOST || 'ftp.brincar.ia.br',
  user: process.env.FTP_USER || 'u715606397.bloginova',
  password: process.env.FTP_PASSWORD || '@Lulipop1',
  port: parseInt(process.env.FTP_PORT || '21'),
  secure: process.env.FTP_SECURE === 'true'
}
```

E criar um arquivo `.env` no servidor:

```
FTP_HOST=ftp.brincar.ia.br
FTP_USER=u715606397.bloginova
FTP_PASSWORD=@Lulipop1
FTP_PORT=21
FTP_SECURE=false
```

## 🌐 Deploy do Servidor

O servidor pode ser deployado em:

- **Vercel**: Como serverless function
- **Netlify**: Como serverless function  
- **Railway**: Servidor Node.js completo
- **Heroku**: Servidor Node.js completo
- **Qualquer servidor Node.js**: VPS, Cloud, etc.

### Exemplo para Vercel

Crie `api/upload-ftp.js`:

```javascript
import { uploadToFTP } from '../server/ftp-upload-api'

export default async function handler(req, res) {
  // Adaptar código do servidor para formato serverless
  // ...
}
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite credenciais FTP no código
- Use variáveis de ambiente em produção
- Configure CORS adequadamente
- Adicione autenticação ao endpoint de API em produção

## 📝 URLs das Imagens

Após o upload, as imagens estarão disponíveis em:
```
https://brincar.ia.br/blog_inova/[nome-do-arquivo]
```

O nome do arquivo será gerado automaticamente com timestamp para evitar conflitos:
```
1234567890_imagem.jpg
```

## 🐛 Troubleshooting

### Erro: "Erro ao fazer upload da imagem"
- Verifique se o servidor FTP está rodando
- Confirme as credenciais FTP
- Verifique se a pasta `blog_inova` existe no servidor FTP
- Confirme que a porta 21 está aberta

### Erro: "CORS policy"
- Configure CORS no servidor de API
- Verifique se a URL da API está correta no `.env`

### Imagens não aparecem
- Verifique se o servidor web está configurado para servir arquivos da pasta `blog_inova`
- Confirme a URL base configurada em `ftpUpload.js`

