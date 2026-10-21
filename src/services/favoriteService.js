
import { MockApiError, readJson, wait } from './http'
import products from '../data/products.json'

let storePromise = null
let lastFavoriteId = 0

async function loadStore({ signal } = {}) {
  if (!storePromise) {
    storePromise = readJson('/data/favoritos.json', { signal }).then(
      (favorites) => {
        lastFavoriteId = Math.max(0, ...favorites.map((item) => item.id))
        return favorites.map(({ id, usuarioId, productoId }) => ({
          id,
          usuarioId,
          productoId,
        }))
      },
    )

    storePromise.catch(() => {
      storePromise = null
    })
  }

  return storePromise
}

async function validateUser(usuarioId, signal) {
  if (!Number.isInteger(Number(usuarioId)) || Number(usuarioId) <= 0) {
    throw new MockApiError({
      estado: 400,
      mensaje: 'El ID del usuario debe ser un número positivo',
    })
  }

  const users = await readJson('/data/usuarios.json', { signal })
  const user = users.find((item) => item.id === Number(usuarioId))

  if (!user) {
    throw new MockApiError({
      estado: 404,
      mensaje: 'Usuario no encontrado',
    })
  }

  return user
}

function toDto(favorite) {
  const product = products.find(
    (item) => item.id === favorite.productoId,
  )

  return {
    id: favorite.id,
    usuarioId: favorite.usuarioId,
    productoId: favorite.productoId,
    nombreProducto: product?.nombre ?? '',
    precioProducto: product?.precio ?? 0,
    stockDisponible: (product?.stock ?? 0) > 0,
  }
}

// GET /api/favoritos/usuario/{usuarioId}
export async function getFavoritesByUser(usuarioId, { signal } = {}) {
  await wait(250, signal)
  await validateUser(usuarioId, signal)

  const store = await loadStore({ signal })

  return store
    .filter((item) => item.usuarioId === Number(usuarioId))
    .map(toDto)
}

// POST /api/favoritos?usuarioId={id}&productoId={id}
export async function addFavorite(usuarioId, productoId) {
  await wait(250)
  await validateUser(usuarioId)

  const numericUserId = Number(usuarioId)
  const numericProductId = Number(productoId)

  if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
    throw new MockApiError({
      estado: 400,
      mensaje: 'El ID del producto debe ser un numero entero positivo',
    })
  }

  const product = products.find(
    (item) => item.id === numericProductId,
  )

  if (!product) {
    throw new MockApiError({
      estado: 404,
      mensaje: 'Producto no encontrado',
    })
  }

  const store = await loadStore()

  const alreadyFavorite = store.some(
    (item) =>
      item.usuarioId === numericUserId &&
      item.productoId === numericProductId,
  )

  if (alreadyFavorite) {
    throw new MockApiError({
      estado: 409,
      mensaje: 'El producto ya se encuentra en la lista de favoritos',
    })
  }

  const favorite = {
    id: ++lastFavoriteId,
    usuarioId: numericUserId,
    productoId: numericProductId,
  }

  store.push(favorite)

  return toDto(favorite)
}

// Simulación local: el backend actual no ofrece este DELETE individual.
export async function removeFavorite(usuarioId, productoId) {
  await wait(200)
  await validateUser(usuarioId)

  const store = await loadStore()
  const index = store.findIndex(
    (item) =>
      item.usuarioId === Number(usuarioId) &&
      item.productoId === Number(productoId),
  )

  if (index === -1) {
    throw new MockApiError({
      estado: 404,
      mensaje: 'El producto no está en la lista de favoritos',
    })
  }

  store.splice(index, 1)
}

// DELETE /api/favoritos/usuario/{usuarioId}
export async function clearFavorites(usuarioId) {
  await wait(200)
  await validateUser(usuarioId)

  const store = await loadStore()

  for (let index = store.length - 1; index >= 0; index -= 1) {
    if (store[index].usuarioId === Number(usuarioId)) {
      store.splice(index, 1)
    }
  }
}
