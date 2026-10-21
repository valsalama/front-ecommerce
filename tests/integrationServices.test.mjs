import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('Integración de categorías, catálogo, fotos, favoritos, carrito y órdenes', async (t) => {
  const originalFetch = globalThis.fetch
  const originalWindow = globalThis.window
  let failOrders = false
  globalThis.window = { setTimeout: (callback) => setTimeout(callback, 0), clearTimeout }
  globalThis.fetch = async (path, { signal } = {}) => {
    signal?.throwIfAborted()
    if (failOrders && path === '/data/orders.json') throw new Error('Historial no disponible')
    return new Response(await readFile(new URL(`../public${path}`, import.meta.url), 'utf8'))
  }
  t.after(() => { globalThis.fetch = originalFetch; globalThis.window = originalWindow })
  const products = await import('../src/services/productService.js')
  const categories = await import('../src/services/categoryService.js')
  const photos = await import('../src/services/photoService.js')
  const favorites = await import('../src/services/favoriteService.js')
  const carts = await import('../src/services/cartService.js')
  const orders = await import('../src/services/orderService.js')
  const category = await categories.createCategory({ nombre: 'Integración' })
  const data = { nombre: 'Prenda de prueba', descripcion: 'Prenda nueva', precio: 100, stock: 5, categoriaId: category.id, usuarioId: 1, fotos: ['https://img.ejemplo.com/prenda.jpg'] }
  const product = await products.createProduct(data)

  await t.test('categoría nueva y producto nuevo disponibles en todos los módulos', async () => {
    assert.equal((await photos.getPhotoProduct(product.id)).id, product.id)
    await favorites.addFavorite(1, product.id)
    assert.equal((await favorites.getFavoritesByUser(1)).find((item) => item.productoId === product.id).precioProducto, 100)
    await assert.rejects(categories.deleteCategory(category.id), { status: 409 })
    await categories.updateCategory(category.id, { nombre: 'Nombre actualizado' })
    assert.equal((await products.getProductById(product.id)).categoria, 'Nombre actualizado')
  })
  await t.test('fotos y portada compartidas; DELETE sin contenido', async () => {
    const list = await photos.addPhotos(product.id, { usuarioId: 1, fotos: ['https://img.ejemplo.com/otra.png'] })
    await photos.setCoverPhoto(product.id, list[1].id, 1)
    assert.equal(products.getCoverUrl(await products.getProductById(product.id)), list[1].url)
    assert.equal(await photos.deletePhoto(product.id, list[1].id, 1), undefined)
    assert.equal((await products.getProductById(product.id)).fotos.length, 1)
  })
  await t.test('precio y stock actuales en favoritos y carrito', async () => {
    await carts.clearCart(1)
    await carts.addItem({ usuarioId: 1, productoId: product.id, cantidad: 2 })
    await products.updateProduct(product.id, { ...data, precio: 150 })
    assert.equal((await favorites.getFavoritesByUser(1)).find((item) => item.productoId === product.id).precioProducto, 150)
    assert.equal((await carts.getCartByUser(1)).total, 300)
    await products.updateProductStock(product.id, { usuarioId: 1, stock: 0 })
    assert.equal((await favorites.getFavoritesByUser(1)).find((item) => item.productoId === product.id).stockDisponible, false)
    await assert.rejects(carts.checkoutCart(1), { status: 400 })
    assert.equal((await carts.getCartByUser(1)).items.length, 1)
    await products.updateProductStock(product.id, { usuarioId: 1, stock: 5 })
  })
  await t.test('fallo del historial conserva stock y carrito; reintento genera orden exacta', async () => {
    failOrders = true
    await assert.rejects(orders.checkoutOrder(1, { items: [] }), /Historial no disponible/)
    assert.equal((await carts.getCartByUser(1)).total, 300)
    assert.equal((await products.getProductById(product.id)).stock, 5)
    failOrders = false
    const { order, checkout } = await orders.checkoutOrder(1, { items: [] })
    assert.equal(order.total, 300)
    assert.equal(checkout.total, order.total)
    assert.equal(order.detalles[0].cantidad, 2)
    assert.equal(order.detalles[0].precioUnitario, 150)
    assert.equal((await products.getProductById(product.id)).stock, 3)
    assert.equal((await carts.getCartByUser(1)).items.length, 0)
  })
  await t.test('producto eliminado desaparece de favoritos y carrito; ID no se reutiliza', async () => {
    await carts.addItem({ usuarioId: 1, productoId: product.id, cantidad: 1 })
    await products.deleteProduct(product.id, 1)
    assert.equal((await carts.getCartByUser(1)).items.length, 0)
    assert.equal((await favorites.getFavoritesByUser(1)).some((item) => item.productoId === product.id), false)
    assert.ok((await products.createProduct(data)).id > product.id)
    await favorites.clearFavorites(1)
    assert.deepEqual(await favorites.getFavoritesByUser(1), [])
  })
})
