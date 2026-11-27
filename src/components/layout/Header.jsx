import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import CartLink from '../carrito/CartLink'

const getNavClass = ({ isActive }) => (isActive ? 'active' : undefined)

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const { access, isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    setLogoutError('')

    try {
      await logout()
      setMenuOpen(false)
      navigate('/')
    } catch {
      setLogoutError('No se pudo cerrar la sesión. Intentá nuevamente.')
    } finally {
      setLoggingOut(false)
    }
  }

  const navigation = (
    <>
      <NavLink to="/" end className={getNavClass}>
        Inicio
      </NavLink>

      <NavLink to="/productos" className={getNavClass}>
        Productos
      </NavLink>

      {access === 'ADMIN' && (
        <>
          <NavLink to="/usuarios" className={getNavClass}>
            Usuarios
          </NavLink>
          <NavLink to="/categorias" className={getNavClass}>
            Categorías
          </NavLink>
          <NavLink to="/admin/productos" className={getNavClass}>
            Inventario
          </NavLink>
        </>
      )}

      {isAuthenticated && (
        <NavLink to="/mi-perfil" className={getNavClass}>
          Mi perfil
        </NavLink>
      )}

      {isAuthenticated && <CartLink />}

      {isAuthenticated && (
        <NavLink to="/ordenes" className={getNavClass}>
          Mis órdenes
        </NavLink>
      )}

      {isAuthenticated && (
        <NavLink to="/favoritos" className={getNavClass}>
          Favoritos
        </NavLink>
      )}
    </>
  )

  return (
    <>
      <header className="app-header">
        <Link className="brand" to="/" aria-label="Ir al inicio de Trama">
          TRAMA
        </Link>

        <nav className="main-navigation" aria-label="Navegación principal">
          {navigation}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="visually-hidden">
                Sesión de {user?.nombre}
              </span>
              <button
                className="session-button"
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
            </>
          ) : (
            <>
              <NavLink className="header-link" to="/login">
                Ingresar
              </NavLink>
              <NavLink className="session-button" to="/registro">
                Crear cuenta
              </NavLink>
            </>
          )}
        </div>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
      </header>

      {logoutError && (
        <p role="alert">{logoutError}</p>
      )}

      {menuOpen && (
        <nav
          className="mobile-navigation"
          id="mobile-navigation"
          aria-label="Navegación móvil"
          onClick={(event) => {
            if (event.target.closest('a')) setMenuOpen(false)
          }}
        >
          {navigation}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          ) : (
            <>
              <NavLink to="/login">Ingresar</NavLink>
              <NavLink to="/registro">Crear cuenta</NavLink>
            </>
          )}
        </nav>
      )}
    </>
  )
}

export default Header