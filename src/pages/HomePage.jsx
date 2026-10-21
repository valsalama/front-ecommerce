import ProductList from '../components/ProductList'
import ButtonLink from '../components/ui/ButtonLink'
import { useAuth } from '../context/useAuth'

function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <>
      <section className="catalog-hero" aria-labelledby="home-title">
        <div className="catalog-hero__content">
          <p className="catalog-eyebrow">Nueva colección · Primavera / Verano</p>
          <h1 id="home-title">
            {isAuthenticated ? `Hola, ${user.nombre}.` : 'Prendas para todos tus días.'}
          </h1>
          <p className="catalog-intro">
            Básicos de calidad, siluetas cómodas y una selección pensada para
            acompañarte temporada tras temporada.
          </p>
          <div className="hero-actions">
            <ButtonLink to="/productos">Ver colección</ButtonLink>
            {!isAuthenticated && (
              <ButtonLink to="/registro" secondary>
                Crear una cuenta
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      <ProductList />
    </>
  )
}

export default HomePage
