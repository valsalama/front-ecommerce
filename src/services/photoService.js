import { getPhotoUrlError, MAX_PHOTOS_PER_PRODUCT } from './photoRules.js'
import { MockApiError, readJson, wait } from './http.js'
import { loadProductStore, nextPhotoId, notifyCatalogChanged } from './mockStore.js'

// Las fotos viven dentro de cada producto (ProductoRespuestaDTO.fotos). Estas
// funciones simulan FotoController: reciben URLs, nunca archivos. GET/POST/PATCH
// devuelven FotoRespuestaDTO[] y DELETE no devuelve contenido.
// Productos y fotos comparten el mismo estado de demostración.
const clone = (value) => JSON.parse(JSON.stringify(value))
const base = (productoId) => `/api/productos/${productoId}/fotos`

async function failWith(fixture, ruta, { mensaje } = {}) {
  const payload = await readJson(`/data/${fixture}.json`)
  throw new MockApiError({
    ...payload,
    fecha: new Date().toISOString().slice(0, 19),
    ruta,
    ...(mensaje ? { mensaje } : {}),
  })
}

async function findProduct(productoId, ruta) {
  const products = await loadProductStore()
  const product = products.find((candidate) => candidate.id === Number(productoId))
  if (!product) await failWith('error-producto-no-encontrado', ruta)
  return product
}

async function findEditableProduct(productoId, usuarioId, ruta) {
  const product = await findProduct(productoId, ruta)
  if (product.usuarioId !== Number(usuarioId)) await failWith('error-producto-sin-permiso', ruta)
  return product
}

// Datos mínimos del producto para el encabezado de la pantalla de fotos.
export async function getPhotoProduct(productoId, { signal } = {}) {
  await wait(200, signal)
  const { id, nombre, usuarioId } = await findProduct(productoId, `/api/productos/${productoId}`)
  return { id, nombre, usuarioId }
}

// Garantiza una única portada: si falta, la primera foto toma su lugar.
function ensureCover(photos) {
  if (photos.length > 0 && !photos.some((photo) => photo.esPortada)) photos[0].esPortada = true
}

// GET /api/productos/{productoId}/fotos
export async function getPhotos(productoId, { signal } = {}) {
  await wait(250, signal)
  const product = await findProduct(productoId, base(productoId))
  return clone(product.fotos)
}

// POST /api/productos/{productoId}/fotos  (AgregarFotosDTO: usuarioId, fotos[])
export async function addPhotos(productoId, { usuarioId, fotos }, { signal } = {}) {
  const ruta = base(productoId)
  await wait(300, signal)
  const product = await findEditableProduct(productoId, usuarioId, ruta)
  const urls = (fotos ?? []).map((url) => url.trim()).filter(Boolean)

  if (urls.length === 0) {
    await failWith('error-foto-formato', ruta, { mensaje: 'Debe indicar al menos una foto' })
  }

  const invalid = urls.map(getPhotoUrlError).find(Boolean)
  if (invalid) await failWith('error-foto-formato', ruta, { mensaje: invalid })

  if (product.fotos.length + urls.length > MAX_PHOTOS_PER_PRODUCT) {
    await failWith('error-foto-limite', ruta, { mensaje: `El producto no puede superar las ${MAX_PHOTOS_PER_PRODUCT} fotos` })
  }

  urls.forEach((url) => product.fotos.push({ id: nextPhotoId(), url, esPortada: false }))
  ensureCover(product.fotos)
  notifyCatalogChanged()
  return clone(product.fotos)
}

// PATCH /api/productos/{productoId}/fotos/{fotoId}/portada?usuarioId=
export async function setCoverPhoto(productoId, fotoId, usuarioId, { signal } = {}) {
  const ruta = `${base(productoId)}/${fotoId}/portada`
  await wait(250, signal)
  const product = await findEditableProduct(productoId, usuarioId, ruta)

  if (!product.fotos.some((photo) => photo.id === Number(fotoId))) await failWith('error-foto-no-encontrada', ruta)

  product.fotos.forEach((photo) => {
    photo.esPortada = photo.id === Number(fotoId)
  })
  notifyCatalogChanged()
  return clone(product.fotos)
}

// DELETE /api/productos/{productoId}/fotos/{fotoId}?usuarioId=
export async function deletePhoto(productoId, fotoId, usuarioId, { signal } = {}) {
  const ruta = `${base(productoId)}/${fotoId}`
  await wait(250, signal)
  const product = await findEditableProduct(productoId, usuarioId, ruta)
  const index = product.fotos.findIndex((photo) => photo.id === Number(fotoId))

  if (index === -1) await failWith('error-foto-no-encontrada', ruta)

  product.fotos.splice(index, 1)
  ensureCover(product.fotos)
  notifyCatalogChanged()
  // FotoController responde 204 No Content.
}
