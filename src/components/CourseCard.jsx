import { Link } from 'react-router-dom'

export default function CourseCard({ course }) {
  return (
    <Link to={`/curso/${course.id}`} className="block group">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
        <div className="relative h-48 bg-gradient-to-br from-[#123F6D] via-[#0d2f4f] to-[#ED145B] overflow-hidden">
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
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#ED145B] to-[#b71646] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          {course.category || 'Curso'}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-primary-900 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm">{course.lessonsCount || 0} aulas</span>
        </div>
      </div>
      </div>
    </Link>
  )
}

