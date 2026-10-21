import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/useAuth'
import { DEMO_ACCOUNTS } from '../services/authService'
import './auth.css'

function LoginPage() {
  const [form, setForm] = useState({ mail: '', contrasenia: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { access, isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to={access === 'ADMIN' ? '/usuarios' : '/mi-perfil'} replace />
  }

  const fillDemoAccount = (account) => {
    setForm({ mail: account.mail, contrasenia: account.contrasenia })
    setError('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const nextSession = await login(form)
      const requestedPath = location.state?.from?.pathname
      navigate(requestedPath || (nextSession.access === 'ADMIN' ? '/usuarios' : '/mi-perfil'), {
        replace: true,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <div className="auth-page__intro">
        <p className="auth-page__eyebrow">Tu cuenta</p>
        <h1 id="login-title">Volvé a encontrar tus favoritos.</h1>
        <p>
          Ingresá para consultar tu perfil y continuar recorriendo la tienda.
          En esta entrega la sesión se simula con datos locales.
        </p>

        <div className="demo-accounts" aria-label="Cuentas de demostración">
          <p>Probá una cuenta</p>
          {Object.values(DEMO_ACCOUNTS).map((account) => (
            <button key={account.mail} type="button" onClick={() => fillDemoAccount(account)}>
              <strong>{account.label}</strong>
              <span>{account.mail}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card__heading">
          <p>Paso 1 de 1</p>
          <h2>Iniciar sesión</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <FeedbackMessage title="No pudimos iniciar sesión" type="error">
              {error}
            </FeedbackMessage>
          )}

          <FormField
            id="login-mail"
            name="mail"
            type="email"
            label="Correo electrónico"
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            value={form.mail}
            onChange={handleChange}
            required
          />
          <FormField
            id="login-password"
            name="contrasenia"
            type="password"
            label="Contraseña"
            placeholder="Ingresá tu contraseña"
            autoComplete="current-password"
            value={form.contrasenia}
            onChange={handleChange}
            required
          />

          <button className="primary-button auth-form__submit" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
