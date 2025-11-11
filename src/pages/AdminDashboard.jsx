import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import CourseForm from '../components/CourseForm'
import CourseCard from '../components/CourseCard'
import ConfirmDialog from '../components/ConfirmDialog'

export default function AdminDashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'courses'))
      const coursesData = []
      querySnapshot.forEach((doc) => {
        coursesData.push({ id: doc.id, ...doc.data() })
      })
      setCourses(coursesData)
    } catch (error) {
      console.error('Erro ao buscar cursos:', error)
      setError('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  // Função para remover campos undefined antes de enviar ao Firestore
  function removeUndefinedFields(obj) {
    if (obj === null || obj === undefined) return obj
    if (Array.isArray(obj)) {
      return obj.map(item => removeUndefinedFields(item))
    }
    if (typeof obj !== 'object') return obj
    
    const cleaned = {}
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefinedFields(obj[key])
      }
    })
    return cleaned
  }

  async function handleCreateCourse(courseData) {
    try {
      setError('')
      setSuccess('')
      // Remover campos undefined antes de enviar
      const cleanedData = removeUndefinedFields(courseData)
      await addDoc(collection(db, 'courses'), cleanedData)
      setSuccess('Curso criado com sucesso!')
      setShowForm(false)
      fetchCourses()
    } catch (error) {
      console.error('Erro ao criar curso:', error)
      setError('Erro ao criar curso')
    }
  }

  async function handleUpdateCourse(courseData) {
    try {
      setError('')
      setSuccess('')
      // Remover campos undefined antes de enviar
      const cleanedData = removeUndefinedFields(courseData)
      const courseRef = doc(db, 'courses', editingCourse.id)
      await updateDoc(courseRef, cleanedData)
      setSuccess('Curso atualizado com sucesso!')
      setEditingCourse(null)
      setShowForm(false)
      fetchCourses()
    } catch (error) {
      console.error('Erro ao atualizar curso:', error)
      setError('Erro ao atualizar curso')
    }
  }

  function handleDeleteCourseClick(courseId) {
    setCourseToDelete(courseId)
    setShowConfirmDialog(true)
  }

  async function handleDeleteCourse() {
    if (!courseToDelete) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await deleteDoc(doc(db, 'courses', courseToDelete))
      setSuccess('Curso excluído com sucesso!')
      fetchCourses()
      setCourseToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir curso:', error)
      setError('Erro ao excluir curso')
    }
  }

  function handleEdit(course) {
    setEditingCourse(course)
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingCourse(null)
    setError('')
    setSuccess('')
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie os cursos da plataforma</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Novo Curso
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
      </div>

      {showForm ? (
        <div className="card p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingCourse ? 'Editar Curso' : 'Criar Novo Curso'}
            </h2>
          </div>
          <CourseForm
            course={editingCourse}
            onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Cursos</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {courses.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-900 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cursos Gratuitos</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {courses.filter(c => c.price === 0 || c.price === '0').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cursos Pagos</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {courses.filter(c => c.price > 0 && c.price !== '0').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Cursos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Todos os Cursos</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 "></div>
                <p className="mt-4 text-gray-600">Carregando cursos...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="card group relative">
                    <CourseCard course={course} />
                    <div className="absolute top-2 left-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                        title="Editar curso"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCourseClick(course.id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                        title="Excluir curso"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nenhum curso cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro curso!
                </p>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                  Criar Primeiro Curso
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Confirmação */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setCourseToDelete(null)
        }}
        onConfirm={handleDeleteCourse}
        title="Excluir Curso"
        message="Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        confirmColor="red"
      />
    </div>
  )
}

