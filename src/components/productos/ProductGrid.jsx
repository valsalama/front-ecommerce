import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useFavorites } from '../../context/FavoritesContext'
import { getCoverUrl } from '../../services/productService'
import CardProductos from '../CardProductos'
import '../ProductList.css'

// Grilla reutilizable de ProductoRespuestaDTO: inicio, catálogo y favoritos.
// Cada tarjeta lleva al detalle y suma el botón de favoritos (Nacho)
// y el de carrito (Ian).
function ProductGrid({ products }) {
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
    <>
      {feedback && (
        <p className="favorites-feedback" role="status">
          {feedback} {!isAuthenticated && <Link to="/login">Ingresar</Link>}
        </p>
      )}
      <div className="products-grid">
        {products.map((producto) => (
          <CardProductos
            key={producto.id}
            productoId={producto.id}
            nombre={producto.nombre}
            descripcion={producto.descripcion}
            precio={producto.precio}
            categoria={producto.categoria}
            imagen={getCoverUrl(producto)}
            stock={producto.stock}
            detalleUrl={`/productos/${producto.id}`}
            isFavorite={isAuthenticated && isFavorite(producto.id)}
            favoriteBusy={busyProductIds.includes(producto.id)}
            onToggleFavorite={handleToggleFavorite}
          >
            {producto.stock > 0 && producto.stock <= 3 && (
              <span className="product-badge product-badge--international">
                Últimas unidades
              </span>
            )}
          </CardProductos>
        ))}
      </div>
    </>
  )
}

export default ProductGrid
