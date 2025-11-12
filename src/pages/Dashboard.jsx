import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, doc, updateDoc, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useAlert } from '../contexts/AlertContext'
import CourseCardWithCancel from '../components/CourseCardWithCancel'
import EditUserDataModal from '../components/EditUserDataModal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Dashboard() {
  const { currentUser, userData, refreshUserData } = useAuth()
  const { showAlert } = useAlert()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [courseToUnenroll, setCourseToUnenroll] = useState(null)

  useEffect(() => {
    async function fetchEnrolledCourses() {
      if (!currentUser) {
        setEnrolledCourses([])
        setLoading(false)
        return
      }

      if (!userData?.enrolledCourses || userData.enrolledCourses.length === 0) {
        setEnrolledCourses([])
        setLoading(false)
        return
      }

      setLoading(true)
      
      try {
        // Buscar todos os cursos e filtrar pelos IDs inscritos
        const querySnapshot = await getDocs(collection(db, 'courses'))
        const allCourses = []
        const enrolledIds = userData.enrolledCourses || []
        
        
        querySnapshot.forEach((doc) => {
          if (enrolledIds.includes(doc.id)) {
            allCourses.push({ id: doc.id, ...doc.data() })
          }
        })
        
        setEnrolledCourses(allCourses)
      } catch (error) {
        setEnrolledCourses([])
      } finally {
        setLoading(false)
      }
    }

    if (currentUser && userData) {
      fetchEnrolledCourses()
    } else if (!currentUser) {
      setEnrolledCourses([])
      setLoading(false)
    }
  }, [currentUser, userData])

  function handleUnenrollClick(courseId) {
    setCourseToUnenroll(courseId)
    setShowConfirmDialog(true)
  }

  async function handleUnenroll() {
    if (!currentUser || !courseToUnenroll) {
      return
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        enrolledCourses: arrayRemove(courseToUnenroll)
      })
      
      // Atualizar lista local removendo o curso imediatamente
      setEnrolledCourses(prev => prev.filter(course => course.id !== courseToUnenroll))

      // Recarregar dados do usuário para garantir sincronização
      if (refreshUserData) {
        await refreshUserData()
      }
      
      showAlert('Inscrição cancelada com sucesso!', 'success')
      setCourseToUnenroll(null)
    } catch (error) {
      showAlert('Erro ao cancelar inscrição', 'error')
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Olá, {userData?.name || 'Usuário'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie seus cursos e continue aprendendo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Cursos Inscritos</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">
                {enrolledCourses.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-900 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Email</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2 truncate">
                {currentUser?.email}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Dados de Cadastro</p>
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-2 text-primary-900 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold text-sm flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar Dados</span>
              </button>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Meus Cursos</h2>
          <Link to="/cursos" className="text-primary-900 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold">
            Explorar mais cursos →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 dark:border-primary-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando cursos...</p>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCardWithCancel 
                key={course.id} 
                course={course} 
                onCancel={() => handleUnenrollClick(course.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Você ainda não está inscrito em nenhum curso
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explore nossa coleção de cursos e comece a aprender hoje!
            </p>
            <Link to="/cursos" className="btn-primary inline-block">
              Explorar Cursos
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Edição de Dados */}
      <EditUserDataModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      {/* Modal de Confirmação */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setCourseToUnenroll(null)
        }}
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

