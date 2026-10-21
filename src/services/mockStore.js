import { readJson } from './http.js'

// Estado interno compartido de la demo. Los servicios siguen devolviendo DTOs,
// nunca estas referencias. Recargar la página vuelve a cargar los JSON.
let productsPromise
let cartsPromise
let productId = 0
let photoId = 0
let itemId = 0
const listeners = new Set()

export function loadProductStore() {
  if (!productsPromise) {
    productsPromise = readJson('/data/productos.json').then((products) => {
      productId = Math.max(0, ...products.map((product) => product.id))
      photoId = Math.max(0, ...products.flatMap((product) => product.fotos.map((photo) => photo.id)))
      return products
    }).catch((error) => { productsPromise = undefined; throw error })
  }
  return productsPromise
}

export function loadCartStore() {
  if (!cartsPromise) {
    cartsPromise = readJson('/data/carritos.json').then((carts) => {
      itemId = Math.max(0, ...carts.flatMap((cart) => cart.items.map((item) => item.id)))
      return carts.map(({ id, usuarioId, items }) => ({
        id, usuarioId,
        items: items.map(({ id, productoId, cantidad }) => ({ id, productoId, cantidad })),
      }))
    }).catch((error) => { cartsPromise = undefined; throw error })
  }
  return cartsPromise
}

export const nextProductId = () => ++productId
export const nextPhotoId = () => ++photoId
export const nextItemId = () => ++itemId

export function subscribeCatalog(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifyCatalogChanged() {
  listeners.forEach((listener) => listener())
}
