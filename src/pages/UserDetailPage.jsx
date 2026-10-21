import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { getUserById } from '../services/userService'
import './users.css'

function UserDetailPage({ ownProfile = false }) {
  const { id } = useParams()
  const { access, user: sessionUser } = useAuth()
  const requestedId = ownProfile ? sessionUser.id : id
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadUser() {
      setStatus('loading')
      setError('')

      try {
        if (ownProfile) {
          setUser(sessionUser)
        } else {
          setUser(await getUserById(requestedId, { signal: controller.signal }))
        }
        setStatus('success')
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('error')
      }
    }

    loadUser()
    return () => controller.abort()
  }, [ownProfile, requestedId, sessionUser])

  return (
    <section className="page-shell" aria-labelledby="profile-title">
      <PageHeading
        eyebrow={ownProfile ? 'Mi cuenta' : 'Detalle de usuario'}
        title={ownProfile ? 'Mi perfil' : 'Perfil'}
        description="Información personal devuelta por UsuarioRespuestaDTO. La contraseña nunca se expone en esta vista."
      >
        {access === 'ADMIN' && (
          <Link className="button-link button-link--secondary" to="/usuarios">
            Volver al listado
          </Link>
        )}
      </PageHeading>

      {status === 'loading' && <LoadingState label="Cargando perfil…" />}

      {status === 'error' && (
        <div className="users-message">
          <FeedbackMessage title="No pudimos encontrar el usuario" type="error">
            {error}
          </FeedbackMessage>
          <Link className="button-link button-link--secondary" to="/usuarios">
            Volver al listado
          </Link>
        </div>
      )}

      {status === 'success' && user && (
        <article className="profile-card">
          <div className="profile-card__cover" aria-hidden="true" />
          <div className="profile-card__body">
            <div className="profile-card__avatar" aria-hidden="true">
              {user.nombre[0]}{user.apellido[0]}
            </div>
            <div className="profile-card__identity">
              <span className="profile-card__status">Cuenta activa</span>
              <h2>{user.nombre} {user.apellido}</h2>
              <p>@{user.nombreUsuario}</p>
            </div>

            <dl className="profile-data">
              <div>
                <dt>ID de usuario</dt>
                <dd>#{user.id}</dd>
              </div>
              <div>
                <dt>Nombre</dt>
                <dd>{user.nombre}</dd>
              </div>
              <div>
                <dt>Apellido</dt>
                <dd>{user.apellido}</dd>
              </div>
              <div>
                <dt>Correo electrónico</dt>
                <dd><a href={`mailto:${user.mail}`}>{user.mail}</a></dd>
              </div>
            </dl>

            <FeedbackMessage title="Privacidad protegida" type="info">
              Esta respuesta no incluye la contraseña ni datos sensibles del usuario.
            </FeedbackMessage>
          </div>
        </article>
      )}
    </section>
  )
}

export default UserDetailPage
