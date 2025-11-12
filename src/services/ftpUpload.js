// Serviço de upload FTP
// Nota: Para segurança, as credenciais FTP devem ser armazenadas em variáveis de ambiente
// ou em um servidor backend. Este serviço faz upload via API endpoint.

const FTP_CONFIG = {
  host: 'ftp.brincar.ia.br',
  user: 'u715606397.bloginova',
  password: '@Lulipop1',
  port: 21,
  folder: 'blog_inova'
}

// URL base onde as imagens serão acessadas após upload
// Ajuste esta URL conforme a configuração do seu servidor web
const FTP_BASE_URL = 'https://brincar.ia.br/blog_inova'

/**
 * Faz upload de uma imagem para o servidor FTP via API
 * @param {File} file - Arquivo de imagem a ser enviado
 * @returns {Promise<string>} - URL da imagem após upload
 */
export async function uploadImageToFTP(file) {
  try {
    // Criar FormData para enviar o arquivo
    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', FTP_CONFIG.folder)

    // URL do endpoint de API
    // Por padrão, tenta usar a variável de ambiente ou o endpoint local
    const API_ENDPOINT = import.meta.env.VITE_FTP_UPLOAD_API || 'http://localhost:3001/api/upload-ftp'
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          'Servidor de upload não encontrado. ' +
          'Certifique-se de que o servidor FTP está rodando. ' +
          'Execute: npm run server:dev na raiz do projeto.'
        )
      }
      await response.text()
      throw new Error(`Erro ao fazer upload: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.url && !data.imageUrl) {
      throw new Error('Resposta inválida do servidor')
    }
    
    return data.url || data.imageUrl
  } catch (error) {
    // Mensagens de erro mais específicas
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(
        'Não foi possível conectar ao servidor de upload. ' +
        'Certifique-se de que o servidor está rodando em http://localhost:3001. ' +
        'Execute: npm run server:dev'
      )
    }
    
    // Re-lançar o erro com a mensagem original se já tiver uma mensagem personalizada
    if (error.message.includes('Servidor de upload') || error.message.includes('não foi possível')) {
      throw error
    }
    
    throw new Error(error.message || 'Erro ao fazer upload da imagem. Verifique a conexão e tente novamente.')
  }
}

/**
 * Gera um nome único para o arquivo
 */
function generateFileName(originalName) {
  const timestamp = Date.now()
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${timestamp}_${sanitizedName}`
}

export { FTP_CONFIG, FTP_BASE_URL, generateFileName }

