import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider as MTThemeProvider } from '@material-tailwind/react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { AlertProvider } from './contexts/AlertContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import CourseContent from './pages/CourseContent'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <ThemeProvider>
      <MTThemeProvider>
        <AlertProvider>
          <AuthProvider>
            <Router>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cursos" element={<Courses />} />
              <Route path="/curso/:id" element={<CourseDetail />} />
              <Route path="/curso/:courseId/aula/:lessonIndex" element={<CourseContent />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
          </AuthProvider>
        </AlertProvider>
      </MTThemeProvider>
    </ThemeProvider>
  )
}

export default App

