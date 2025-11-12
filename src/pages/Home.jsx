import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import CourseCard from '../components/CourseCard'
import heroVideo1 from '../assets/video-cinema.mp4'
import heroVideo2 from '../assets/video-cinema2.mp4'
import { convertToEmbedUrl } from '../utils/videoUtils'
import logoWhite from '../assets/inovacine-branco.svg'

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(1) // 1 ou 2
  const [fadeOut, setFadeOut] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(3)
  const video1Ref = useRef(null)
  const video2Ref = useRef(null)
  const carouselIntervalRef = useRef(null)
  
  const videoUrl = 'https://www.youtube.com/watch?v=PuJHjjlcMsw'
  const embedUrl = convertToEmbedUrl(videoUrl)

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
        // Erro ao buscar cursos
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Sempre mostrar apenas 1 card por vez
  useEffect(() => {
    setCardsPerView(1)
  }, [])

  // Carregar ambos os vídeos quando o componente montar
  useEffect(() => {
    if (video1Ref.current && video2Ref.current) {
      // Carregar ambos os vídeos
      video1Ref.current.load()
      video2Ref.current.load()
    }
  }, [])

  // Gerenciar alternância de vídeos com fade
  useEffect(() => {
    const currentVideo = activeVideo === 1 ? video1Ref.current : video2Ref.current
    const nextVideo = activeVideo === 1 ? video2Ref.current : video1Ref.current

    if (!currentVideo || !nextVideo) return

    const handleVideoEnd = () => {
      // Fade out do vídeo atual
      setFadeOut(true)
      
      setTimeout(() => {
        // Pausar e resetar vídeo atual
        currentVideo.pause()
        currentVideo.currentTime = 0
        
        // Preparar próximo vídeo antes de trocar
        nextVideo.currentTime = 0
        
        // Trocar para o próximo vídeo
        const nextActiveVideo = activeVideo === 1 ? 2 : 1
        setActiveVideo(nextActiveVideo)
        
        // Aguardar um frame para garantir que o estado foi atualizado
        setTimeout(() => {
          setFadeOut(false)
          // Iniciar próximo vídeo
          nextVideo.play().catch(() => {
            // Ignorar erros de autoplay
          })
        }, 50)
      }, 500) // Duração do fade out (500ms)
    }

    currentVideo.addEventListener('ended', handleVideoEnd)
    
    // Garantir que o vídeo ativo está reproduzindo
    if (currentVideo.paused && !fadeOut) {
      currentVideo.play().catch(() => {
        // Ignorar erros de autoplay
      })
    }

    return () => {
      currentVideo.removeEventListener('ended', handleVideoEnd)
    }
  }, [activeVideo, fadeOut])

  // Autoplay do carrossel
  useEffect(() => {
    if (featuredCourses.length > 0 && !loading && cardsPerView > 0) {
      carouselIntervalRef.current = setInterval(() => {
        setCarouselIndex((prevIndex) => {
          const maxIndex = Math.max(0, featuredCourses.length - cardsPerView)
          return prevIndex >= maxIndex ? 0 : prevIndex + 1
        })
      }, 3000) // Muda a cada 3 segundos
    }

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current)
      }
    }
  }, [featuredCourses.length, loading, cardsPerView])

  const handleCarouselPrev = () => {
    setCarouselIndex((prevIndex) => {
      return prevIndex === 0 ? Math.max(0, featuredCourses.length - cardsPerView) : prevIndex - 1
    })
    // Resetar autoplay ao clicar manualmente
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current)
    }
    carouselIntervalRef.current = setInterval(() => {
      setCarouselIndex((prevIndex) => {
        const maxIndex = Math.max(0, featuredCourses.length - cardsPerView)
        return prevIndex >= maxIndex ? 0 : prevIndex + 1
      })
    }, 3000)
  }

  const handleCarouselNext = () => {
    setCarouselIndex((prevIndex) => {
      const maxIndex = Math.max(0, featuredCourses.length - cardsPerView)
      return prevIndex >= maxIndex ? 0 : prevIndex + 1
    })
    // Resetar autoplay ao clicar manualmente
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current)
    }
    carouselIntervalRef.current = setInterval(() => {
      setCarouselIndex((prevIndex) => {
        const maxIndex = Math.max(0, featuredCourses.length - cardsPerView)
        return prevIndex >= maxIndex ? 0 : prevIndex + 1
      })
    }, 3000)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        {/* Vídeo 1 de fundo */}
        <video
          ref={video1Ref}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            activeVideo === 1 && !fadeOut ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={heroVideo1} type="video/mp4" />
        </video>
        
        {/* Vídeo 2 de fundo */}
        <video
          ref={video2Ref}
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            activeVideo === 2 && !fadeOut ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={heroVideo2} type="video/mp4" />
        </video>
        
        {/* Overlay com gradiente usando as cores do projeto */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#123F6D]/80 via-[#123F6D]/60 to-[#ED145B]/40"></div>
        
        {/* Conteúdo */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
            O OPENCINE é a nova casa do conhecimento para quem vive o cinema por trás das telas.



            </h1>
            <p className="text-xl mb-8 text-white/90">
            Aqui, exibidores e profissionais da exibição encontram conteúdo feito sob medida para o seu dia a dia.
            </p>
            <div className="flex space-x-4">
              <Link to="/cursos" className="bg-white text-primary-900 hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
              >
                Explorar Cursos
              </Link>
              <Link to="/registro" className="bg-gradient-to-r from-[#ED145B] to-[#b71646] text-white hover:from-[#f2437a] hover:to-[#ED145B] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ED145B' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Cursos de Qualidade</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Conteúdo criado por especialistas e atualizado regularmente
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ED145B' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Acesso Ilimitado</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Estude no seu próprio ritmo, quando e onde quiser
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ED145B' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Certificados</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receba certificados de conclusão para seus cursos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-16 bg-gradient-to-br from-[#123F6D] via-[#0d2f4f] to-[#ED145B] dark:from-[#123F6D] dark:via-[#0d2f4f] dark:to-[#ED145B] transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Vídeo - Metade Esquerda */}
            <div className="w-full">
              <div 
                className="relative w-full"
                style={{ 
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0,
                  overflow: 'hidden'
                }}
              >
                <iframe
                  src={embedUrl}
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Vídeo OpenCine"
                ></iframe>
              </div>
            </div>

            {/* Conteúdo - Metade Direita */}
            <div className="flex flex-col items-start justify-center space-y-6">
              {/* Logo */}
              <div className="flex items-center">
                <img 
                  src={logoWhite}
                  alt="Inova Cine" 
                  className="h-20 w-auto transition-opacity duration-300"
                />
              </div>

              {/* Título */}
              <h2 className="text-4xl font-bold text-white">
                Bem-vindo ao OpenCine
              </h2>

              {/* Descrição */}
              <p className="text-lg text-white/90 leading-relaxed">
                O OpenCine é a nova casa do conhecimento para quem vive o cinema por trás das telas. 
                Aqui, exibidores e profissionais da exibição encontram conteúdo feito sob medida para o seu dia a dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Div 1: Título, Descrição e Botão */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Conheça nossos conteúdos!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Do básico ao avançado, nossos vídeos abordam temas que todo profissional de cinema precisa dominar.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                  Boas práticas, insights de mercado, experiências reais e dicas que você só encontra aqui.
                </p>
                <Link 
                  to="/cursos" 
                  className="inline-block bg-gradient-to-r from-[#ED145B] to-[#b71646] hover:from-[#f2437a] hover:to-[#ED145B] text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
                >
                  Ver todos os cursos
                </Link>
            </div>

            {/* Div 2: Carrossel */}
            <div className="relative py-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 dark:border-primary-400"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando cursos...</p>
                </div>
              ) : featuredCourses.length > 0 ? (
                <>
                  {/* Setas de navegação */}
                  <button
                    onClick={handleCarouselPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    style={{ color: '#ED145B' }}
                    aria-label="Anterior"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCarouselNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    style={{ color: '#ED145B' }}
                    aria-label="Próximo"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Container do carrossel */}
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                    >
                      {featuredCourses.map((course) => (
                        <div 
                          key={course.id} 
                          className="flex-shrink-0 w-full px-4"
                        >
                          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transform transition-all hover:scale-[1.02] border border-gray-100 dark:border-gray-700" style={{ margin: '8px 0' }}>
                            <CourseCard course={course} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg transition-colors">
                  <p className="text-gray-600 dark:text-gray-400">Nenhum curso disponível no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

