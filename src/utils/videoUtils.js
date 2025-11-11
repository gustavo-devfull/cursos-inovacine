/**
 * Converte URLs do YouTube para formato de embed
 * Suporta vários formatos de URL do YouTube
 */
export function convertToEmbedUrl(url) {
  if (!url) return ''
  
  // Se já é uma URL de embed, retornar como está
  if (url.includes('youtube.com/embed/') || url.includes('youtu.be/') && url.includes('embed')) {
    return url
  }
  
  // Se já é player.vimeo.com, retornar como está
  if (url.includes('player.vimeo.com')) {
    return url
  }
  
  let videoId = ''
  
  // Formato: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    const match = url.match(/[?&]v=([^&]+)/)
    if (match) {
      videoId = match[1]
    }
  }
  // Formato: https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([^?&]+)/)
    if (match) {
      videoId = match[1]
    }
  }
  // Formato: https://www.youtube.com/embed/VIDEO_ID (já é embed)
  else if (url.includes('youtube.com/embed/')) {
    return url
  }
  // Formato: https://www.youtube.com/v/VIDEO_ID
  else if (url.includes('youtube.com/v/')) {
    const match = url.match(/youtube\.com\/v\/([^?&]+)/)
    if (match) {
      videoId = match[1]
    }
  }
  
  // Se encontrou o videoId, converter para embed
  if (videoId) {
    // Remover parâmetros extras do videoId
    videoId = videoId.split('&')[0].split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  // Se não conseguiu converter, retornar a URL original
  // (pode ser Vimeo ou outro serviço)
  return url
}

/**
 * Verifica se a URL é de um serviço de vídeo suportado
 */
export function isVideoUrl(url) {
  if (!url) return false
  
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('player.vimeo.com')
  )
}

