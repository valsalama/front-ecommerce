import ButtonLink from '../components/ui/ButtonLink'

function NotFoundPage() {
  return (
    <section className="page-shell">
      <div className="empty-state">
        <div className="empty-state__content">
          <p className="page-heading__eyebrow">Error 404</p>
          <h2>No encontramos esta página</h2>
          <p>La dirección puede haber cambiado o el contenido ya no está disponible.</p>
          <ButtonLink to="/">Volver al inicio</ButtonLink>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
