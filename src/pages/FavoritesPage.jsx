import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/productService'
import { subscribeCatalog } from '../services/mockStore.js'
import { useFavorites } from '../context/FavoritesContext'
import CardProductos from '../components/CardProductos'
import '../components/ProductList.css'
import './FavoritesPage.css'

function FavoritesPage() {
  const {
    favorites,
    status,
    error,
    isFavorite,
    toggleFavorite,
    busyProductIds,
    refreshFavorites,
    emptyFavorites,
  } = useFavorites()

  const [feedback, setFeedback] = useState('')
  const [products, setProducts] = useState([])
  const [clearing, setClearing] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [catalogStatus, setCatalogStatus] = useState('loading')
  useEffect(() => {
    let active = true
    setCatalogStatus('loading')
    const load = async () => {
      try {
        const data = await getProducts()
        if (active) { setProducts(data); setCatalogStatus('success') }
      } catch (error) {
        if (active) { setFeedback(error.message); setCatalogStatus('error') }
      }
    }
    load()
    const unsubscribe = subscribeCatalog(load)
    return () => { active = false; unsubscribe() }
  }, [reloadKey])
  const handleClear = async () => {
    setClearing(true)
    setFeedback('')
    try { await emptyFavorites(); setConfirmClear(false) }
    catch (error) { setFeedback(error.message) }
    finally { setClearing(false) }
  }


  const favoriteProducts = favorites
    .map((favorite) => products.find(
      (product) => product.id === favorite.productoId,
    ))
    .filter(Boolean)

  const handleToggleFavorite = async (productoId) => {
    setFeedback('')

    try {
      await toggleFavorite(productoId)
    } catch (requestError) {
      setFeedback(
        requestError.message || 'No se pudo actualizar la lista de favoritos.',
      )
    }
  }

  return (
    <section className="favorites-page">
      <header className="favorites-page__heading">
        <p className="favorites-page__eyebrow">Tu selección personal</p>
        <h1>Mis favoritos</h1>
        <p>Guardá las prendas que te gustan para encontrarlas más rápido.</p>
      </header>

      {feedback && (
        <p className="favorites-message" role="alert">
          {feedback}
        </p>
      )}

      {status === 'loading' && (
        <p className="favorites-message" role="status">
          Cargando tus favoritos…
        </p>
      )}

      {(status === 'error' || catalogStatus === 'error') && (
        <div className="favorites-empty">
          <h2>No pudimos cargar tus favoritos</h2>
          <p>{error}</p>
          <button
            type="button"
            className="favorites-action"
            onClick={() => { setReloadKey((key) => key + 1); refreshFavorites() }}
          >
            Volver a intentar
          </button>
        </div>
      )}

      {status === 'success' && catalogStatus === 'success' && favoriteProducts.length === 0 && (
        <div className="favorites-empty">
          <span className="favorites-empty__heart" aria-hidden="true">
            ♡
          </span>
          <h2>Todavía no guardaste prendas</h2>
          <p>
            Cuando encuentres algo que te guste, tocá el corazón
            para agregarlo a esta lista.
          </p>
          <Link className="favorites-action" to="/#productos">
            Explorar productos
          </Link>
        </div>
      )}

      {status === 'success' && favoriteProducts.length > 0 && (
        <>
          <div className="favorites-page__summary">
            {favoriteProducts.length}{' '}
            {favoriteProducts.length === 1 ? 'prenda guardada' : 'prendas guardadas'}
          </div>

          <button className="favorites-action" type="button" disabled={clearing || busyProductIds.length > 0} onClick={() => setConfirmClear(true)}>Vaciar favoritos</button>
          {confirmClear && <div role="group" aria-label="Confirmar vaciado">
            <p>¿Querés quitar todas las prendas de favoritos?</p>
            <button type="button" disabled={clearing} onClick={handleClear}>Confirmar</button>
            <button type="button" disabled={clearing} onClick={() => setConfirmClear(false)}>Cancelar</button>
          </div>}
          <div className="products-grid">
            {favoriteProducts.map((product) => (
              <CardProductos
                key={product.id}
                productoId={product.id}
                nombre={product.nombre}
                descripcion={product.descripcion}
                precio={product.precio}
                categoria={product.categoria}
                imagen={product.fotos?.find((photo) => photo.esPortada)?.url ?? product.fotos?.[0]?.url}
                detalleUrl={`/productos/${product.id}`}
                stock={product.stock}
                isFavorite={isFavorite(product.id)}
                favoriteBusy={clearing || busyProductIds.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default FavoritesPage
