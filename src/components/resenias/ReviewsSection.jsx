import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import {
  createReview,
  getAverageByProduct,
  getReviewsByProduct,
} from '../../services/reseniaService'
import { getUsers } from '../../services/userService'
import ButtonLink from '../ui/ButtonLink'
import FeedbackMessage from '../ui/FeedbackMessage'
import LoadingState from '../ui/LoadingState'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import ReviewSummary from './ReviewSummary'
import './resenias.css'

// Componente reutilizable: recibe el id del producto y se encarga de todo lo
// demás. Se puede colocar en cualquier pantalla, por ejemplo en el detalle.
function ReviewsSection({ productoId }) {
  const { isAuthenticated, user } = useAuth()
  const [mode, setMode] = useState('data')
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState({
    status: 'loading',
    reviews: [],
    average: 0,
    authors: {},
    error: '',
  })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function loadReviews() {
      setState((current) => ({
        ...current,
        status: current.status === 'success' ? 'success' : 'loading',
        error: '',
      }))

      try {
        const [reviews, average, users] = await Promise.all([
          getReviewsByProduct(productoId, { mode, signal }),
          getAverageByProduct(productoId, { mode, signal }),
          getUsers({ signal }),
        ])
        const authors = Object.fromEntries(
          users.map((author) => [author.id, `${author.nombre} ${author.apellido}`]),
        )

        setState({ status: 'success', reviews, average, authors, error: '' })
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setState((current) => ({
          ...current,
          status: 'error',
          error: requestError.message,
        }))
      }
    }

    loadReviews()
    return () => controller.abort()
  }, [productoId, mode, reloadKey])

  const handleSubmit = async ({ calificacion, comentario }) => {
    await createReview({
      // En el modo de prueba se envía una calificación fuera de rango para
      // mostrar el error de validación que devuelve el backend.
      calificacion: mode === 'invalid-rating' ? 0 : calificacion,
      comentario,
      productoId: Number(productoId),
      usuarioId: user.id,
    })
    setReloadKey((current) => current + 1)
  }

  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews__heading">
        <h2 id="reviews-title">Reseñas</h2>

        <details className="reviews-demo">
          <summary>Probar estados de la interfaz</summary>
          <label htmlFor="reviews-demo-state">
            Estado
            <select
              id="reviews-demo-state"
              className="state-select"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="data">Datos de la API simulada</option>
              <option value="empty">Producto sin reseñas</option>
              <option value="error">Error del servidor</option>
              <option value="invalid-rating">Enviar calificación inválida</option>
            </select>
          </label>
        </details>
      </div>

      <div className="reviews__layout">
        <div className="reviews__main">
          {state.status === 'loading' && <LoadingState label="Cargando reseñas…" />}

          {state.status === 'error' && (
            <div className="reviews__error">
              <FeedbackMessage title="No pudimos cargar las reseñas" type="error">
                {state.error}
              </FeedbackMessage>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {state.status === 'success' && (
            <>
              <ReviewSummary average={state.average} total={state.reviews.length} />
              <ReviewList
                reviews={state.reviews}
                authors={state.authors}
                currentUserId={user?.id}
              />
            </>
          )}
        </div>

        <aside className="reviews__aside" aria-label="Escribir una reseña">
          {isAuthenticated ? (
            <ReviewForm onSubmit={handleSubmit} />
          ) : (
            <div className="reviews__login">
              <h3>Dejá tu reseña</h3>
              <FeedbackMessage title="Necesitás iniciar sesión" type="info">
                Ingresá a tu cuenta para calificar esta prenda.
              </FeedbackMessage>
              <ButtonLink to="/login">Ingresar</ButtonLink>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default ReviewsSection
