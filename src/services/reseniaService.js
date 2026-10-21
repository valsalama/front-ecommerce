import { MockApiError, readJson, wait } from './http'
import { getProducts } from './productService'
import { getUsers } from './userService'

export const MAX_COMMENT_LENGTH = 500

const FORBIDDEN_WORDS = ['estafa', 'basura', 'horrible']

// Copia en memoria de /data/resenias.json. Las reseñas nuevas viven mientras
// la aplicación esté abierta; no se escriben en el archivo.
let storePromise = null

function loadStore() {
  if (!storePromise) {
    storePromise = readJson('/data/resenias.json').then((reviews) => [...reviews])
    storePromise.catch(() => {
      storePromise = null
    })
  }

  return storePromise
}

// Reproduce la forma de ErrorRespuestaDTO que devuelve el backend.
function buildError(estado, error, mensaje, ruta, errores = null) {
  return new MockApiError({
    fecha: new Date().toISOString().slice(0, 19),
    estado,
    error,
    mensaje,
    ruta,
    errores,
  })
}

async function assertProductExists(productoId, ruta, signal) {
  const products = await getProducts({ signal })

  if (!products.some((product) => product.id === Number(productoId))) {
    throw buildError(404, 'Not Found', 'Producto no encontrado', ruta)
  }
}

// Mismas reglas y mensajes que las anotaciones de ReseniaDTO.
function validateFields({ calificacion, comentario, productoId, usuarioId }) {
  const errores = {}

  if (calificacion === null || calificacion === undefined) {
    errores.calificacion = 'La calificación es obligatoria'
  } else if (calificacion < 1) {
    errores.calificacion = 'La calificación mínima es 1'
  } else if (calificacion > 5) {
    errores.calificacion = 'La calificación máxima es 5'
  }

  if (comentario && comentario.length > MAX_COMMENT_LENGTH) {
    errores.comentario = 'El comentario no puede superar los 500 caracteres'
  }

  if (productoId === null || productoId === undefined) {
    errores.productoId = 'El producto es obligatorio'
  } else if (productoId <= 0) {
    errores.productoId = 'El identificador del producto debe ser positivo'
  }

  if (usuarioId === null || usuarioId === undefined) {
    errores.usuarioId = 'El usuario es obligatorio'
  } else if (usuarioId <= 0) {
    errores.usuarioId = 'El identificador del usuario debe ser positivo'
  }

  return errores
}

// El backend reemplaza estas palabras por *** antes de guardar el comentario.
function filterBadWords(comentario) {
  if (!comentario || !comentario.trim()) return comentario

  return FORBIDDEN_WORDS.reduce(
    (text, word) => text.replace(new RegExp(word, 'gi'), '***'),
    comentario,
  )
}

// GET /api/resenias/producto/{productoId}
// mode: 'data' (por defecto), 'empty' o 'error', para demostrar los estados.
export async function getReviewsByProduct(productoId, { mode = 'data', signal } = {}) {
  const ruta = `/api/resenias/producto/${productoId}`

  if (mode === 'error') {
    await wait(400, signal)
    throw buildError(500, 'Internal Server Error', 'Ocurrió un error inesperado', ruta)
  }

  await assertProductExists(productoId, ruta, signal)

  if (mode === 'empty') return []

  const reviews = await loadStore()
  return reviews.filter((review) => review.productoId === Number(productoId))
}

// GET /api/resenias/producto/{productoId}/promedio
// Igual que el backend, devuelve 0 cuando el producto no tiene reseñas.
export async function getAverageByProduct(productoId, options = {}) {
  const reviews = await getReviewsByProduct(productoId, options)

  if (reviews.length === 0) return 0

  const total = reviews.reduce((sum, review) => sum + review.calificacion, 0)
  return total / reviews.length
}

// POST /api/resenias
export async function createReview(data, { signal } = {}) {
  const ruta = '/api/resenias'

  await wait(350, signal)

  const errores = validateFields(data)
  if (Object.keys(errores).length > 0) {
    throw buildError(400, 'Bad Request', 'La solicitud contiene datos inválidos', ruta, errores)
  }

  const [products, users] = await Promise.all([
    getProducts({ signal }),
    getUsers({ signal }),
  ])

  if (!products.some((product) => product.id === data.productoId)) {
    throw buildError(404, 'Not Found', 'Producto no encontrado', ruta)
  }

  if (!users.some((user) => user.id === data.usuarioId)) {
    throw buildError(404, 'Not Found', 'Usuario no encontrado', ruta)
  }

  const reviews = await loadStore()
  const duplicated = reviews.some(
    (review) =>
      review.usuarioId === data.usuarioId && review.productoId === data.productoId,
  )

  if (duplicated) {
    throw buildError(
      409,
      'Conflict',
      'El usuario ya dejó una reseña para este producto',
      ruta,
    )
  }

  const nextId = reviews.reduce((max, review) => Math.max(max, review.id), 0) + 1
  const created = {
    id: nextId,
    calificacion: data.calificacion,
    comentario: filterBadWords(data.comentario ?? null),
    productoId: data.productoId,
    usuarioId: data.usuarioId,
  }

  reviews.push(created)
  return created
}
