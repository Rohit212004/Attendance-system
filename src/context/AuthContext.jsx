import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

// Get teacher credentials from environment variables
const TEACHER_EMAIL = import.meta.env.VITE_TEACHER_EMAIL
const TEACHER_PASSWORD = import.meta.env.VITE_TEACHER_PASSWORD

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const AUTH_STORAGE_KEY = 'teacherAuth'

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
        sessionStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  // Login function - Local authentication only
  const login = async (email, password, rememberMe = false) => {
    return new Promise((resolve, reject) => {
      // Validate credentials against environment variables
      if (email === TEACHER_EMAIL && password === TEACHER_PASSWORD) {
        const teacherUser = {
          email: email,
          uid: 'local-teacher',
          displayName: 'Teacher',
          isLocalAuth: true
        }
        
        // Store in state and either localStorage (remember) or sessionStorage (current tab session)
        setCurrentUser(teacherUser)
        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(teacherUser))
          sessionStorage.removeItem(AUTH_STORAGE_KEY)
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(teacherUser))
          localStorage.removeItem(AUTH_STORAGE_KEY)
        }
        resolve(teacherUser)
      } else {
        reject(new Error('Invalid credentials. Only authorized teachers can access this portal.'))
      }
    })
  }

  // Logout function
  const logout = () => {
    return new Promise((resolve) => {
      setCurrentUser(null)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      resolve()
    })
  }

  const value = {
    currentUser,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
