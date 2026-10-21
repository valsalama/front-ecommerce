import { formatPrice } from '../carrito/formatPrice'

// Sirve para un ItemCarritoRespuestaDTO (producto) y para un
// DetallePedidoRespuestaDTO (productoNombre).
function OrderSummaryItem({ item }) {
  return (
    <li className="order-item">
      <div>
        <h3>{item.productoNombre ?? item.producto}</h3>
        <p>
          {item.cantidad} × {formatPrice(item.precioUnitario)}
        </p>
      </div>
      <strong>{formatPrice(item.subtotal)}</strong>
    </li>
  )
}

export default OrderSummaryItem
