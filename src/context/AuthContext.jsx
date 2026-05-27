/* eslint-disable react-refresh/only-export-components -- context + hook pattern */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'travel_jwt'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
    setAuthToken(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setAuthToken(null)
      setUser(null)
      setLoading(false)
      return
    }
    setAuthToken(token)
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/auth/me')
        if (!cancelled) setUser(data.user)
      } catch {
        if (!cancelled) logout()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, logout])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setAuthToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setAuthToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
