import { Link } from 'react-router-dom'

export default function CourseCardWithCancel({ course, onCancel }) {
  return (
    <div className="card group">
      <Link to={`/curso/${course.id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-primary-900 to-primary-800 overflow-hidden">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{course.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-primary-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {course.category || 'Curso'}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-900 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center space-x-2 text-gray-500 mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm">{course.lessonsCount || 0} aulas</span>
          </div>
        </div>
      </Link>
      <div className="px-6 pb-6">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onCancel) onCancel()
          }}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200"
          style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
          title="Cancelar inscrição"
        >
          Cancelar Curso
        </button>
      </div>
    </div>
  )
}

