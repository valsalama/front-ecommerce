import { useEffect, useState } from 'react'
import ButtonLink from './ui/ButtonLink'
import FeedbackMessage from './ui/FeedbackMessage'
import LoadingState from './ui/LoadingState'
import ProductGrid from './productos/ProductGrid'
import { getProducts } from '../services/productService'
import './ProductList.css'

// Destacados del inicio: GET /api/productos?conStock=true (primeras prendas
// disponibles). Reutiliza la misma grilla y tarjeta que el catálogo.
function ProductList({ limit = 6 }) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getProducts({ conStock: true, signal: controller.signal })
      .then((items) => {
        setProducts(items.slice(0, limit))
        setStatus('success')
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('error')
      })
    return () => controller.abort()
  }, [limit])

  return (
    <section className="product-list" id="productos" aria-labelledby="product-list-title">
      <div className="product-list__heading">
        <div>
          <p className="product-list__eyebrow">Selección de temporada</p>
          <h2 id="product-list-title">Prendas destacadas</h2>
        </div>
        <ButtonLink to="/productos" secondary>Ver todo el catálogo</ButtonLink>
      </div>

      {status === 'loading' && <LoadingState label="Cargando prendas…" />}
      {status === 'error' && (
        <FeedbackMessage type="error" title="No pudimos mostrar los destacados">{error}</FeedbackMessage>
      )}
      {status === 'success' && products.length === 0 && (
        <div className="empty-state"><div className="empty-state__content">
          <h2>No hay prendas disponibles</h2>
          <p>Volvé pronto: estamos reponiendo la colección.</p>
        </div></div>
      )}
      {status === 'success' && products.length > 0 && <ProductGrid products={products} />}
    </section>
  )
}

export default ProductList
