import { MockApiError, readJson, wait } from './http.js'
import { getCategoryById } from './categoryService.js'
import { getPhotoUrlError, MAX_PHOTOS_PER_PRODUCT } from './photoRules.js'
import { loadCartStore, loadProductStore, nextPhotoId, nextProductId, notifyCatalogChanged } from './mockStore.js'

// Simula los 7 endpoints de ProductoController (/api/productos) con datos locales.
// Los cambios (alta, edición, stock, baja) quedan en memoria mientras se navega
// y se reinician al recargar: nunca se escriben los archivos JSON.
// Para conectar la API real alcanza con reemplazar estas funciones por fetch.

const ROUTE = '/api/productos'

const toFotoDTO = ({ id, url, esPortada }) => ({ id, url, esPortada: Boolean(esPortada) })

// ProductoRespuestaDTO: mismos campos y tipos que devuelve el backend.
const toDTO = (producto) => ({
  id: producto.id,
  nombre: producto.nombre,
  descripcion: producto.descripcion,
  precio: Number(producto.precio),
  stock: Number(producto.stock),
  categoriaId: producto.categoriaId,
  categoria: producto.categoria,
  usuarioId: producto.usuarioId,
  nombreUsuario: producto.nombreUsuario,
  fotos: (producto.fotos ?? []).map(toFotoDTO),
})

async function prepare(signal, delay = 300) {
  signal?.throwIfAborted()
  await wait(delay, signal)
  const products = await loadProductStore()
  signal?.throwIfAborted()
  return products
}

// Lanza el ErrorRespuestaDTO del fixture, con la ruta y el mensaje de este caso.
async function fail(fixture, ruta, { signal, mensaje, errores } = {}) {
  const payload = await readJson(`/data/${fixture}.json`, { signal })
  throw new MockApiError({
    ...payload,
    fecha: new Date().toISOString().replace(/Z$/, ''),
    ruta,
    ...(mensaje ? { mensaje } : {}),
    ...(errores ? { errores } : {}),
  })
}

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

// Mismos filtros que la consulta del repositorio: categoría, nombre (contiene,
// sin distinguir mayúsculas) y "con stock".
function applyFilters(products, { categoriaId, nombre, conStock, precioMin, precioMax }) {
  const name = normalize(nombre)
  return products.filter((product) => (
    (!categoriaId || product.categoriaId === Number(categoriaId))
    && (!name || normalize(product.nombre).includes(name))
    && (!conStock || product.stock > 0)
    && (precioMin === undefined || precioMin === '' || product.precio >= Number(precioMin))
    && (precioMax === undefined || precioMax === '' || product.precio <= Number(precioMax))
  ))
}

function sortProducts(products, sort = 'nombre,asc') {
  const [field = 'nombre', direction = 'asc'] = sort.split(',')
  const factor = direction === 'desc' ? -1 : 1
  return [...products].sort((a, b) => {
    const result = field === 'nombre'
      ? a.nombre.localeCompare(b.nombre, 'es')
      : Number(a[field]) - Number(b[field])
    return result * factor
  })
}

// Ejemplo local de Page<ProductoRespuestaDTO>. readPage admite también PageImpl.
// Al conectar la API se debe contrastar el fixture con su serialización real.
function toPage(items, number, size) {
  const totalElements = items.length
  const totalPages = Math.ceil(totalElements / size)
  return {
    content: items.slice(number * size, number * size + size),
    page: { size, number, totalElements, totalPages },
  }
}

// Acepta las dos formas en que Spring puede serializar un Page.
export function readPage(page) {
  const meta = page.page ?? page
  return {
    content: page.content ?? [],
    number: meta.number ?? 0,
    size: meta.size ?? page.content?.length ?? 0,
    totalElements: meta.totalElements ?? page.content?.length ?? 0,
    totalPages: meta.totalPages ?? 1,
  }
}

export const getCoverUrl = (product) =>
  (product.fotos?.find((foto) => foto.esPortada) ?? product.fotos?.[0])?.url ?? ''

// GET /api/productos?categoriaId=&nombre=&conStock=
export async function getProducts({ signal, categoriaId, nombre, conStock, mode = 'data' } = {}) {
  const products = await prepare(signal)
  if (mode === 'error') await fail('error-productos', ROUTE, { signal })
  if (mode === 'empty') return []
  return sortProducts(applyFilters(products, { categoriaId, nombre, conStock })).map(toDTO)
}

// GET /api/productos/buscar?categoriaId=&nombre=&conStock=&precioMin=&precioMax=&page=&size=&sort=
export async function searchProducts({
  signal,
  categoriaId,
  nombre,
  conStock,
  precioMin,
  precioMax,
  page = 0,
  size = 10,
  sort = 'nombre,asc',
  mode = 'data',
} = {}) {
  const route = `${ROUTE}/buscar`
  const products = await prepare(signal)
  if (!Number.isInteger(Number(page)) || Number(page) < 0 || !Number.isInteger(Number(size)) || Number(size) <= 0) {
    await fail('error-producto-invalido', route, { signal, mensaje: 'La página debe ser no negativa y el tamaño debe ser positivo' })
  }
  if (mode === 'error') await fail('error-productos', route, { signal })

  const min = precioMin === '' || precioMin === undefined ? undefined : Number(precioMin)
  const max = precioMax === '' || precioMax === undefined ? undefined : Number(precioMax)
  if (min !== undefined && min < 0) {
    await fail('error-producto-invalido', route, { signal, mensaje: 'El precio minimo no puede ser negativo' })
  }
  if (max !== undefined && max < 0) {
    await fail('error-producto-invalido', route, { signal, mensaje: 'El precio maximo no puede ser negativo' })
  }
  if (min !== undefined && max !== undefined && min > max) {
    await fail('error-producto-invalido', route, { signal })
  }

  const items = mode === 'empty'
    ? []
    : sortProducts(applyFilters(products, { categoriaId, nombre, conStock, precioMin: min, precioMax: max }), sort)
  return toPage(items.map(toDTO), Number(page), Number(size))
}

// GET /api/productos/{id}
export async function getProductById(id, { signal } = {}) {
  const products = await prepare(signal)
  const product = products.find((candidate) => candidate.id === Number(id))
  if (!product) await fail('error-producto-no-encontrado', `${ROUTE}/${id}`, { signal })
  return toDTO(product)
}

// Validaciones de ProductoCrearDTO (@Valid): devuelven 400 con el mapa "errores".
function validateCreateDTO(datos) {
  const errores = {}
  if (!String(datos.nombre ?? '').trim()) errores.nombre = 'El nombre del producto es obligatorio'
  if (!String(datos.descripcion ?? '').trim()) errores.descripcion = 'La descripción del producto es obligatoria'
  if (datos.precio === '' || datos.precio === null || datos.precio === undefined) {
    errores.precio = 'El precio es obligatorio'
  } else if (!Number.isFinite(Number(datos.precio)) || Number(datos.precio) <= 0) {
    errores.precio = 'El precio debe ser mayor a cero'
  }
  if (datos.stock === '' || datos.stock === null || datos.stock === undefined) {
    errores.stock = 'El stock es obligatorio'
  } else if (!Number.isInteger(Number(datos.stock)) || Number(datos.stock) < 0) {
    errores.stock = 'El stock debe ser mayor o igual a cero'
  }
  if (!datos.categoriaId) errores.categoriaId = 'La categoría es obligatoria'
  if (!datos.usuarioId) errores.usuarioId = 'El usuario es obligatorio'
  if (!Array.isArray(datos.fotos)) {
    errores.fotos = 'Las fotos son obligatorias'
  } else if (datos.fotos.length > MAX_PHOTOS_PER_PRODUCT) {
    errores.fotos = `El producto no puede superar las ${MAX_PHOTOS_PER_PRODUCT} fotos`
  } else {
    const invalidPhoto = datos.fotos.map(getPhotoUrlError).find(Boolean)
    if (invalidPhoto) errores.fotos = invalidPhoto
  }
  return errores
}

async function resolveCategory(categoriaId, route, signal) {
  try {
    return await getCategoryById(categoriaId, { signal })
  } catch (error) {
    if (error instanceof MockApiError) error.payload.ruta = route
    throw error
  }
}

async function resolveUser(usuarioId, route, signal) {
  const users = await readJson('/data/usuarios.json', { signal })
  const user = users.find((item) => item.id === Number(usuarioId))
  if (!user) await fail('error-usuario-no-encontrado', route, { signal, mensaje: 'Usuario no encontrado' })
  return user
}

function buildFotos(urls) {
  return urls
    .map((url) => String(url).trim())
    .filter(Boolean)
    .map((url, index) => ({ id: nextPhotoId(), url, esPortada: index === 0 }))
}

async function checkOwner(product, usuarioId, route, signal) {
  if (!usuarioId) {
    await fail('error-producto-invalido', route, { signal, mensaje: 'El ID del usuario es obligatorio' })
  }
  if (product.usuarioId !== Number(usuarioId)) {
    await fail('error-producto-sin-permiso', route, { signal })
  }
}

async function findProduct(products, id, route, signal) {
  const product = products.find((candidate) => candidate.id === Number(id))
  if (!product) await fail('error-producto-no-encontrado', route, { signal })
  return product
}

// POST /api/productos  → 201 con ProductoRespuestaDTO
export async function createProduct(datos, { signal } = {}) {
  const products = await prepare(signal, 450)
  const errores = validateCreateDTO(datos)
  if (Object.keys(errores).length) await fail('error-producto-validacion', ROUTE, { signal, errores })

  const category = await resolveCategory(datos.categoriaId, ROUTE, signal)
  const user = await resolveUser(datos.usuarioId, ROUTE, signal)
  signal?.throwIfAborted()

  const product = {
    id: nextProductId(),
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    categoriaId: category.id,
    categoria: category.nombre,
    usuarioId: user.id,
    nombreUsuario: user.nombreUsuario,
    fotos: buildFotos(datos.fotos),
  }
  products.push(product)
  notifyCatalogChanged()
  return toDTO(product)
}

// PUT /api/productos/{id}  (mismo body que el alta: ProductoCrearDTO)
export async function updateProduct(id, datos, { signal } = {}) {
  const route = `${ROUTE}/${id}`
  const products = await prepare(signal, 450)
  const product = await findProduct(products, id, route, signal)
  await checkOwner(product, datos.usuarioId, route, signal)
  const errores = validateCreateDTO(datos)
  if (Object.keys(errores).length) await fail('error-producto-validacion', route, { signal, errores })

  const category = await resolveCategory(datos.categoriaId, route, signal)
  signal?.throwIfAborted()
  Object.assign(product, {
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    categoriaId: category.id,
    categoria: category.nombre,
    fotos: buildFotos(datos.fotos),
  })
  notifyCatalogChanged()
  return toDTO(product)
}

// PATCH /api/productos/{id}/stock  body: ActualizarStockDTO { usuarioId, stock }
export async function updateProductStock(id, { usuarioId, stock }, { signal } = {}) {
  const route = `${ROUTE}/${id}/stock`
  const products = await prepare(signal, 350)
  if (stock === '' || stock === null || stock === undefined || Number(stock) < 0 || !Number.isInteger(Number(stock))) {
    await fail('error-producto-invalido', route, { signal, mensaje: 'El stock no puede ser negativo' })
  }
  const product = await findProduct(products, id, route, signal)
  await checkOwner(product, usuarioId, route, signal)
  product.stock = Number(stock)
  notifyCatalogChanged()
  return toDTO(product)
}

// DELETE /api/productos/{id}?usuarioId=  → 204 sin cuerpo
export async function deleteProduct(id, usuarioId, { signal } = {}) {
  const route = `${ROUTE}/${id}`
  const products = await prepare(signal, 350)
  const product = await findProduct(products, id, route, signal)
  await checkOwner(product, usuarioId, route, signal)
  const carts = await loadCartStore()
  signal?.throwIfAborted()
  carts.forEach((cart) => {
    cart.items = cart.items.filter((item) => item.productoId !== product.id)
  })
  products.splice(products.indexOf(product), 1)
  notifyCatalogChanged()
}
