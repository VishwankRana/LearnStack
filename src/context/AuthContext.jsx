import { useEffect, useState } from 'react'
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../features/auth/api/authApi'
import { AuthContext } from './auth-context'
const AUTH_TOKEN_KEY = 'mindvault.auth.token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      if (!token) {
        if (isMounted) {
          setUser(null)
          setIsBootstrapping(false)
        }

        return
      }

      try {
        const data = await fetchCurrentUser(token)

        if (isMounted) {
          setUser(data.user)
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY)

        if (isMounted) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [token])

  async function register(credentials) {
    const data = await registerUser(credentials)
    persistSession(data)
    return data.user
  }

  async function login(credentials) {
    const data = await loginUser(credentials)
    persistSession(data)
    return data.user
  }

  async function logout() {
    try {
      if (token) {
        await logoutUser(token)
      }
    } finally {
      clearSession()
    }
  }

  function persistSession(data) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    setIsBootstrapping(false)
  }

  function clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
    setIsBootstrapping(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token && user),
        isBootstrapping,
        login,
        logout,
        register,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
