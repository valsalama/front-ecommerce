import { MockApiError, readJson, wait } from './http.js'
import { getProducts } from './productService.js'

import { loadCartStore as loadStore, loadProductStore, nextItemId, notifyCatalogChanged } from './mockStore.js'

// Las respuestas de error parten de los ejemplos de public/data/ y solo se
// ajustan la ruta, la fecha y, cuando el backend lo arma dinámicamente, el
// mensaje.
async function throwApiError(path, overrides = {}) {
  const payload = await readJson(path)
  throw new MockApiError({
    ...payload,
    fecha: new Date().toISOString().slice(0, 19),
    ...overrides,
  })
}

// Admite tanto la lista actual como una futura respuesta paginada de productos.
async function loadProducts(signal) {
  const data = await getProducts({ signal })
  return Array.isArray(data) ? data : (data?.content ?? [])
}

const roundMoney = (value) => Math.round(value * 100) / 100

function toResponse(cart, products) {
  const items = cart.items.filter((item) => products.some((product) => product.id === item.productoId)).map((item) => {
    const product = products.find((candidate) => candidate.id === item.productoId)
    const precioUnitario = product?.precio ?? 0

    return {
      id: item.id,
      productoId: item.productoId,
      producto: product?.nombre ?? '',
      precioUnitario,
      cantidad: item.cantidad,
      subtotal: roundMoney(precioUnitario * item.cantidad),
    }
  })

  return {
    id: cart.id,
    usuarioId: cart.usuarioId,
    items,
    total: roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0)),
  }
}

async function findCart(usuarioId, ruta) {
  const carts = await loadStore()
  const cart = carts.find((candidate) => candidate.usuarioId === Number(usuarioId))

  if (!cart) {
    await throwApiError('/data/error-carrito-no-encontrado.json', { ruta })
  }

  return cart
}

// Igual que buscarItemDelCarrito: 404 si el ítem no existe y 403 si pertenece
// al carrito de otra persona.
async function findItem(cart, itemId, ruta) {
  const carts = await loadStore()
  const owner = carts.find((candidate) =>
    candidate.items.some((item) => item.id === Number(itemId)),
  )

  if (!owner) {
    await throwApiError('/data/error-item-carrito-no-encontrado.json', { ruta })
  }

  if (owner.id !== cart.id) {
    await throwApiError('/data/error-item-carrito-ajeno.json', { ruta })
  }

  return cart.items.find((item) => item.id === Number(itemId))
}

async function assertStock(product, cantidad, ruta) {
  if (!product) await throwApiError('/data/error-producto-no-encontrado.json', { ruta })
  if (product.stock < cantidad) {
    await throwApiError('/data/error-carrito-stock-insuficiente.json', {
      mensaje: `Stock insuficiente para el producto: ${product.nombre}`,
      ruta,
    })
  }
}

// Mismas reglas y mensajes que las anotaciones de AgregarItemCarritoDTO.
function validateAddItem({ usuarioId, productoId, cantidad }) {
  const errores = {}

  if (usuarioId === null || usuarioId === undefined) {
    errores.usuarioId = 'El usuario es obligatorio'
  } else if (usuarioId <= 0) {
    errores.usuarioId = 'El ID del usuario debe ser positivo'
  }

  if (productoId === null || productoId === undefined) {
    errores.productoId = 'El producto es obligatorio'
  } else if (productoId <= 0) {
    errores.productoId = 'El ID del producto debe ser positivo'
  }

  if (cantidad === null || cantidad === undefined) {
    errores.cantidad = 'La cantidad es obligatoria'
  } else if (cantidad <= 0) {
    errores.cantidad = 'La cantidad debe ser mayor a cero'
  }

  return errores
}

// GET /api/carritos/{usuarioId}
// mode: 'data' (por defecto), 'empty', 'not-found' o 'error', para demostrar
// los estados de la pantalla.
export async function getCartByUser(usuarioId, { mode = 'data', signal } = {}) {
  const ruta = `/api/carritos/${usuarioId}`

  if (mode === 'error') {
    await wait(400, signal)
    await throwApiError('/data/error-carrito-servidor.json', { ruta })
  }

  if (mode === 'not-found') {
    await wait(400, signal)
    await throwApiError('/data/error-carrito-no-encontrado.json', { ruta })
  }

  const products = await loadProducts(signal)
  const cart = await findCart(usuarioId, ruta)

  if (mode === 'empty') return toResponse({ ...cart, items: [] }, products)

  return toResponse(cart, products)
}

// POST /api/carritos/items
// Si la prenda ya está en el carrito, suma la cantidad al ítem existente.
export async function addItem(data, { signal } = {}) {
  const ruta = '/api/carritos/items'
  const products = await loadProducts(signal)

  const errores = validateAddItem(data)
  if (Object.keys(errores).length > 0) {
    await throwApiError('/data/error-carrito-validacion.json', { ruta, errores })
  }

  const cart = await findCart(data.usuarioId, ruta)
  const product = products.find((candidate) => candidate.id === Number(data.productoId))

  if (!product) {
    await throwApiError('/data/error-producto-no-encontrado.json', { ruta })
  }

  if (product.stock <= 0) {
    await throwApiError('/data/error-carrito-sin-stock.json', { ruta })
  }

  const existing = cart.items.find((item) => item.productoId === product.id)
  const nextQuantity = (existing?.cantidad ?? 0) + data.cantidad
  await assertStock(product, nextQuantity, ruta)

  if (existing) {
    existing.cantidad = nextQuantity
  } else {
    cart.items.push({ id: nextItemId(), productoId: product.id, cantidad: data.cantidad })
  }

  return toResponse(cart, products)
}

// PATCH /api/carritos/{usuarioId}/items/{itemId}
// Con cantidad 0 el backend quita el ítem del carrito.
export async function updateItemQuantity(usuarioId, itemId, cantidad, { signal } = {}) {
  const ruta = `/api/carritos/${usuarioId}/items/${itemId}`
  const products = await loadProducts(signal)

  if (cantidad === null || cantidad === undefined) {
    await throwApiError('/data/error-carrito-cantidad-negativa.json', {
      mensaje: 'La cantidad es obligatoria',
      ruta,
    })
  }

  if (cantidad < 0) {
    await throwApiError('/data/error-carrito-cantidad-negativa.json', { ruta })
  }

  const cart = await findCart(usuarioId, ruta)
  const item = await findItem(cart, itemId, ruta)

  if (cantidad === 0) {
    cart.items = cart.items.filter((candidate) => candidate !== item)
    return toResponse(cart, products)
  }

  const product = products.find((candidate) => candidate.id === item.productoId)
  await assertStock(product, cantidad, ruta)

  item.cantidad = cantidad
  return toResponse(cart, products)
}

// DELETE /api/carritos/{usuarioId}/items/{itemId}
export async function removeItem(usuarioId, itemId, { signal } = {}) {
  const ruta = `/api/carritos/${usuarioId}/items/${itemId}`
  const products = await loadProducts(signal)
  const cart = await findCart(usuarioId, ruta)
  const item = await findItem(cart, itemId, ruta)

  cart.items = cart.items.filter((candidate) => candidate !== item)
  return toResponse(cart, products)
}

// DELETE /api/carritos/{usuarioId}/items
export async function clearCart(usuarioId, { signal } = {}) {
  const ruta = `/api/carritos/${usuarioId}/items`
  const products = await loadProducts(signal)
  const cart = await findCart(usuarioId, ruta)

  cart.items = []
  return toResponse(cart, products)
}

// La confirmación valida todo antes de modificar stock y carrito.
// La instantánea permite que la orden conserve exactamente lo comprado.
export async function checkoutCartWithSnapshot(usuarioId, { signal } = {}) {
  const ruta = `/api/carritos/${usuarioId}/checkout`
  const [products, response] = await Promise.all([
    loadProductStore(), readJson('/data/checkout-carrito-response.json', { signal }),
  ])
  const cart = await findCart(usuarioId, ruta)
  signal?.throwIfAborted()
  if (cart.items.length === 0) {
    await throwApiError('/data/error-carrito-vacio-checkout.json', { ruta })
  }
  // Sin awaits entre validación y confirmación: otra compra no puede intercalarse.
  for (const item of cart.items) {
    const product = products.find((candidate) => candidate.id === item.productoId)
    if (!product) await throwApiError('/data/error-producto-no-encontrado.json', { ruta })
    if (product.stock < item.cantidad) {
      await throwApiError('/data/error-carrito-stock-insuficiente.json', {
        mensaje: `Stock insuficiente para el producto: ${product.nombre}`, ruta,
      })
    }
  }
  signal?.throwIfAborted()
  const snapshot = toResponse(cart, products)
  for (const item of cart.items) {
    products.find((product) => product.id === item.productoId).stock -= item.cantidad
  }
  cart.items = []
  notifyCatalogChanged()
  return { checkout: { ...response, total: snapshot.total }, cart: snapshot }
}

// POST /api/carritos/{usuarioId}/checkout -> CheckoutRespuestaDTO.
export async function checkoutCart(usuarioId, options) {
  return (await checkoutCartWithSnapshot(usuarioId, options)).checkout
}
