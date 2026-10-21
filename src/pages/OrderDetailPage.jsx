import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import OrderSummaryItem from '../components/ordenes/OrderSummaryItem'
import '../components/ordenes/ordenes.css'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { formatPrice } from '../components/carrito/formatPrice'
import { getOrderById } from '../services/orderService'

function OrderDetailPage() {
  const { user } = useAuth()
  const { ordenId } = useParams()
  const location = useLocation()
  const [state, setState] = useState({ status: 'loading', order: null })

  useEffect(() => {
    const controller = new AbortController()
    getOrderById(user.id, ordenId, { signal: controller.signal })
      .then((order) => setState({ status: order ? 'success' : 'not-found', order }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', order: null })
      })
    return () => controller.abort()
  }, [ordenId, user.id])

  const order = state.order
  const date = order && new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(order.fechaCreacion))

  return (
    <section className="page-shell orders-page" aria-labelledby="order-detail-title">
      <PageHeading eyebrow="Tu compra" title="Detalle de orden">
        <Link className="secondary-button" to="/ordenes">Volver al historial</Link>
      </PageHeading>
      {location.state?.confirmation && (
        <FeedbackMessage title="Compra realizada" type="success">
          {location.state.confirmation}
        </FeedbackMessage>
      )}
      {state.status === 'loading' && <LoadingState label="Cargando orden…" />}
      {state.status === 'error' && <FeedbackMessage title="No pudimos cargar la orden" type="error" />}
      {state.status === 'not-found' && (
        <div className="orders-empty">
          <h2>Orden no encontrada</h2>
          <Link className="primary-button" to="/ordenes">Ir al historial</Link>
        </div>
      )}
      {state.status === 'success' && order && (
        <article className="order-detail">
          <header className="order-detail__header">
            <div>
              <p className="order-card__eyebrow">Orden #{order.id}</p>
              <h2 id="order-detail-title">{date}</h2>
              <p className="order-code">Código de seguimiento {order.codigoSeguimiento}</p>
            </div>
          </header>
          <ul className="order-items">
            {order.detalles.map((detalle) => <OrderSummaryItem key={detalle.id} item={detalle} />)}
          </ul>
          <div className="order-detail__total">
            <span>Total</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </article>
      )}
    </section>
  )
}

export default OrderDetailPage
