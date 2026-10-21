import ButtonLink from '../components/ui/ButtonLink'
import { useAuth } from '../context/useAuth'

function AccessDeniedPage() {
  const { user } = useAuth()

  return (
    <section className="page-shell">
      <div className="empty-state">
        <div className="empty-state__content">
          <p className="page-heading__eyebrow">Acceso restringido</p>
          <h2>Esta sección es administrativa</h2>
          <p>
            {user?.nombre}, tu sesión es de usuario. Podés seguir navegando por la tienda o consultar tu perfil.
          </p>
          <ButtonLink to="/mi-perfil">Ir a mi perfil</ButtonLink>
        </div>
      </div>
    </section>
  )
}

export default AccessDeniedPage
