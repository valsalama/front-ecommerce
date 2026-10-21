import { MockApiError, readJson, wait } from './http.js'
import { loadProductStore, notifyCatalogChanged } from './mockStore.js'

// La demostración conserva cambios al navegar y se reinicia al recargar.
// La baja lógica es metadato interno: los DTOs sólo tienen id y nombre.
let storePromise
const inactiveIds = new Set()
const toDTO = ({ id, nombre }) => ({ id, nombre })

async function getStore() {
  if (!storePromise) {
    storePromise = readJson('/data/categorias.json').then((items) => items.map(toDTO))
      .catch((error) => { storePromise = undefined; throw error })
  }
  return storePromise
}

async function fail(fixture, route, { signal, mensaje } = {}) {
  const payload = await readJson(`/data/${fixture}.json`, { signal })
  throw new MockApiError({
    ...payload, fecha: new Date().toISOString().replace(/Z$/, ''), ruta: route,
    ...(mensaje ? { mensaje } : {}),
  })
}

async function prepare(signal) {
  signal?.throwIfAborted()
  await wait(300, signal)
  const categories = await getStore()
  signal?.throwIfAborted()
  return categories
}

async function findActive(categories, id, route, signal) {
  const numericId = Number(id)
  if (!Number.isSafeInteger(numericId) || numericId <= 0) {
    await fail('error-categoria-validacion', route, {
      signal, mensaje: 'El identificador de la categoría debe ser mayor a cero',
    })
  }
  const category = categories.find((item) => item.id === numericId && !inactiveIds.has(item.id))
  if (!category) await fail('error-categoria-no-encontrada', route, { signal })
  return category
}

async function validateName(nombre, route, signal) {
  if (typeof nombre !== 'string' || !nombre.trim()) {
    await fail('error-categoria-validacion', route, { signal })
  }
  return nombre.trim()
}

export async function getCategories({ signal, mode = 'data' } = {}) {
  const categories = await prepare(signal)
  if (mode === 'error') await fail('error-categorias', '/api/categorias', { signal })
  if (mode === 'empty') return []
  return categories.filter((item) => !inactiveIds.has(item.id))
    .map(toDTO).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export async function getCategoryById(id, { signal } = {}) {
  const categories = await prepare(signal)
  return toDTO(await findActive(categories, id, `/api/categorias/${id}`, signal))
}

export async function getCategoryByName(nombre, { signal, ignorarMayusculas = true } = {}) {
  const route = '/api/categorias/buscar'
  const categories = await prepare(signal)
  const name = await validateName(nombre, route, signal)
  const category = categories.find((item) => !inactiveIds.has(item.id) && (
    ignorarMayusculas ? item.nombre.toLowerCase() === name.toLowerCase() : item.nombre === name
  ))
  if (!category) await fail('error-categoria-no-encontrada', route, { signal })
  return toDTO(category)
}

export async function createCategory({ nombre }, { signal } = {}) {
  const categories = await prepare(signal)
  const route = '/api/categorias'
  const name = await validateName(nombre, route, signal)
  if (categories.some((item) => item.nombre.toLowerCase() === name.toLowerCase())) {
    await fail('error-categoria-duplicada', route, { signal })
  }
  signal?.throwIfAborted()
  const category = { id: Math.max(0, ...categories.map((item) => item.id)) + 1, nombre: name }
  categories.push(category)
  return toDTO(category)
}

export async function updateCategory(id, { nombre }, { signal } = {}) {
  const categories = await prepare(signal)
  const route = `/api/categorias/${id}`
  const category = await findActive(categories, id, route, signal)
  const name = await validateName(nombre, route, signal)
  if (categories.some((item) => item.id !== category.id && item.nombre.toLowerCase() === name.toLowerCase())) {
    await fail('error-categoria-duplicada', route, { signal })
  }
  signal?.throwIfAborted()
  const products = await loadProductStore()
  signal?.throwIfAborted()
  category.nombre = name
  products.filter((product) => product.categoriaId === category.id)
    .forEach((product) => { product.categoria = name })
  notifyCatalogChanged()
  return toDTO(category)
}

export async function deleteCategory(id, { signal } = {}) {
  const categories = await prepare(signal)
  const route = `/api/categorias/${id}`
  const category = await findActive(categories, id, route, signal)
  const products = await loadProductStore()
  if (products.some((product) => Number(product.categoriaId) === category.id)) {
    await fail('error-categoria-en-uso', route, { signal })
  }
  signal?.throwIfAborted()
  inactiveIds.add(category.id)
  // Simula 204 No Content: no devuelve DTO ni modifica el archivo JSON.
}
