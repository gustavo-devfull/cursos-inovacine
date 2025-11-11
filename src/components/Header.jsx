import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/inovacine.svg'

export default function Header() {
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={logo} 
              alt="Inova Cine" 
              className="h-[50px] w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-900 transition-colors font-medium">
              Início
            </Link>
            <Link to="/cursos" className="text-gray-700 hover:text-primary-900 transition-colors font-medium">
              Cursos
            </Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-900 transition-colors font-medium">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-900 transition-colors font-semibold">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Sair
                </button>
              </>) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-900 transition-colors font-medium">
                  Entrar
                </Link>
                <Link to="/registro" className="btn-primary">
                  Criar Conta
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard" className="text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700" title="Admin">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                )}
                <button onClick={handleLogout} className="text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

