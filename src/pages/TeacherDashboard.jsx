import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar } from 'lucide-react'

const TeacherDashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Welcome Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">{currentUser?.email}</p>
      </div>

      {/* Main Action Card */}
      <div className="card hover:shadow-lg transition-shadow text-center p-8 sm:p-12">
        <div className="bg-blue-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Manage Attendance</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Upload students, create lecture sessions, and mark attendance
        </p>
        <button
          onClick={() => navigate('/teacher/attendance')}
          className="btn-primary px-8 py-3 text-base sm:text-lg shadow-lg hover:shadow-xl"
        >
          Open Attendance
        </button>
      </div>
    </div>
  )
}

export default TeacherDashboard
