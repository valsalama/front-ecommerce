import { Link } from 'react-router-dom'
import { formatPrice } from '../carrito/formatPrice'

// Recibe una OrdenRespuestaDTO.
function OrderCard({ orden }) {
  const date = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
    new Date(orden.fechaCreacion),
  )
  const count = orden.detalles.length

  return (
    <article className="order-card">
      <div className="order-card__main">
        <p className="order-card__eyebrow">Orden #{orden.id}</p>
        <h2>{date}</h2>
        <p>{count} {count === 1 ? 'producto' : 'productos'}</p>
        <p className="order-code">Seguimiento {orden.codigoSeguimiento}</p>
      </div>
      <strong className="order-card__total">{formatPrice(orden.total)}</strong>
      <Link className="secondary-button" to={`/ordenes/${orden.id}`}>
        Ver detalle
      </Link>
    </article>
  )
}

export default OrderCard
