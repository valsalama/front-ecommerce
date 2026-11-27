import { useEffect, useState } from 'react'
import {
  getSession,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../services/authService'
import { AuthContext } from './auth-context'
import LoadingState from '../components/ui/LoadingState'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    // Elimina los datos de la autenticación simulada anterior.
    try {
      window.localStorage.removeItem('trama-demo-session')
    } catch {
      // La autenticación real no depende de localStorage.
    }

    async function restoreSession() {
      setLoading(true)
      setError('')

      try {
        const restoredSession = await getSession({
          signal: controller.signal,
        })

        controller.signal.throwIfAborted()
        setSession(restoredSession)
      } catch (requestError) {
        if (controller.signal.aborted) return

        setSession(null)
        setError(
          'No pudimos comprobar la sesión. Verificá que el backend esté ejecutándose.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => controller.abort()
  }, [retryKey])

  const login = async (credentials) => {
    const nextSession = await loginRequest(credentials)
    setSession(nextSession)
    return nextSession
  }

  const register = (data) => registerRequest(data)

  const logout = async () => {
    // Solo limpia el estado cuando el backend confirma el cierre.
    await logoutRequest()
    setSession(null)
  }

  const value = {
    session,
    user: session?.response?.usuario ?? null,
    access: session?.access ?? null,
    isAuthenticated: Boolean(session),
    login,
    register,
    logout,
  }

  if (loading) {
    return <LoadingState label="Comprobando sesión…" />
  }

  if (error) {
    return (
      <section role="alert">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => setRetryKey((current) => current + 1)}
        >
          Reintentar
        </button>
      </section>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}