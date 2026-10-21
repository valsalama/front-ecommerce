import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReviewsSection from '../components/resenias/ReviewsSection'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { getProductById } from '../services/productService'

function ProductReviewsPage() {
  const { productoId } = useParams()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProduct() {
      setStatus('loading')
      setError('')

      try {
        setProduct(await getProductById(productoId, { signal: controller.signal }))
        setStatus('success')
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('error')
      }
    }

    loadProduct()
    return () => controller.abort()
  }, [productoId])

  return (
    <section className="page-shell" aria-labelledby="product-reviews-title">
      {status === 'loading' && <LoadingState label="Cargando producto…" />}

      {status === 'error' && (
        <div className="reviews__error">
          <FeedbackMessage title="No pudimos encontrar el producto" type="error">
            {error}
          </FeedbackMessage>
          <Link className="button-link button-link--secondary" to="/#productos">
            Volver al catálogo
          </Link>
        </div>
      )}

      {status === 'success' && product && (
        <>
          <PageHeading
            eyebrow={product.categoria}
            title={product.nombre}
            description={product.descripcion}
          >
            <Link className="button-link button-link--secondary" to="/#productos">
              Volver al catálogo
            </Link>
          </PageHeading>

          <ReviewsSection productoId={product.id} />
        </>
      )}
    </section>
  )
}

export default ProductReviewsPage
