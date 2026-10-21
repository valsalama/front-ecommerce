
import { useState } from 'react'
import { Link } from 'react-router-dom'
import productos from '../data/products.json'
import { useAuth } from '../context/useAuth'
import { useFavorites } from '../context/FavoritesContext'
import CardProductos from './CardProductos'
import './ProductList.css'

function ProductList() {
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite, busyProductIds } = useFavorites()
  const [feedback, setFeedback] = useState('')

  const handleToggleFavorite = async (productoId) => {
    setFeedback('')

    if (!isAuthenticated) {
      setFeedback('Iniciá sesión para guardar prendas en favoritos.')
      return
    }

    try {
      await toggleFavorite(productoId)
    } catch (error) {
      setFeedback(error.message || 'No se pudo actualizar el favorito.')
    }
  }

  return (
    <section
      className="product-list"
      id="productos"
      aria-labelledby="product-list-title"
    >
      <div className="product-list__heading">
        <div>
          <p className="product-list__eyebrow">Selección de temporada</p>
          <h2 id="product-list-title">Nuestros productos</h2>
        </div>

        <p>{productos.length} prendas</p>
      </div>

      {feedback && (
        <p className="favorites-feedback" role="status">
          {feedback}{' '}
          {!isAuthenticated && <Link to="/login">Ingresar</Link>}
        </p>
      )}

      <div className="products-grid">
        {productos.map((producto) => (
          <CardProductos
            key={producto.id}
            productoId={producto.id}
            nombre={producto.nombre}
            descripcion={producto.descripcion}
            precio={producto.precio}
            categoria={producto.categoria}
            imagen={producto.imagen}
            stock={producto.stock}
            isFavorite={isAuthenticated && isFavorite(producto.id)}
            favoriteBusy={busyProductIds.includes(producto.id)}
            onToggleFavorite={handleToggleFavorite}
          >
            {producto.entregaGratis && (
              <span className="product-badge product-badge--shipping">
                Entrega gratis
              </span>
            )}

            {producto.compraInternacional && (
              <span className="product-badge product-badge--international">
                Compra internacional
              </span>
            )}
          </CardProductos>
        ))}
      </div>
    </section>
  )
}

export default ProductList
