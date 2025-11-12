import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#123F6D] to-[#0d2f4f] dark:from-[#123F6D] dark:to-[#ED145B] text-white py-8 mt-12 transition-colors">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Inova Cine</h3>
            <p className="text-gray-400 dark:text-gray-300">
              Plataforma de cursos online para aprender e crescer profissionalmente.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-400 dark:text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/cursos" className="hover:text-white transition-colors">
                  Cursos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <p className="text-gray-400 dark:text-gray-300">
              Email: contato@inovacine.com
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-8 text-center text-gray-400 dark:text-gray-300">
          <p>&copy; 2024 Inova Cine. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

