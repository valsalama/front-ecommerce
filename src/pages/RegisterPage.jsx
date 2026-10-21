import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/useAuth'
import './auth.css'

const initialForm = {
  nombre: '',
  apellido: '',
  nombreUsuario: '',
  mail: '',
  contrasenia: '',
}

function validate(form) {
  const errors = {}

  Object.entries(form).forEach(([field, value]) => {
    if (!value.trim()) errors[field] = 'Este campo es obligatorio'
  })

  if (form.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail)) {
    errors.mail = 'Ingresá un correo electrónico válido'
  }

  return errors
}

function RegisterPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [registeredUser, setRegisteredUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { isAuthenticated, register } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/mi-perfil" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    setRequestError('')

    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const response = await register(form)
      setRegisteredUser(response)
      setForm(initialForm)
    } catch (error) {
      setRequestError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (registeredUser) {
    return (
      <section className="auth-page auth-page--success" aria-labelledby="register-success-title">
        <div className="registration-success">
          <span className="registration-success__mark" aria-hidden="true">✓</span>
          <p className="auth-page__eyebrow">Registro completado</p>
          <h1 id="register-success-title">¡Bienvenido, {registeredUser.nombre}!</h1>
          <p>
            Creamos la cuenta <strong>@{registeredUser.nombreUsuario}</strong> para{' '}
            <strong>{registeredUser.mail}</strong>.
          </p>
          <Link className="button-link" to="/login">
            Ir al inicio de sesión
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-page__intro">
        <p className="auth-page__eyebrow">Sumate a Trama</p>
        <h1 id="register-title">Una cuenta, toda la colección.</h1>
        <p>
          Registrate para guardar tus prendas preferidas y agilizar tus próximas compras.
        </p>
        <ul className="registration-benefits">
          <li>Acceso a favoritos y carrito</li>
          <li>Historial de órdenes en un solo lugar</li>
          <li>Datos preparados para conectar con la API</li>
        </ul>
      </div>

      <div className="auth-card auth-card--wide">
        <div className="auth-card__heading">
          <p>Todos los campos son obligatorios</p>
          <h2>Crear cuenta</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {requestError && (
            <FeedbackMessage title="No pudimos crear la cuenta" type="error">
              {requestError}
            </FeedbackMessage>
          )}

          <div className="auth-form__row">
            <FormField
              id="register-name"
              name="nombre"
              label="Nombre"
              autoComplete="given-name"
              value={form.nombre}
              error={errors.nombre}
              onChange={handleChange}
            />
            <FormField
              id="register-lastname"
              name="apellido"
              label="Apellido"
              autoComplete="family-name"
              value={form.apellido}
              error={errors.apellido}
              onChange={handleChange}
            />
          </div>

          <FormField
            id="register-username"
            name="nombreUsuario"
            label="Nombre de usuario"
            placeholder="Cómo querés que te identifiquemos"
            autoComplete="username"
            value={form.nombreUsuario}
            error={errors.nombreUsuario}
            onChange={handleChange}
          />
          <FormField
            id="register-mail"
            name="mail"
            type="email"
            label="Correo electrónico"
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            value={form.mail}
            error={errors.mail}
            onChange={handleChange}
          />
          <FormField
            id="register-password"
            name="contrasenia"
            type="password"
            label="Contraseña"
            placeholder="Creá una contraseña"
            autoComplete="new-password"
            value={form.contrasenia}
            error={errors.contrasenia}
            onChange={handleChange}
          />

          <button className="primary-button auth-form__submit" type="submit" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </div>
    </section>
  )
}

export default RegisterPage
