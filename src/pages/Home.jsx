import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import CourseCard from '../components/CourseCard'
import heroImage from '../assets/inovacine003-1.jpg'

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const q = query(collection(db, 'courses'), limit(6))
        const querySnapshot = await getDocs(q)
        const courses = []
        querySnapshot.forEach((doc) => {
          courses.push({ id: doc.id, ...doc.data() })
        })
        setFeaturedCourses(courses)
      } catch (error) {
        console.error('Erro ao buscar cursos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`
        }}
      >
        {/* Overlay azul com 40% de opacidade */}
        <div className="absolute inset-0 bg-primary-900 opacity-40"></div>
        
        {/* Conteúdo */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Aprenda e Cresça com Nossos Cursos
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Descubra uma ampla variedade de cursos online e desenvolva suas habilidades profissionais.
            </p>
            <div className="flex space-x-4">
              <Link to="/cursos" className="bg-white text-primary-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                Explorar Cursos
              </Link>
              <Link to="/registro" className="bg-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-accent-800 transition-colors border-2 border-white">
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-900 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cursos de Qualidade</h3>
              <p className="text-gray-600">
                Conteúdo criado por especialistas e atualizado regularmente
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-900 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Acesso Ilimitado</h3>
              <p className="text-gray-600">
                Estude no seu próprio ritmo, quando e onde quiser
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-900 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Certificados</h3>
              <p className="text-gray-600">
                Receba certificados de conclusão para seus cursos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Cursos em Destaque</h2>
            <Link to="/cursos" className="text-primary-900 hover:text-primary-800 font-semibold">
              Ver todos →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 "></div>
              <p className="mt-4 text-gray-600">Carregando cursos...</p>
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">Nenhum curso disponível no momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

