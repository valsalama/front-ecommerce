import { checkoutCartWithSnapshot } from './cartService.js'
import { MockApiError, readJson, wait } from './http.js'

// Copia en memoria de /data/orders.json (OrdenRespuestaDTO). Las órdenes nuevas
// viven mientras la aplicación esté abierta y no se escriben en el archivo.
let ordersPromise = null
let lastOrderId = 0
let lastDetailId = 0

function loadOrders() {
  if (!ordersPromise) {
    ordersPromise = readJson('/data/orders.json').then((orders) => {
      lastOrderId = Math.max(0, ...orders.map((order) => order.id))
      lastDetailId = Math.max(0, ...orders.flatMap((order) => order.detalles.map((detail) => detail.id)))
      return orders
    })
    ordersPromise.catch(() => {
      ordersPromise = null
    })
  }

  return ordersPromise
}

async function throwCheckoutError(file, mensaje) {
  const payload = await readJson(file)

  throw new MockApiError({
    ...payload,
    fecha: new Date().toISOString().slice(0, 19),
    mensaje: mensaje ?? payload.mensaje,
    ruta: '/api/ordenes/checkout',
  })
}

// El backend genera 12 caracteres hexadecimales en mayúsculas.
function generateTrackingCode(existing) {
  let code
  do {
    code = Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()
  } while (existing.some((order) => order.codigoSeguimiento === code))
  return code
}

// GET /api/ordenes/historial/{usuarioId}: de la más reciente a la más antigua.
export async function getOrders(usuarioId, { signal } = {}) {
  await wait(250, signal)
  const orders = await loadOrders()

  return orders
    .filter((order) => order.usuarioId === Number(usuarioId))
    .sort((first, second) => second.id - first.id)
}

// El backend no tiene un endpoint por id: el detalle sale del historial.
export async function getOrderById(usuarioId, ordenId, { signal } = {}) {
  const orders = await getOrders(usuarioId, { signal })
  return orders.find((order) => order.id === Number(ordenId)) ?? null
}

// POST /api/ordenes/checkout (CheckoutRequestDTO: usuarioId) -> 201 OrdenRespuestaDTO.
// Solo las compras exitosas entran al historial y vacían el carrito.
export async function checkoutOrder(usuarioId, cart, { mode = 'success', signal } = {}) {
  if (mode === 'empty') {
    await wait(300, signal)
    await throwCheckoutError('/data/error-carrito-vacio-checkout.json')
  }

  if (mode === 'insufficient_stock') {
    await wait(300, signal)
    const name = cart?.items?.[0]?.producto ?? 'Campera Urban'
    await throwCheckoutError(
      '/data/error-carrito-stock-insuficiente.json',
      `Stock insuficiente para el producto: ${name}`,
    )
  }

  const orders = await loadOrders()
  const { checkout, cart: confirmedCart } = await checkoutCartWithSnapshot(usuarioId, { signal })
  lastOrderId += 1

  const order = {
    id: lastOrderId,
    usuarioId: Number(usuarioId),
    total: checkout.total,
    fechaCreacion: new Date().toISOString().slice(0, 19),
    codigoSeguimiento: generateTrackingCode(orders),
    detalles: confirmedCart.items.map((item) => {
      lastDetailId += 1
      return {
        id: lastDetailId,
        productoId: item.productoId,
        productoNombre: item.producto,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
      }
    }),
  }

  orders.push(order)
  return { checkout, order }
}
