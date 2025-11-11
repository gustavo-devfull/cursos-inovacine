import { useState, useEffect, useRef } from 'react'
import { uploadImageToFTP } from '../services/ftpUpload'

export default function CourseForm({ course, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
    lessonsCount: '',
    lessons: []
  })
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [lessonVideoUrl, setLessonVideoUrl] = useState('')
  const [lessonLinks, setLessonLinks] = useState([{ title: '', url: '' }])
  const [lessonAttachments, setLessonAttachments] = useState([{ title: '', url: '' }])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [useUpload, setUseUpload] = useState(false)
  const [editingLessonIndex, setEditingLessonIndex] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        price: course.price?.toString() || '',
        imageUrl: course.imageUrl || '',
        lessonsCount: course.lessonsCount?.toString() || '',
        lessons: course.lessons || []
      })
      // Resetar campos de aula ao carregar curso
      setLessonTitle('')
      setLessonDescription('')
      setLessonVideoUrl('')
      setLessonLinks([{ title: '', url: '' }])
      setLessonAttachments([{ title: '', url: '' }])
      setEditingLessonIndex(null)
      if (course.imageUrl) {
        setImagePreview(course.imageUrl)
        // Se a URL parece ser do servidor FTP ou Firebase Storage, assumir que foi upload
        if (course.imageUrl.includes('brincar.ia.br') || 
            course.imageUrl.includes('firebasestorage') || 
            course.imageUrl.includes('firebase')) {
          setUseUpload(true)
        } else {
          setUseUpload(false)
        }
      } else {
        setImagePreview('')
        setUseUpload(false)
      }
    } else {
      // Reset quando não há curso (criando novo)
      setImagePreview('')
      setUseUpload(false)
    }
  }, [course])

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    try {
      setUploading(true)
      setError('')

      // Criar preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Upload para servidor FTP
      const downloadURL = await uploadImageToFTP(file)
      
      setFormData(prev => ({
        ...prev,
        imageUrl: downloadURL
      }))
      
      setUseUpload(true)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      // Mostrar mensagem de erro mais detalhada
      const errorMessage = error.message || 'Erro ao fazer upload da imagem. Tente novamente.'
      setError(errorMessage)
      setImagePreview('')
    } finally {
      setUploading(false)
    }
  }

  function handleImageUrlChange(e) {
    const url = e.target.value
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }))
    if (url) {
      setImagePreview(url)
      setUseUpload(false)
    } else {
      setImagePreview('')
    }
  }

  function clearImage() {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }))
    setImagePreview('')
    setUseUpload(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function addLesson() {
    if (!lessonTitle.trim()) {
      setError('O título da aula é obrigatório')
      return
    }

    // Filtrar links e anexos vazios
    const validLinks = lessonLinks.filter(link => link.title.trim() && link.url.trim())
    const validAttachments = lessonAttachments.filter(att => att.title.trim() && att.url.trim())

    if (editingLessonIndex !== null) {
      // Atualizar aula existente
      setFormData(prev => ({
        ...prev,
        lessons: prev.lessons.map((lesson, index) => {
          if (index === editingLessonIndex) {
            const updatedLesson = {
              title: lessonTitle,
              description: lessonDescription || '',
              videoUrl: lessonVideoUrl || ''
            }
            if (validLinks.length > 0) {
              updatedLesson.links = validLinks
            }
            if (validAttachments.length > 0) {
              updatedLesson.attachments = validAttachments
            }
            return updatedLesson
          }
          return lesson
        })
      }))
      setEditingLessonIndex(null)
    } else {
      // Adicionar nova aula
      const newLesson = {
        title: lessonTitle,
        description: lessonDescription || '',
        videoUrl: lessonVideoUrl || ''
      }
      if (validLinks.length > 0) {
        newLesson.links = validLinks
      }
      if (validAttachments.length > 0) {
        newLesson.attachments = validAttachments
      }
      
      setFormData(prev => ({
        ...prev,
        lessons: [...prev.lessons, newLesson],
        lessonsCount: (prev.lessons.length + 1).toString()
      }))
    }

    setLessonTitle('')
    setLessonDescription('')
    setLessonVideoUrl('')
    setLessonLinks([{ title: '', url: '' }])
    setLessonAttachments([{ title: '', url: '' }])
    setError('')
  }

  function editLesson(index) {
    const lesson = formData.lessons[index]
    setLessonTitle(lesson.title || '')
    setLessonDescription(lesson.description || '')
    setLessonVideoUrl(lesson.videoUrl || '')
    setLessonLinks(lesson.links && lesson.links.length > 0 ? lesson.links : [{ title: '', url: '' }])
    setLessonAttachments(lesson.attachments && lesson.attachments.length > 0 ? lesson.attachments : [{ title: '', url: '' }])
    setEditingLessonIndex(index)
    // Scroll para o formulário de adicionar aula
    document.getElementById('lesson-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function cancelEdit() {
    setLessonTitle('')
    setLessonDescription('')
    setLessonVideoUrl('')
    setLessonLinks([{ title: '', url: '' }])
    setLessonAttachments([{ title: '', url: '' }])
    setEditingLessonIndex(null)
    setError('')
  }

  function addLinkField() {
    setLessonLinks([...lessonLinks, { title: '', url: '' }])
  }

  function removeLinkField(index) {
    setLessonLinks(lessonLinks.filter((_, i) => i !== index))
  }

  function updateLinkField(index, field, value) {
    const updated = [...lessonLinks]
    updated[index] = { ...updated[index], [field]: value }
    setLessonLinks(updated)
  }

  function addAttachmentField() {
    setLessonAttachments([...lessonAttachments, { title: '', url: '' }])
  }

  function removeAttachmentField(index) {
    setLessonAttachments(lessonAttachments.filter((_, i) => i !== index))
  }

  function updateAttachmentField(index, field, value) {
    const updated = [...lessonAttachments]
    updated[index] = { ...updated[index], [field]: value }
    setLessonAttachments(updated)
  }

  function removeLesson(index) {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index),
      lessonsCount: (prev.lessons.length - 1).toString()
    }))
    
    // Se estava editando a aula removida, cancelar edição
    if (editingLessonIndex === index) {
      cancelEdit()
    } else if (editingLessonIndex !== null && editingLessonIndex > index) {
      // Ajustar índice de edição se necessário
      setEditingLessonIndex(editingLessonIndex - 1)
    }
  }

  // Função para remover campos undefined e valores vazios
  function cleanCourseData(data) {
    const cleaned = { ...data }
    
    // Remover campos undefined
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key]
      }
    })
    
    // Limpar lessons
    if (cleaned.lessons && Array.isArray(cleaned.lessons)) {
      cleaned.lessons = cleaned.lessons.map(lesson => {
        const cleanLesson = { ...lesson }
        Object.keys(cleanLesson).forEach(key => {
          if (cleanLesson[key] === undefined || 
              (Array.isArray(cleanLesson[key]) && cleanLesson[key].length === 0) ||
              (typeof cleanLesson[key] === 'string' && cleanLesson[key].trim() === '' && key !== 'description' && key !== 'videoUrl')) {
            delete cleanLesson[key]
          }
        })
        return cleanLesson
      })
    }
    
    return cleaned
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('O título do curso é obrigatório')
      return
    }

    if (!formData.description.trim()) {
      setError('A descrição do curso é obrigatória')
      return
    }

    const courseData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      lessonsCount: parseInt(formData.lessonsCount) || formData.lessons.length
    }

    // Limpar dados antes de enviar
    const cleanedData = cleanCourseData(courseData)
    onSubmit(cleanedData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título do Curso *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="Ex: Introdução ao React"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="input-field"
          placeholder="Descreva o curso..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
            placeholder="Ex: Desenvolvimento Web"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Preço (R$)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="input-field"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem do Curso
        </label>
        
        {/* Tabs para escolher entre URL ou Upload */}
        <div className="flex space-x-2 mb-4 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setUseUpload(false)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                !useUpload
                  ? 'text-primary-900 border-b-2 border-primary-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Usar URL
          </button>
          <button
            type="button"
            onClick={() => setUseUpload(true)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              useUpload
                ? 'text-primary-900 border-b-2 border-primary-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fazer Upload
          </button>
        </div>

        {/* Campo de URL */}
        {!useUpload && (
          <div>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleImageUrlChange}
              className="input-field"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Cole a URL da imagem que deseja usar
            </p>
          </div>
        )}

        {/* Campo de Upload */}
        {useUpload && (
          <div>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="imageUpload"
                className={`flex-1 cursor-pointer ${
                  uploading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-primary-50'
                } border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900 mb-2"></div>
                    <p className="text-sm text-gray-600">Fazendo upload...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">
                      Clique para fazer upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Preview da Imagem */}
        {imagePreview && (
          <div className="mt-4 relative">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-lg"
                title="Remover imagem"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {useUpload ? 'Imagem enviada com sucesso!' : 'Preview da imagem'}
            </p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="lessonsCount" className="block text-sm font-medium text-gray-700 mb-2">
          Número de Aulas
        </label>
        <input
          type="number"
          id="lessonsCount"
          name="lessonsCount"
          value={formData.lessonsCount}
          onChange={handleChange}
          min="0"
          className="input-field"
          placeholder="0"
        />
        <p className="text-sm text-gray-500 mt-1">
          Ou adicione aulas abaixo para atualizar automaticamente
        </p>
      </div>

      {/* Adicionar Aulas */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Aulas do Curso</h3>
        
        <div id="lesson-form" className="bg-gray-50 p-4 rounded-lg mb-4">
          {editingLessonIndex !== null && (
            <div className="mb-3 p-2 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-800 font-medium">
                ✏️ Editando aula {editingLessonIndex + 1}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da Aula *
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="input-field"
                placeholder="Ex: Introdução ao React"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Aula
              </label>
              <textarea
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                rows="2"
                className="input-field"
                placeholder="Descrição da aula..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL do Vídeo (YouTube, Vimeo, etc.)
              </label>
              <input
                type="url"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
                className="input-field"
                placeholder="https://www.youtube.com/embed/VIDEO_ID ou https://player.vimeo.com/video/VIDEO_ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use URLs de embed ou URLs normais do YouTube/Vimeo (serão convertidas automaticamente)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Exemplos: youtube.com/watch?v=..., youtu.be/..., ou youtube.com/embed/...
              </p>
            </div>

            {/* Links da Aula */}
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Links Relacionados
                </label>
                <button
                  type="button"
                  onClick={addLinkField}
                  className="text-xs text-primary-900 hover:text-primary-800 font-medium"
                >
                  + Adicionar Link
                </button>
              </div>
              {lessonLinks.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLinkField(index, 'title', e.target.value)}
                    className="input-field flex-1"
                    placeholder="Título do link"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLinkField(index, 'url', e.target.value)}
                    className="input-field flex-2"
                    placeholder="https://..."
                  />
                  {lessonLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                      title="Remover link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Anexos da Aula */}
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Anexos para Download
                </label>
                <button
                  type="button"
                  onClick={addAttachmentField}
                  className="text-xs text-primary-900 hover:text-primary-800 font-medium"
                >
                  + Adicionar Anexo
                </button>
              </div>
              {lessonAttachments.map((attachment, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={attachment.title}
                    onChange={(e) => updateAttachmentField(index, 'title', e.target.value)}
                    className="input-field flex-1"
                    placeholder="Nome do arquivo"
                  />
                  <input
                    type="url"
                    value={attachment.url}
                    onChange={(e) => updateAttachmentField(index, 'url', e.target.value)}
                    className="input-field flex-2"
                    placeholder="URL do arquivo"
                  />
                  {lessonAttachments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttachmentField(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                      title="Remover anexo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={addLesson}
                className="btn-primary flex-1"
              >
                {editingLessonIndex !== null ? 'Atualizar Aula' : 'Adicionar Aula'}
              </button>
              {editingLessonIndex !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Aulas */}
        {formData.lessons.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Aulas Adicionadas ({formData.lessons.length})</h4>
            {formData.lessons.map((lesson, index) => (
              <div 
                key={index} 
                className={`flex items-start justify-between bg-white p-3 rounded-lg border ${
                  editingLessonIndex === index 
                    ? 'border-primary-900 bg-primary-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                    <p className="font-medium text-gray-800">{lesson.title}</p>
                  </div>
                  {lesson.description && (
                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  )}
                  {lesson.videoUrl && (
                    <p className="text-xs text-primary-900 mt-1">✓ Vídeo adicionado</p>
                  )}
                  {lesson.links && lesson.links.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">🔗 {lesson.links.length} link(s)</p>
                  )}
                  {lesson.attachments && lesson.attachments.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">📎 {lesson.attachments.length} anexo(s)</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    type="button"
                    onClick={() => editLesson(index)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Editar aula"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Remover aula"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex space-x-4 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {course ? 'Atualizar Curso' : 'Criar Curso'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

