import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CartItem from '../components/carrito/CartItem'
import CartSuggestions from '../components/carrito/CartSuggestions'
import CartSummary from '../components/carrito/CartSummary'
import '../components/carrito/carrito.css'
import ButtonLink from '../components/ui/ButtonLink'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { getCartByUser } from '../services/cartService'
import { getProducts } from '../services/productService'

// Pantalla de resumen y confirmación del módulo de órdenes y checkout.
const CHECKOUT_PATH = '/checkout'

const describeError = (requestError) => {
  const fieldErrors = Object.values(requestError.payload?.errores ?? {})
  return [requestError.message, ...fieldErrors].join('. ')
}

function CartPage() {
  const { user } = useAuth()
  const {
    cart,
    status,
    error,
    itemCount,
    addItem,
    clearCart,
    refreshCart,
    removeItem,
    updateQuantity,
  } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [viewMode, setViewMode] = useState('data')
  const [demo, setDemo] = useState({ status: 'loading', cart: null, error: '' })
  const [pendingItemId, setPendingItemId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Las fotos y el stock no vienen en CarritoRespuestaDTO: se leen del catálogo.
  useEffect(() => {
    const controller = new AbortController()

    getProducts({ signal: controller.signal })
      .then((data) => setProducts(Array.isArray(data) ? data : (data?.content ?? [])))
      .catch(() => {})

    return () => controller.abort()
  }, [])

  // Los mensajes de éxito se ocultan solos; los de error quedan visibles.
  useEffect(() => {
    if (feedback?.type !== 'success') return undefined

    const timeoutId = window.setTimeout(() => setFeedback(null), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [feedback])

  useEffect(() => {
    if (viewMode === 'data') return undefined

    const controller = new AbortController()

    async function loadDemo() {
      setDemo({ status: 'loading', cart: null, error: '' })

      try {
        const demoCart = await getCartByUser(user.id, {
          mode: viewMode,
          signal: controller.signal,
        })
        setDemo({ status: 'success', cart: demoCart, error: '' })
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setDemo({ status: 'error', cart: null, error: requestError.message })
      }
    }

    loadDemo()
    return () => controller.abort()
  }, [viewMode, user.id])

  const showingDemo = viewMode !== 'data'
  const view = showingDemo
    ? demo
    : { status: cart ? 'success' : status === 'idle' ? 'loading' : status, cart, error }
  const productById = Object.fromEntries(products.map((product) => [product.id, product]))

  const runAction = async (action, successMessage) => {
    setFeedback(null)

    try {
      await action()
      if (successMessage) setFeedback({ type: 'success', title: successMessage })
    } catch (requestError) {
      setFeedback({
        type: 'error',
        title: 'No pudimos actualizar el carrito',
        message: describeError(requestError),
      })
    }
  }

  const handleQuantityChange = async (item, cantidad) => {
    setPendingItemId(item.id)
    await runAction(
      () => updateQuantity(item.id, cantidad),
      cantidad === 0 ? `Quitamos ${item.producto} del carrito` : 'Cantidad actualizada',
    )
    setPendingItemId(null)
  }

  const handleRemove = async (item) => {
    setPendingItemId(item.id)
    await runAction(() => removeItem(item.id), `Quitamos ${item.producto} del carrito`)
    setPendingItemId(null)
  }

  const handleClear = async () => {
    setBusy(true)
    await runAction(clearCart, 'Vaciamos tu carrito')
    setBusy(false)
  }

  const handleRetry = () => {
    setViewMode('data')
    refreshCart()
  }

  // Ejemplos de respuestas de error del backend para las acciones del carrito.
  // El ítem 4 pertenece al carrito del administrador y el 1 al de Benja.
  const demoErrors = [
    { label: 'Agregar prenda sin stock', run: () => addItem(5, 1) },
    { label: 'Agregar más que el stock', run: () => addItem(4, 99) },
    { label: 'Agregar cantidad 0', run: () => addItem(1, 0) },
    { label: 'Enviar cantidad negativa', run: () => updateQuantity(cart?.items[0]?.id ?? 1, -1) },
    { label: 'Quitar ítem inexistente', run: () => removeItem(999) },
    { label: 'Quitar ítem de otro carrito', run: () => removeItem(user.id === 4 ? 1 : 4) },
  ]

  return (
    <section className="page-shell" aria-labelledby="cart-title">
      <PageHeading
        eyebrow="Tu compra"
        title="Carrito"
        description="Revisá las prendas que elegiste, ajustá las cantidades y continuá al checkout cuando estés listo."
      >
        <ButtonLink to="/#productos" secondary>
          Seguir comprando
        </ButtonLink>
      </PageHeading>

      <div className="cart-toolbar">
        <p className="cart-toolbar__count" aria-live="polite">
          {view.status === 'success' && view.cart
            ? `${view.cart.items.length} ${view.cart.items.length === 1 ? 'producto' : 'productos'}`
            : ''}
        </p>

        <details className="cart-demo">
          <summary>Probar estados de la interfaz</summary>
          <div className="cart-demo__panel">
            <label htmlFor="cart-demo-state">
              Respuesta simulada
              <select
                className="state-select"
                id="cart-demo-state"
                value={viewMode}
                onChange={(event) => {
                  setFeedback(null)
                  setViewMode(event.target.value)
                }}
              >
                <option value="data">Datos de la API simulada</option>
                <option value="empty">Carrito vacío</option>
                <option value="not-found">Carrito inexistente (404)</option>
                <option value="error">Error del servidor (500)</option>
              </select>
            </label>

            {!showingDemo && (
              <fieldset>
                <legend>Errores de las acciones</legend>
                {demoErrors.map((demoError) => (
                  <button
                    key={demoError.label}
                    className="cart-demo__action"
                    type="button"
                    onClick={() => runAction(demoError.run)}
                  >
                    {demoError.label}
                  </button>
                ))}
              </fieldset>
            )}
          </div>
        </details>
      </div>

      {feedback && (
        <div className="cart-feedback">
          <FeedbackMessage title={feedback.title} type={feedback.type}>
            {feedback.message}
          </FeedbackMessage>
        </div>
      )}

      {view.status === 'loading' && <LoadingState label="Cargando carrito…" />}

      {view.status === 'error' && (
        <div className="cart-message">
          <FeedbackMessage title="No pudimos cargar el carrito" type="error">
            {view.error}
          </FeedbackMessage>
          <button className="secondary-button" type="button" onClick={handleRetry}>
            Reintentar
          </button>
        </div>
      )}

      {view.status === 'success' && view.cart?.items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__content">
            <h2>Tu carrito está vacío</h2>
            <p>Explorá la colección y sumá las prendas que más te gusten.</p>
            <ButtonLink to="/#productos">Ver colección</ButtonLink>
          </div>
        </div>
      )}

      {view.status === 'success' && view.cart?.items.length > 0 && (
        <div className="cart-layout">
          <ul className="cart-items" aria-label="Prendas en el carrito">
            {view.cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                product={productById[item.productoId]}
                pending={showingDemo || busy || pendingItemId === item.id}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>

          <CartSummary
            cart={view.cart}
            itemCount={itemCount}
            busy={showingDemo || busy || pendingItemId !== null}
            onCheckout={() => navigate(CHECKOUT_PATH)}
            onClear={handleClear}
          />
        </div>
      )}

      {!showingDemo && view.status === 'success' && (
        <CartSuggestions products={products} cart={view.cart} />
      )}
    </section>
  )
}

export default CartPage
