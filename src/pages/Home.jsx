import { Link } from 'react-router-dom'
import { Calendar, Users } from 'lucide-react'

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero Section */}
      <div className="text-center mb-16 sm:mb-24">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          Attendance System
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 sm:mb-12 max-w-2xl mx-auto">
          Simple lecture-wise attendance tracking for teachers and students
        </p>
        <Link 
          to="/attendance" 
          className="inline-block bg-blue-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          View Attendance
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
        <Link to="/attendance" className="card hover:shadow-lg transition-shadow p-6 sm:p-8 text-center">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Student View
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Check attendance records
          </p>
        </Link>

        <Link to="/login" className="card hover:shadow-lg transition-shadow p-6 sm:p-8 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Teacher Login
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Manage attendance
          </p>
        </Link>
      </div>
    </div>
  )
}

export default Home
