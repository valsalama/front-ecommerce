import { subscribeCatalog } from '../services/mockStore.js'
import { useEffect, useMemo, useState } from 'react'
import {
  addItem as addItemRequest,
  checkoutCart,
  clearCart as clearCartRequest,
  getCartByUser,
  removeItem as removeItemRequest,
  updateItemQuantity,
} from '../services/cartService'
import { CartContext } from './cart-context'
import { useAuth } from './useAuth'

const IDLE_STATE = { status: 'idle', cart: null, error: '' }

// Carrito de la sesión simulada. Lo comparten el encabezado, la pantalla del
// carrito, el botón "Agregar al carrito" del catálogo y el checkout.
export function CartProvider({ children }) {
  const { user } = useAuth()
  const usuarioId = user?.id ?? null
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState(IDLE_STATE)

  useEffect(() => subscribeCatalog(() => setReloadKey((key) => key + 1)), [])

  useEffect(() => {
    if (!usuarioId) return undefined

    const controller = new AbortController()

    async function loadCart() {
      setState((current) => ({
        status: 'loading',
        cart: current.cart?.usuarioId === usuarioId ? current.cart : null,
        error: '',
      }))

      try {
        const cart = await getCartByUser(usuarioId, { signal: controller.signal })
        controller.signal.throwIfAborted()
        setState({ status: 'success', cart, error: '' })
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setState({ status: 'error', cart: null, error: requestError.message })
      }
    }

    loadCart()
    return () => controller.abort()
  }, [usuarioId, reloadKey])

  const value = useMemo(() => {
    // Sin sesión no hay carrito, aunque quede en memoria el de la anterior.
    const current = usuarioId ? state : IDLE_STATE

    const requireUser = () => {
      if (!usuarioId) {
        throw new Error('Necesitás iniciar sesión para usar el carrito')
      }
    }

    // Cada operación devuelve CarritoRespuestaDTO; se reemplaza el estado con
    // la respuesta, igual que se hará con la API real.
    const applyResponse = async (request) => {
      requireUser()
      const cart = await request()
      setState({ status: 'success', cart, error: '' })
      return cart
    }

    return {
      cart: current.cart,
      status: current.status,
      error: current.error,
      itemCount: current.cart?.items.reduce((sum, item) => sum + item.cantidad, 0) ?? 0,
      refreshCart: () => setReloadKey((key) => key + 1),
      addItem: (productoId, cantidad = 1) =>
        applyResponse(() => addItemRequest({ usuarioId, productoId, cantidad })),
      updateQuantity: (itemId, cantidad) =>
        applyResponse(() => updateItemQuantity(usuarioId, itemId, cantidad)),
      removeItem: (itemId) => applyResponse(() => removeItemRequest(usuarioId, itemId)),
      clearCart: () => applyResponse(() => clearCartRequest(usuarioId)),
      // POST /api/carritos/{usuarioId}/checkout: devuelve CheckoutRespuestaDTO
      // y deja el carrito vacío.
      checkout: async () => {
        requireUser()
        const response = await checkoutCart(usuarioId)
        setState((previous) => ({
          status: 'success',
          cart: previous.cart ? { ...previous.cart, items: [], total: 0 } : null,
          error: '',
        }))
        return response
      },
    }
  }, [state, usuarioId])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
