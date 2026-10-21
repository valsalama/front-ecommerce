import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PhotoManager from '../components/fotos/PhotoManager'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { getPhotoProduct } from '../services/photoService'

function ProductPhotosPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', product: null, error: '' })

  useEffect(() => {
    const controller = new AbortController()
    getPhotoProduct(id, { signal: controller.signal })
      .then((product) => setState({ status: 'success', product, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', product: null, error: error.message })
      })
    return () => controller.abort()
  }, [id])

  return (
    <section className="page-shell product-photos-page" aria-labelledby="photos-title">
      {state.status === 'loading' && <LoadingState label="Cargando producto…" />}
      {state.status === 'error' && (
        <>
          <FeedbackMessage type="error" title="No pudimos encontrar el producto">{state.error}</FeedbackMessage>
          <Link className="button-link button-link--secondary" to="/admin/productos">Volver al listado</Link>
        </>
      )}
      {state.status === 'success' && (
        <>
          <PageHeading eyebrow={`Administración · ${state.product.nombre}`} title="Fotos del producto" description="Consultá, agregá, elegí la portada y eliminá las fotos de esta prenda.">
            <Link className="button-link button-link--secondary" to="/admin/productos">Volver al listado</Link>
            <Link className="button-link button-link--secondary" to={`/productos/${state.product.id}`}>Ver en el catálogo</Link>
          </PageHeading>
          <PhotoManager productoId={state.product.id} usuarioId={user.id} />
        </>
      )}
    </section>
  )
}

export default ProductPhotosPage
