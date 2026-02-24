import { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/profile')
      setUser(data)
    } catch (error) {
      console.error('Failed to fetch user', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password, role = 'user') => {
  const { data } = await api.post('/auth/register', { name, email, password, role })
  localStorage.setItem('token', data.token)
  setToken(data.token)
  setUser(data.user)
  return data
 }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const value = {
  user,
  loading,
  login,
  register,
  logout,
  isAuthenticated: !!user,
  isAdmin: user?.role === 'admin',
}

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}