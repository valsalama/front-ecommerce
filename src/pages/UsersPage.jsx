import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { getUsers } from '../services/userService'
import './users.css'

const getInitials = (user) => `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()

function UsersPage() {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState('data')

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      setStatus('loading')
      setError('')

      try {
        const data = await getUsers({ mode: viewMode, signal: controller.signal })
        setUsers(data)
        setStatus('success')
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('error')
      }
    }

    loadUsers()
    return () => controller.abort()
  }, [viewMode])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return users

    return users.filter((user) =>
      [user.nombre, user.apellido, user.nombreUsuario, user.mail]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [query, users])

  return (
    <section className="page-shell" aria-labelledby="users-title">
      <PageHeading
        eyebrow="Administración"
        title="Usuarios"
        description="Consultá las cuentas registradas y accedé al detalle de cada usuario. Los datos se cargan desde el mismo formato que devuelve la API."
      >
        <Link className="button-link button-link--secondary" to="/mi-perfil">
          Ver mi perfil
        </Link>
      </PageHeading>

      <div className="users-toolbar">
        <label className="search-control" htmlFor="user-search">
          <span>Buscar usuario</span>
          <input
            className="search-field"
            id="user-search"
            type="search"
            placeholder="Nombre, usuario o correo…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <details className="demo-state-control">
          <summary>Probar estados de la interfaz</summary>
          <label htmlFor="view-mode">
            Respuesta simulada
            <select
              className="state-select"
              id="view-mode"
              value={viewMode}
              onChange={(event) => setViewMode(event.target.value)}
            >
              <option value="data">Con datos</option>
              <option value="empty">Lista vacía</option>
              <option value="error">Error del servidor</option>
            </select>
          </label>
        </details>
      </div>

      {status === 'loading' && <LoadingState label="Cargando usuarios…" />}

      {status === 'error' && (
        <div className="users-message">
          <FeedbackMessage title="No pudimos cargar los usuarios" type="error">
            {error}
          </FeedbackMessage>
          <button className="secondary-button" type="button" onClick={() => setViewMode('data')}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && filteredUsers.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__content">
            <h2>{users.length === 0 ? 'Todavía no hay usuarios' : 'Sin coincidencias'}</h2>
            <p>
              {users.length === 0
                ? 'Cuando se registren nuevas cuentas aparecerán en este listado.'
                : 'Probá con otro nombre, usuario o correo electrónico.'}
            </p>
            {query && (
              <button className="secondary-button" type="button" onClick={() => setQuery('')}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'success' && filteredUsers.length > 0 && (
        <>
          <p className="users-count" aria-live="polite">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
          </p>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Nombre completo</th>
                  <th scope="col">Correo</th>
                  <th scope="col"><span className="visually-hidden">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Usuario">
                      <div className="user-identity">
                        <span className="user-avatar" aria-hidden="true">{getInitials(user)}</span>
                        <strong>@{user.nombreUsuario}</strong>
                      </div>
                    </td>
                    <td data-label="Nombre">{user.nombre} {user.apellido}</td>
                    <td data-label="Correo">{user.mail}</td>
                    <td className="users-table__action">
                      <Link to={`/usuarios/${user.id}`} aria-label={`Ver perfil de ${user.nombre} ${user.apellido}`}>
                        Ver perfil <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default UsersPage
