import { formatPrice } from './formatPrice'
import QuantityStepper from './QuantityStepper'

// Recibe un ItemCarritoRespuestaDTO. La foto y el stock no forman parte del
// DTO: se toman del producto con el mismo productoId.
function CartItem({ item, product, pending = false, onQuantityChange, onRemove }) {
  const cover = product?.fotos?.find((foto) => foto.esPortada) ?? product?.fotos?.[0]

  return (
    <li className={`cart-item${pending ? ' is-pending' : ''}`}>
      <div className="cart-item__media">
        {cover ? (
          <img src={cover.url} alt={item.producto} />
        ) : (
          <span aria-hidden="true">Sin foto</span>
        )}
      </div>

      <div className="cart-item__info">
        {product?.categoria && <p className="cart-item__category">{product.categoria}</p>}
        <h3>{item.producto}</h3>
        <p className="cart-item__unit">{formatPrice(item.precioUnitario)} c/u</p>
        {product && (
          <p className={`cart-item__stock${item.cantidad >= product.stock ? ' is-limit' : ''}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </p>
        )}
      </div>

      <div className="cart-item__controls">
        <QuantityStepper
          value={item.cantidad}
          label={item.producto}
          disabled={pending}
          onChange={(cantidad) => onQuantityChange(item, cantidad)}
        />
        <button
          className="cart-item__remove"
          type="button"
          onClick={() => onRemove(item)}
          disabled={pending}
        >
          Quitar
        </button>
      </div>

      <p className="cart-item__subtotal">
        <span>Subtotal</span>
        <strong>{formatPrice(item.subtotal)}</strong>
      </p>
    </li>
  )
}

export default CartItem
