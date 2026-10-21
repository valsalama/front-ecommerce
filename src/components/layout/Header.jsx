import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import CartLink from '../carrito/CartLink'

const getNavClass = ({ isActive }) => (isActive ? 'active' : undefined)

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { access, isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = (
    <>
      <NavLink to="/" end className={getNavClass}>
        Inicio
      </NavLink>
      <Link to="/#productos">Productos</Link>
      {access === 'ADMIN' && (
        <NavLink to="/usuarios" className={getNavClass}>
          Usuarios
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink to="/mi-perfil" className={getNavClass}>
          Mi perfil
        </NavLink>
      )}
      {isAuthenticated && <CartLink />}
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
              <span className="visually-hidden">Sesión de {user.nombre}</span>
              <button className="session-button" type="button" onClick={handleLogout}>
                Cerrar sesión
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
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
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
