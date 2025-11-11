// Servidor de API para upload FTP
// Execute este servidor separadamente: node server/ftp-upload-api.js
// Ou configure como função serverless (Vercel, Netlify, etc.)

import express from 'express'
import multer from 'multer'
import basicFtp from 'basic-ftp'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Configuração FTP
const FTP_CONFIG = {
  host: 'ftp.brincar.ia.br',
  user: 'u715606397.bloginova',
  password: '@Lulipop1',
  port: 21,
  secure: false // Use true para FTPS
}

const FTP_FOLDER = 'blog_inova'
const FTP_BASE_URL = 'https://brincar.ia.br/blog_inova'

// Middleware
app.use(cors())
app.use(express.json())

// Configuração do Multer para upload temporário
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false)
    }
  }
})

/**
 * Endpoint para upload de imagem via FTP
 */
app.post('/api/upload-ftp', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  }

  const client = new basicFtp.Client()
  client.ftp.verbose = true

  try {
    // Conectar ao servidor FTP
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port,
      secure: FTP_CONFIG.secure
    })

    // Criar pasta se não existir e entrar nela
    try {
      await client.ensureDir(FTP_FOLDER)
      await client.cd(FTP_FOLDER)
    } catch (error) {
      console.log('Pasta já existe ou erro ao criar:', error.message)
      // Tentar entrar na pasta mesmo se já existir
      try {
        await client.cd(FTP_FOLDER)
      } catch (cdError) {
        console.log('Erro ao entrar na pasta:', cdError.message)
      }
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = path.extname(req.file.originalname)
    const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`
    
    // Usar apenas o nome do arquivo, pois já estamos dentro da pasta blog_inova
    const remotePath = fileName

    // Fazer upload do arquivo
    await client.uploadFrom(req.file.path, remotePath)

    // Gerar URL da imagem
    const imageUrl = `${FTP_BASE_URL}/${fileName}`

    // Limpar arquivo temporário
    const fs = await import('fs')
    fs.unlinkSync(req.file.path)

    res.json({
      success: true,
      url: imageUrl,
      imageUrl: imageUrl,
      fileName: fileName
    })
  } catch (error) {
    console.error('Erro no upload FTP:', error)
    
    // Limpar arquivo temporário em caso de erro
    try {
      const fs = await import('fs')
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path)
      }
    } catch (cleanupError) {
      console.error('Erro ao limpar arquivo temporário:', cleanupError)
    }

    res.status(500).json({
      error: 'Erro ao fazer upload da imagem',
      message: error.message
    })
  } finally {
    client.close()
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ftp-upload-api' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de upload FTP rodando na porta ${PORT}`)
  console.log(`📁 Pasta FTP: ${FTP_FOLDER}`)
  console.log(`🌐 URL base: ${FTP_BASE_URL}`)
})

