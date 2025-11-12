import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function EnrollmentModal({ isOpen, onClose, onConfirm }) {
  const { userData } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    cinema: '',
    city: '',
    whatsapp: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Preencher dados existentes quando o modal abrir
  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        fullName: userData.fullName || '',
        cinema: userData.cinema || '',
        city: userData.city || '',
        whatsapp: userData.whatsapp || ''
      })
    }
  }, [isOpen, userData])

  if (!isOpen) return null

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  function validate() {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório'
    }
    
    if (!formData.cinema.trim()) {
      newErrors.cinema = 'Cinema é obrigatório'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório'
    } else {
      // Validação básica de WhatsApp (deve conter apenas números e caracteres comuns)
      const whatsappRegex = /^[\d\s\(\)\-\+]+$/
      if (!whatsappRegex.test(formData.whatsapp)) {
        newErrors.whatsapp = 'Formato de WhatsApp inválido'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setSubmitting(true)
    try {
      await onConfirm(formData)
      // Limpar formulário após sucesso
      setFormData({
        fullName: '',
        cinema: '',
        city: '',
        whatsapp: ''
      })
      setErrors({})
    } catch (error) {
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    if (!submitting) {
      setFormData({
        fullName: '',
        cinema: '',
        city: '',
        whatsapp: ''
      })
      setErrors({})
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Complete seu Cadastro</h2>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Para se inscrever no curso, precisamos de algumas informações adicionais:
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nome Completo */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.fullName ? 'border-red-500' : ''}`}
                  placeholder="Digite seu nome completo"
                  disabled={submitting}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Cinema */}
              <div>
                <label htmlFor="cinema" className="block text-sm font-medium text-gray-700 mb-1">
                  Cinema <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cinema"
                  name="cinema"
                  value={formData.cinema}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.cinema ? 'border-red-500' : ''}`}
                  placeholder="Digite o nome do cinema"
                  disabled={submitting}
                />
                {errors.cinema && (
                  <p className="text-red-500 text-sm mt-1">{errors.cinema}</p>
                )}
              </div>

              {/* Cidade */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="Digite sua cidade"
                  disabled={submitting}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.whatsapp ? 'border-red-500' : ''}`}
                  placeholder="(00) 00000-0000"
                  disabled={submitting}
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
                style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-900 hover:bg-primary-800 text-white transition-colors disabled:opacity-50"
                style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
              >
                {submitting ? 'Processando...' : 'Confirmar Inscrição'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

