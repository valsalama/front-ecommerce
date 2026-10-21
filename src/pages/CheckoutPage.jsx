import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OrderSummaryItem from '../components/ordenes/OrderSummaryItem'
import '../components/ordenes/ordenes.css'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { checkoutOrder } from '../services/orderService'
import { formatPrice } from '../components/carrito/formatPrice'

const SIMULATIONS = [
  { value: 'success', label: 'Simular éxito' },
  { value: 'insufficient_stock', label: 'Simular sin stock' },
  { value: 'empty', label: 'Simular carrito vacío' },
]

function CheckoutPage() {
  const { user } = useAuth()
  const { cart, status, refreshCart } = useCart()
  const navigate = useNavigate()
  const [mode, setMode] = useState('success')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleCheckout = async () => {
    setBusy(true)
    setFeedback(null)

    try {
      const result = await checkoutOrder(user.id, cart, { mode })
      refreshCart()
      navigate(`/ordenes/${result.order.id}`, {
        state: { confirmation: result.checkout.mensaje },
      })
    } catch (error) {
      setFeedback({ type: 'error', message: error.payload?.mensaje ?? error.message })
    } finally {
      setBusy(false)
    }
  }

  const items = cart?.items ?? []

  return (
    <section className="page-shell orders-page" aria-labelledby="checkout-title">
      <PageHeading
        eyebrow="Último paso"
        title="Resumen de compra"
        description="Confirmá las prendas y el total antes de finalizar tu orden."
      >
        <Link className="secondary-button" to="/carrito">Volver al carrito</Link>
        <Link className="secondary-button" to="/ordenes">Mis órdenes</Link>
      </PageHeading>

      <div className="checkout-layout">
        <section className="order-panel" aria-label="Prendas de la compra">
          <h2>Prendas</h2>
          {status === 'loading' && <p role="status">Cargando carrito…</p>}
          {items.length > 0 ? (
            <ul className="order-items">
              {items.map((item) => <OrderSummaryItem key={item.id} item={item} />)}
            </ul>
          ) : (
            <p className="order-empty-note">No hay prendas en el carrito. Podés probar el estado de carrito vacío.</p>
          )}
        </section>

        <aside className="checkout-total" aria-label="Total de compra">
          <p className="order-card__eyebrow">Total de la orden</p>
          <strong>{formatPrice(cart?.total ?? 0)}</strong>
          <label htmlFor="checkout-simulation">Escenario de prueba</label>
          <select
            id="checkout-simulation"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            disabled={busy}
          >
            {SIMULATIONS.map((simulation) => (
              <option key={simulation.value} value={simulation.value}>{simulation.label}</option>
            ))}
          </select>
          <button className="primary-button" type="button" onClick={handleCheckout} disabled={busy}>
            {busy ? 'Procesando…' : 'Confirmar compra'}
          </button>
          {feedback && (
            <FeedbackMessage title="No se pudo confirmar la compra" type={feedback.type}>
              {feedback.message}
            </FeedbackMessage>
          )}
        </aside>
      </div>
    </section>
  )
}

export default CheckoutPage