import { Link } from 'react-router-dom'
import { formatPrice } from '../carrito/formatPrice'
import OrderStatusBadge from './OrderStatusBadge'

function OrderCard({ orden }) {
  const date = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
    new Date(orden.fecha),
  )

  return (
    <article className="order-card">
      <div className="order-card__main">
        <p className="order-card__eyebrow">Orden #{orden.id}</p>
        <h2>{date}</h2>
        <p>{orden.items.length} {orden.items.length === 1 ? 'producto' : 'productos'}</p>
      </div>
      <OrderStatusBadge estado={orden.estado} />
      <strong className="order-card__total">{formatPrice(orden.total)}</strong>
      <Link className="secondary-button" to={`/ordenes/${orden.id}`}>
        Ver detalle
      </Link>
    </article>
  )
}

export default OrderCard