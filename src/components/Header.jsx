import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import logo from '../assets/inovacine.svg'
import logoWhite from '../assets/inovacine-branco.svg'
import NotificationDropdown from './NotificationDropdown'

export default function Header() {
  const { currentUser, logout, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/')
    } catch (error) {
    }
  }

  return (
    <header className="bg-gradient-to-r from-[#123F6D] to-[#0d2f4f] dark:from-[#123F6D] dark:to-[#ED145B] shadow-md sticky top-0 z-50 transition-all">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={logoWhite} 
              alt="Inova Cine" 
              className="h-[50px] w-auto transition-opacity duration-300"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {/* Botão de Toggle Dark Mode */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleTheme()
              }}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              title={isDark ? 'Modo Claro' : 'Modo Escuro'}
              type="button"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDark ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link to="/" className="text-white hover:text-gray-200 transition-colors font-medium">
              Início
            </Link>
            <Link to="/cursos" className="text-white hover:text-gray-200 transition-colors font-medium">
              Cursos
            </Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-gray-200 transition-colors font-medium">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-white hover:text-gray-200 transition-colors font-semibold">
                    Admin
                  </Link>
                )}
                {currentUser && (
                  <NotificationDropdown />
                )}
                <button
                    onClick={handleLogout}
                    className="bg-white/20 hover:bg-white/30 text-white transition-colors duration-200"
                    style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
                  >
                    Sair
                  </button>
              </>) : (
              <>
                <Link to="/login" className="text-white hover:text-gray-200 transition-colors font-medium">
                  Entrar
                </Link>
                <Link to="/registro" className="bg-gradient-to-r from-[#ED145B] to-[#b71646] hover:from-[#f2437a] hover:to-[#ED145B] text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Botão de Toggle Dark Mode Mobile */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleTheme()
              }}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              title={isDark ? 'Modo Claro' : 'Modo Escuro'}
              type="button"
            >
              {isDark ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard" className="text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                       {isAdmin && (
                         <Link to="/admin" className="text-white" title="Admin">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                         </Link>
                       )}
                       {currentUser && (
                         <NotificationDropdown />
                       )}
                       <button onClick={handleLogout} className="text-white">
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

