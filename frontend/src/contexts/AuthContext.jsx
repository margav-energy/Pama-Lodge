import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'

// Set axios base URL
axios.defaults.baseURL = API_BASE_URL

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/users/me/')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login/', {
        username,
        password,
      })
      const { access, refresh } = response.data
      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)
      setToken(access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      await fetchUser()
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      return {
        success: false,
        error: error.response?.data?.detail || 
               error.response?.data?.error || 
               error.response?.data?.message ||
               error.message || 
               'Login failed. Please check your credentials.',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isManager: user?.role === 'manager',
    isReceptionist: user?.role === 'receptionist',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

