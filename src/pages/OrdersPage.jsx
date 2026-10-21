import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import OrderCard from '../components/ordenes/OrderCard'
import '../components/ordenes/ordenes.css'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { getOrders } from '../services/orderService'

function OrdersPage() {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', orders: [] })

  useEffect(() => {
    const controller = new AbortController()
    getOrders(user.id, { signal: controller.signal })
      .then((orders) => setState({ status: 'success', orders }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', orders: [] })
      })
    return () => controller.abort()
  }, [user.id])

  return (
    <section className="page-shell orders-page" aria-labelledby="orders-title">
      <PageHeading
        eyebrow="Tu cuenta"
        title="Mis órdenes"
        description="Consultá el estado y el detalle de tus compras."
      />
      {state.status === 'loading' && <LoadingState label="Cargando órdenes…" />}
      {state.status === 'error' && <p role="alert">No pudimos cargar el historial. Actualizá la página para reintentar.</p>}
      {state.status === 'success' && state.orders.length === 0 && (
        <div className="orders-empty">
          <h2>Todavía no tenés órdenes</h2>
          <p>Cuando confirmes una compra, la vas a encontrar acá.</p>
          <Link className="primary-button" to="/#productos">Explorar prendas</Link>
        </div>
      )}
      {state.status === 'success' && state.orders.length > 0 && (
        <div className="orders-list">
          {state.orders.map((orden) => <OrderCard key={orden.id} orden={orden} />)}
        </div>
      )}
    </section>
  )
}

export default OrdersPage