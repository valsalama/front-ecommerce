import { useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../services/authService'
import { AuthContext } from './auth-context'

const SESSION_KEY = 'trama-demo-session'
function readStoredSession() {
  try {
    const storedSession = window.localStorage.getItem(SESSION_KEY)
    return storedSession ? JSON.parse(storedSession) : null
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)

  const login = async (credentials) => {
    const nextSession = await loginRequest(credentials)
    setSession(nextSession)
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    return nextSession
  }

  const register = (data) => registerRequest(data)

  const logout = () => {
    setSession(null)
    window.localStorage.removeItem(SESSION_KEY)
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.response?.usuario ?? null,
      access: session?.access ?? null,
      isAuthenticated: Boolean(session),
      login,
      register,
      logout,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
