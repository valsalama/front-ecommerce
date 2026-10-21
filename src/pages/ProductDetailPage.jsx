import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddToCartButton from '../components/carrito/AddToCartButton'
import FavoriteButton from '../components/FavoriteButton'
import ProductGallery from '../components/fotos/ProductGallery'
import { formatPrice } from '../components/carrito/formatPrice'
import ReviewsSection from '../components/resenias/ReviewsSection'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import { useAuth } from '../context/useAuth'
import { useFavorites } from '../context/FavoritesContext'
import { getProductById } from '../services/productService'
import '../components/productos/productos.css'

// Detalle: GET /api/productos/{id}. Integra la galería (Julian), el botón de
// carrito (Ian), el de favoritos (Nacho) y la sección de reseñas (Valu).
function ProductDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite, busyProductIds } = useFavorites()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [favoriteMessage, setFavoriteMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    getProductById(id, { signal: controller.signal })
      .then((data) => {
        setProduct(data)
        setStatus('success')
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus(requestError.status === 404 ? 'not-found' : 'error')
      })
    return () => controller.abort()
  }, [id])

  const handleFavorite = async () => {
    setFavoriteMessage('')
    if (!isAuthenticated) {
      setFavoriteMessage('Iniciá sesión para guardar prendas en favoritos.')
      return
    }
    try {
      await toggleFavorite(product.id)
    } catch (requestError) {
      setFavoriteMessage(requestError.message)
    }
  }

  if (status === 'loading') {
    return <section className="page-shell"><LoadingState label="Cargando prenda…" /></section>
  }

  if (status === 'not-found' || status === 'error') {
    return (
      <section className="page-shell">
        <div className="empty-state"><div className="empty-state__content">
          <h2>{status === 'not-found' ? 'No encontramos esta prenda' : 'No pudimos cargar la prenda'}</h2>
          <p>{error}</p>
          <Link className="button-link" to="/productos">Volver al catálogo</Link>
        </div></div>
      </section>
    )
  }

  const available = product.stock > 0

  return (
    <section className="page-shell product-detail" aria-labelledby="product-detail-title">
      <nav className="product-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> <span aria-hidden="true">/</span>{' '}
        <Link to="/productos">Catálogo</Link> <span aria-hidden="true">/</span>{' '}
        <Link to={`/productos?categoriaId=${product.categoriaId}`}>{product.categoria}</Link>
      </nav>

      <div className="product-detail__layout">
        <ProductGallery key={product.id} fotos={product.fotos} nombre={product.nombre} />

        <div className="product-detail__info">
          <p className="product-detail__category">{product.categoria}</p>
          <h1 id="product-detail-title">{product.nombre}</h1>
          <p className="product-detail__price">{formatPrice(product.precio)}</p>
          <p className={`product-detail__stock${available ? '' : ' is-unavailable'}`}>
            {available ? `${product.stock} ${product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}` : 'Sin stock'}
          </p>

          <div className="product-detail__actions">
            <AddToCartButton productoId={product.id} stock={product.stock} />
            <FavoriteButton
              active={isAuthenticated && isFavorite(product.id)}
              busy={busyProductIds.includes(product.id)}
              productName={product.nombre}
              onClick={handleFavorite}
            />
          </div>
          {favoriteMessage && (
            <FeedbackMessage type="info" title={favoriteMessage}>
              {!isAuthenticated && <Link to="/login">Ingresar</Link>}
            </FeedbackMessage>
          )}

          <div className="product-detail__description">
            <h2>Descripción</h2>
            <p>{product.descripcion}</p>
          </div>
          <dl className="product-detail__data">
            <div><dt>Código</dt><dd>#{product.id}</dd></div>
            <div><dt>Categoría</dt><dd>{product.categoria}</dd></div>
            <div><dt>Publicado por</dt><dd>{product.nombreUsuario}</dd></div>
          </dl>
        </div>
      </div>

      {/* Reseñas del producto (módulo de Valu) */}
      <ReviewsSection productoId={product.id} />
    </section>
  )
}

export default ProductDetailPage
