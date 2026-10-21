import { checkoutCart } from './cartService'
import { MockApiError, readJson, wait } from './http'

let ordersPromise = null
let lastOrderId = 0

function loadOrders() {
  if (!ordersPromise) {
    ordersPromise = readJson('/data/orders.json').then((orders) => {
      lastOrderId = Math.max(0, ...orders.map((order) => order.id))
      return orders
    })
    ordersPromise.catch(() => {
      ordersPromise = null
    })
  }

  return ordersPromise
}

async function throwCheckoutError(file, usuarioId, mensaje) {
  const ruta = `/api/carritos/${usuarioId}/checkout`
  const payload = await readJson(file)

  throw new MockApiError({
    ...payload,
    fecha: new Date().toISOString().slice(0, 19),
    mensaje: mensaje ?? payload.mensaje,
    ruta,
  })
}

// GET /api/ordenes/historial/{usuarioId}
export async function getOrders(usuarioId, { signal } = {}) {
  await wait(250, signal)
  const orders = await loadOrders()

  return orders
    .filter((order) => order.usuarioId === Number(usuarioId))
    .sort((first, second) => second.id - first.id)
}

// GET /api/ordenes/{ordenId}
export async function getOrderById(usuarioId, ordenId, { signal } = {}) {
  await wait(200, signal)
  const orders = await loadOrders()

  return orders.find(
    (order) => order.id === Number(ordenId) && order.usuarioId === Number(usuarioId),
  ) ?? null
}

// POST /api/carritos/{usuarioId}/checkout. Only successful checkouts enter history.
export async function checkoutOrder(usuarioId, cart, { mode = 'success', signal } = {}) {
  const ruta = `/api/carritos/${usuarioId}/checkout`

  if (mode === 'empty') {
    await wait(300, signal)
    await throwCheckoutError('/data/error-carrito-vacio-checkout.json', usuarioId)
  }

  if (mode === 'insufficient_stock') {
    await wait(300, signal)
    await throwCheckoutError(
      '/data/error-carrito-stock-insuficiente.json',
      usuarioId,
      'Stock insuficiente para el producto: Producto 101',
    )
  }

  const checkout = await checkoutCart(usuarioId, { signal })
  const orders = await loadOrders()
  lastOrderId += 1

  const order = {
    id: lastOrderId,
    usuarioId: Number(usuarioId),
    fecha: new Date().toISOString().slice(0, 19),
    estado: 'CONFIRMADA',
    items: (cart?.items ?? []).map((item) => ({ ...item })),
    total: checkout.total,
  }

  orders.push(order)
  return { checkout, order, ruta }
}