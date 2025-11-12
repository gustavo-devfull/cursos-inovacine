import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useAlert } from '../contexts/AlertContext'
import EnrollmentModal from '../components/EnrollmentModal'
import ConfirmDialog from '../components/ConfirmDialog'
import CourseChat from '../components/CourseChat'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, userData, refreshUserData } = useAuth()
  const { showAlert } = useAlert()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    async function fetchCourse() {
      try {
        const courseDoc = await getDoc(doc(db, 'courses', id))
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() })
          
          // Verificar se o usuário está inscrito
          if (currentUser && userData?.enrolledCourses?.includes(id)) {
            setIsEnrolled(true)
          }
        } else {
          navigate('/cursos')
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, currentUser, userData, navigate])

  // Verificar se os dados do usuário estão completos
  function isUserDataComplete() {
    if (!userData) return false
    return !!(
      userData.fullName &&
      userData.cinema &&
      userData.city &&
      userData.whatsapp
    )
  }

  // Verificar se o usuário já está inscrito em algum curso
  function hasEnrolledCourses() {
    if (!userData) return false
    return !!(userData.enrolledCourses && userData.enrolledCourses.length > 0)
  }

  function handleEnrollClick() {
    if (!currentUser) {
      navigate('/login')
      return
    }

    // Se o usuário já está inscrito em algum curso, inscrever diretamente
    if (hasEnrolledCourses()) {
      handleEnroll()
      return
    }

    // Verificar se os dados estão completos
    if (isUserDataComplete()) {
      // Se os dados já estão completos, inscrever diretamente
      handleEnroll()
    } else {
      // Se não estão completos, mostrar modal
      setShowEnrollmentModal(true)
    }
  }

  async function handleEnroll(additionalData = null) {
    if (!currentUser) {
      navigate('/login')
      return
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid)
      const updateData = {
        enrolledCourses: arrayUnion(id)
      }

      // Se dados adicionais foram fornecidos, adicionar ao update
      if (additionalData) {
        updateData.fullName = additionalData.fullName
        updateData.cinema = additionalData.cinema
        updateData.city = additionalData.city
        updateData.whatsapp = additionalData.whatsapp
      }

      await updateDoc(userRef, updateData)
      setIsEnrolled(true)
      
      // Atualizar dados do usuário no contexto
      if (refreshUserData) {
        await refreshUserData()
      }
      
      setShowEnrollmentModal(false)
      showAlert('Inscrição realizada com sucesso!', 'success')
    } catch (error) {
      showAlert('Erro ao se inscrever no curso', 'error')
    }
  }

  async function handleEnrollmentConfirm(formData) {
    await handleEnroll(formData)
  }

  function handleUnenrollClick() {
    setShowConfirmDialog(true)
  }

  async function handleUnenroll() {
    if (!currentUser) {
      return
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        enrolledCourses: arrayRemove(id)
      })
      setIsEnrolled(false)
      showAlert('Inscrição cancelada com sucesso!', 'success')
    } catch (error) {
      showAlert('Erro ao cancelar inscrição', 'error')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 "></div>
        <p className="mt-4 text-gray-600">Carregando curso...</p>
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card p-8 mb-6">
            {course.imageUrl && (
              <img 
                src={course.imageUrl} 
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{course.title}</h1>
            <div className="flex items-center space-x-4 mb-6 text-gray-600">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                {course.category || 'Curso'}
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {course.lessonsCount || 0} aulas
              </span>
            </div>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">Sobre o Curso</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.description || 'Descrição do curso em breve...'}
              </p>
            </div>
          </div>

          {/* Course Content */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-6">Conteúdo do Curso</h2>
            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-4">
                {course.lessons.map((lesson, index) => (
                  <div 
                    key={index} 
                    className={`border-l-4 pl-4 py-3 rounded-r-lg transition-colors ${
                      isEnrolled 
                        ? 'border-primary-900 bg-primary-50 hover:bg-primary-100 cursor-pointer' 
                        : 'border-gray-300'
                    }`}
                    onClick={isEnrolled ? () => navigate(`/curso/${id}/aula/${index}`) : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white"
                          style={{ backgroundColor: '#ED145B' }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{lesson.title || `Aula ${index + 1}`}</h3>
                          {lesson.description && (
                            <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                          )}
                          
                          {/* Informações adicionais da aula */}
                          <div className="flex items-center flex-wrap gap-3 mt-2">
                            {lesson.videoUrl && (
                              <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Vídeo
                              </span>
                            )}
                            {lesson.links && lesson.links.length > 0 && (
                              <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                {lesson.links.length} {lesson.links.length === 1 ? 'Link' : 'Links'}
                              </span>
                            )}
                            {lesson.attachments && lesson.attachments.length > 0 && (
                              <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {lesson.attachments.length} {lesson.attachments.length === 1 ? 'Anexo' : 'Anexos'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isEnrolled && (
                        <svg className="w-5 h-5 text-primary-900 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Conteúdo do curso será adicionado em breve.              </p>
            )}
          </div>

          {/* Sistema de Conversa */}
          {isEnrolled && currentUser && (
            <CourseChat courseId={id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            {isEnrolled ? (
              <div className="space-y-4">
                <button
                  onClick={() => navigate(`/curso/${id}/aula/0`)}
                  className="w-full btn-primary"
                >
                  Acessar Curso
                </button>
                <button
                  onClick={handleUnenrollClick}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200"
                  style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
                >
                  Cancelar Curso
                </button>
                <p className="text-center text-green-600 font-semibold">
                  ✓ Você está inscrito neste curso
                </p>
              </div>
            ) : (
              <button
                onClick={handleEnrollClick}
                className="w-full btn-primary"
              >
                {currentUser ? 'Inscrever-se' : 'Fazer Login para Inscrever-se'}
              </button>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-4">Este curso inclui:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Acesso vitalício
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Certificado de conclusão
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Suporte do instrutor
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cadastro Adicional */}
      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onConfirm={handleEnrollmentConfirm}
      />

      {/* Modal de Confirmação */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleUnenroll}
        title="Cancelar Inscrição"
        message="Tem certeza que deseja cancelar sua inscrição neste curso?"
        confirmText="Sim, Cancelar"
        cancelText="Não"
        confirmColor="red"
      />
    </div>
  )
}

