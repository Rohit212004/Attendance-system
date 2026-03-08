import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import AttendanceManagement from './pages/AttendanceManagement'
import PublicAttendance from './pages/PublicAttendance'

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return currentUser ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/attendance" element={<PublicAttendance />} />

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute>
              <AttendanceManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}

export default App
