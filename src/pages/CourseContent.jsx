import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useAlert } from '../contexts/AlertContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { convertToEmbedUrl } from '../utils/videoUtils'
import { markLessonAsWatched, isLessonWatched, getWatchedLessons } from '../services/progressService'
import CourseChat from '../components/CourseChat'

function CourseContentPage() {
  const { courseId, lessonIndex } = useParams()
  const navigate = useNavigate()
  const { currentUser, userData } = useAuth()
  const { showAlert } = useAlert()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [watchedLessons, setWatchedLessons] = useState([])
  const [isWatched, setIsWatched] = useState(false)
  const [markingAsWatched, setMarkingAsWatched] = useState(false)

  useEffect(() => {
    const index = lessonIndex ? parseInt(lessonIndex) : 0
    setCurrentLessonIndex(index)
  }, [lessonIndex])

  useEffect(() => {
    async function fetchCourse() {
      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId))
        if (courseDoc.exists()) {
          const courseData = { id: courseDoc.id, ...courseDoc.data() }
          setCourse(courseData)
          
          // Verificar se o usuário está inscrito
          if (!currentUser) {
            navigate('/login')
            return
          }

          if (!userData?.enrolledCourses?.includes(courseId)) {
            navigate(`/curso/${courseId}`)
            return
          }

          // Verificar se os dados do usuário estão completos
          const isUserDataComplete = !!(
            userData?.fullName &&
            userData?.cinema &&
            userData?.city &&
            userData?.whatsapp
          )

          if (!isUserDataComplete) {
            showAlert('Por favor, complete seu cadastro para acessar o conteúdo do curso.', 'warning')
            navigate(`/curso/${courseId}`)
            return
          }

          // Se houver aulas, buscar URL do vídeo da aula atual
          if (courseData.lessons && courseData.lessons.length > 0) {
            const currentLesson = courseData.lessons[currentLessonIndex]
            if (currentLesson?.videoUrl) {
              // Converter URL para formato de embed se necessário
              const embedUrl = convertToEmbedUrl(currentLesson.videoUrl)
              setVideoUrl(embedUrl)
            }
          }

          // Carregar progresso do usuário
          if (currentUser) {
            const watched = await getWatchedLessons(currentUser.uid, courseId)
            setWatchedLessons(watched)
            const watchedStatus = await isLessonWatched(currentUser.uid, courseId, currentLessonIndex)
            setIsWatched(watchedStatus)
          }
        } else {
          navigate('/cursos')
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    if (courseId && currentUser && userData) {
      fetchCourse()
    }
  }, [courseId, currentUser, userData, currentLessonIndex, navigate])

  async function goToLesson(index) {
    if (index >= 0 && index < (course?.lessons?.length || 0)) {
      setCurrentLessonIndex(index)
      
      // Atualizar URL do vídeo quando mudar de aula
      const newLesson = course?.lessons?.[index]
      if (newLesson?.videoUrl) {
        const embedUrl = convertToEmbedUrl(newLesson.videoUrl)
        setVideoUrl(embedUrl)
      } else {
        setVideoUrl('')
      }
      
      // Verificar se a nova aula foi assistida
      if (currentUser) {
        const watchedStatus = await isLessonWatched(currentUser.uid, courseId, index)
        setIsWatched(watchedStatus)
      }
      
      navigate(`/curso/${courseId}/aula/${index}`)
      // Scroll to top
      window.scrollTo(0, 0)
    }
  }

  async function handleMarkAsWatched() {
    if (!currentUser || markingAsWatched) return

    try {
      setMarkingAsWatched(true)
      await markLessonAsWatched(currentUser.uid, courseId, currentLessonIndex)
      setIsWatched(true)
      setWatchedLessons(prev => {
        if (!prev.includes(currentLessonIndex)) {
          return [...prev, currentLessonIndex]
        }
        return prev
      })
    } catch (error) {
      showAlert('Erro ao marcar aula como assistida. Tente novamente.', 'error')
    } finally {
      setMarkingAsWatched(false)
    }
  }

  // Nota: A detecção automática do fim do vídeo requer a YouTube IFrame API completa
  // Por enquanto, o usuário pode marcar manualmente usando o botão "Marcar como Assistido"
  // Para implementar detecção automática, seria necessário usar a YouTube IFrame API
  // e criar o player programaticamente em vez de usar apenas o iframe

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 "></div>
        <p className="mt-4 text-gray-600">Carregando conteúdo...</p>
      </div>
    )
  }

  if (!course) {
    return null
  }

  const currentLesson = course.lessons?.[currentLessonIndex]
  const hasPrevious = currentLessonIndex > 0
  const hasNext = currentLessonIndex < (course.lessons?.length || 0) - 1
  const totalLessons = course.lessons?.length || 0

  // Largura do vídeo: 1216px, proporção 16:9
  const videoHeight = (1216 * 9) / 16 // 684px

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/dashboard" className="hover:text-primary-900">Dashboard</Link>
            <span>/</span>
            <Link to={`/curso/${courseId}`} className="hover:text-primary-900">{course.title}</Link>
            <span>/</span>
            <span className="text-gray-800">Aula {currentLessonIndex + 1}</span>
          </div>
        </nav>

        {/* Video Player */}
        <div className="mb-8">
          <div 
            className="mx-auto bg-black rounded-lg overflow-hidden shadow-2xl"
            style={{ width: '1216px', maxWidth: '100%' }}
          >
            {videoUrl ? (
              <div 
                className="relative"
                style={{ 
                  width: '100%',
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0
                }}
              >
                <iframe
                  src={videoUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentLesson?.title || `Aula ${currentLessonIndex + 1}`}
                ></iframe>
              </div>
            ) : (
              <div 
                className="flex items-center justify-center bg-gray-900"
                style={{ 
                  width: '100%',
                  paddingBottom: '56.25%',
                  height: 0,
                  position: 'relative'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <svg className="w-20 h-20 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400">Vídeo não disponível</p>
                  <p className="text-sm text-gray-500 mt-2">Adicione uma URL de vídeo no painel administrativo</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title and Navigation */}
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {currentLesson?.title || `Aula ${currentLessonIndex + 1}`}
                </h1>
                <p className="text-gray-600">
                  Aula {currentLessonIndex + 1} de {totalLessons} • {course.title}
                </p>
              </div>
            </div>

            {currentLesson?.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Sobre esta aula</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentLesson.description}
                </p>
              </div>
            )}

            {/* Botão Marcar como Assistido */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleMarkAsWatched}
                disabled={isWatched || markingAsWatched}
                className={`flex items-center justify-center space-x-2 transition-colors ${
                  isWatched
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-primary-900 hover:bg-primary-800 text-white'
                }`}
                style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
              >
                {isWatched ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Aula Assistida</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{markingAsWatched ? 'Marcando...' : 'Marcar como Assistido'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Links Relacionados */}
            {currentLesson?.links && currentLesson.links.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Links Relacionados</h2>
                <div className="space-y-2">
                  {currentLesson.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary-900 hover:text-primary-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="font-medium">{link.title || link.url}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Anexos para Download */}
            {currentLesson?.attachments && currentLesson.attachments.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Anexos para Download</h2>
                <div className="space-y-2">
                  {currentLesson.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="font-medium text-gray-800">{attachment.title || 'Download'}</span>
                      <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => goToLesson(currentLessonIndex - 1)}
              disabled={!hasPrevious}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                hasPrevious
                  ? 'bg-primary-900 hover:bg-primary-800 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Aula Anterior</span>
            </button>

            <div className="flex-1 text-center">
              <Link
                to={`/curso/${courseId}`}
                className="text-primary-900 hover:text-primary-800 font-semibold"
              >
                Ver todas as aulas
              </Link>
            </div>

            <button
              onClick={() => goToLesson(currentLessonIndex + 1)}
              disabled={!hasNext}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                hasNext
                  ? 'bg-primary-900 hover:bg-primary-800 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Próxima Aula</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Lessons List */}
          <div className="card p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Conteúdo do Curso</h2>
            <div className="space-y-2">
              {course.lessons?.map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => goToLesson(index)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    index === currentLessonIndex
                      ? 'bg-primary-50 border-2 border-primary-900 '
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white"
                        style={{
                          backgroundColor: index === currentLessonIndex
                            ? '#123F6D'
                            : watchedLessons.includes(index)
                            ? '#10b981'
                            : '#ED145B'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          index === currentLessonIndex ? 'text-primary-800' : 'text-gray-800'
                        }`}>
                          {lesson.title || `Aula ${index + 1}`}
                        </p>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {index === currentLessonIndex && (
                      <span className="text-primary-900 font-semibold text-sm">
                        {watchedLessons.includes(index) ? 'Assistido' : 'Assistindo'}
                      </span>
                    )}
                    {index !== currentLessonIndex && watchedLessons.includes(index) && (
                      <span className="text-green-600 font-semibold text-sm">Assistido</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sistema de Conversa */}
          {currentUser && (
            <CourseChat courseId={courseId} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function CourseContent() {
  return (
    <ProtectedRoute>
      <CourseContentPage />
    </ProtectedRoute>
  )
}

