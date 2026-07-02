import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('seapedia_token')
    const storedUser = localStorage.getItem('seapedia_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('seapedia_token')
        localStorage.removeItem('seapedia_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (newToken, newUser) => {
    localStorage.setItem('seapedia_token', newToken)
    localStorage.setItem('seapedia_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('seapedia_token')
    localStorage.removeItem('seapedia_user')
    setToken(null)
    setUser(null)
  }

  const selectRole = (newToken, activeRole) => {
    const updatedUser = { ...user, active_role: activeRole }
    localStorage.setItem('seapedia_token', newToken)
    localStorage.setItem('seapedia_user', JSON.stringify(updatedUser))
    setToken(newToken)
    setUser(updatedUser)
  }

  const isAuthenticated = !!token && !!user
  const activeRole = user?.active_role || ''
  const hasRole = (role) => user?.roles?.includes(role) || false

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, selectRole,
      isAuthenticated, activeRole, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
