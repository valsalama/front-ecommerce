import { useState } from 'react'
import { formatPrice } from './formatPrice'

function CartSummary({ cart, itemCount, busy = false, onCheckout, onClear }) {
  const [confirmingClear, setConfirmingClear] = useState(false)

  const handleClear = async () => {
    await onClear()
    setConfirmingClear(false)
  }

  return (
    <aside className="cart-summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title">Resumen</h2>

      <dl className="cart-summary__rows">
        {cart.items.map((item) => (
          <div key={item.id}>
            <dt>
              {item.producto} <span>× {item.cantidad}</span>
            </dt>
            <dd>{formatPrice(item.subtotal)}</dd>
          </div>
        ))}
      </dl>

      <div className="cart-summary__total">
        <span>
          Total <small>({itemCount} {itemCount === 1 ? 'prenda' : 'prendas'})</small>
        </span>
        <strong>{formatPrice(cart.total)}</strong>
      </div>

      <p className="cart-summary__note">
        El stock se vuelve a validar al confirmar la compra.
      </p>

      <button className="primary-button" type="button" onClick={onCheckout} disabled={busy}>
        Continuar al checkout
      </button>

      {confirmingClear ? (
        <div className="cart-summary__confirm" role="alertdialog" aria-labelledby="cart-clear-title">
          <p id="cart-clear-title">¿Querés quitar todas las prendas del carrito?</p>
          <div>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setConfirmingClear(false)}
              disabled={busy}
            >
              Cancelar
            </button>
            <button className="primary-button cart-summary__danger" type="button" onClick={handleClear} disabled={busy}>
              Vaciar
            </button>
          </div>
        </div>
      ) : (
        <button
          className="secondary-button"
          type="button"
          onClick={() => setConfirmingClear(true)}
          disabled={busy}
        >
          Vaciar carrito
        </button>
      )}
    </aside>
  )
}

export default CartSummary
