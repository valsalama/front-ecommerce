import { formatPrice } from '../carrito/formatPrice'

function OrderSummaryItem({ item }) {
  return (
    <li className="order-item">
      <div>
        <h3>{item.producto}</h3>
        <p>
          {item.cantidad} × {formatPrice(item.precioUnitario)}
        </p>
      </div>
      <strong>{formatPrice(item.subtotal)}</strong>
    </li>
  )
}

export default OrderSummaryItem