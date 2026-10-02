import ProductList from './components/ProductList'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <a className="brand" href="#inicio" aria-label="Inicio de Trama">
          TRAMA
        </a>

        <nav className="main-navigation" aria-label="Navegación principal">
          <a href="#novedades">Novedades</a>
          <a href="#productos">Productos</a>
          <a href="#nosotros">Nosotros</a>
        </nav>

        <a className="cart-link" href="#carrito" aria-label="Ver carrito">
          Carrito <span aria-hidden="true">(0)</span>
        </a>
      </header>

      <main id="inicio">
        <section className="catalog-hero" id="novedades">
          <p className="catalog-eyebrow">Nueva colección · Primavera / Verano</p>
          <h1>Prendas para todos tus días.</h1>
          <p className="catalog-intro">
            Básicos de calidad, siluetas cómodas y una selección pensada para
            acompañarte temporada tras temporada.
          </p>
        </section>

        <ProductList />
      </main>

      <footer className="app-footer" id="nosotros">
        <span>TRAMA · Indumentaria contemporánea</span>
        <span>Envíos a todo el país</span>
      </footer>
    </div>
  )
}

export default App
