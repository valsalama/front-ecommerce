import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import OrderStatusBadge from '../components/ordenes/OrderStatusBadge'
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
  }).format(new Date(order.fecha))

  return (
    <section className="page-shell orders-page" aria-labelledby="order-detail-title">
      <PageHeading eyebrow="Tu compra" title="Detalle de orden">
        <Link className="secondary-button" to="/ordenes">Volver al historial</Link>
      </PageHeading>
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
              <h2>{date}</h2>
            </div>
            <OrderStatusBadge estado={order.estado} />
          </header>
          <ul className="order-items">
            {order.items.map((item) => <OrderSummaryItem key={item.id} item={item} />)}
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