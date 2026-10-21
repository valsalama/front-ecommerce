import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('Contrato y operaciones del servicio de categorías con JSON locales', async (t) => {
  const originalFetch = globalThis.fetch
  const originalWindow = globalThis.window
  globalThis.window = { setTimeout: (callback) => setTimeout(callback, 0), clearTimeout }
  globalThis.fetch = async (path, { signal } = {}) => {
    signal?.throwIfAborted()
    const text = await readFile(new URL(`../public${path}`, import.meta.url), 'utf8')
    return new Response(text, { status: 200 })
  }
  t.after(() => { globalThis.fetch = originalFetch; globalThis.window = originalWindow })
  const api = await import('../src/services/categoryService.js')
  const rejectsWith = (action, status) => assert.rejects(action, (error) => {
    assert.equal(error.name, 'MockApiError')
    assert.equal(error.status, status)
    assert.deepEqual(Object.keys(error.payload).sort(), ['error', 'errores', 'estado', 'fecha', 'mensaje', 'ruta'])
    return true
  })
  let created

  await t.test('lista inicial ordenada y DTO sin campos agregados', async () => {
    const items = await api.getCategories()
    assert.equal(items.length, 6)
    assert.equal(items[0].nombre, 'Abrigos')
    for (const item of items) assert.deepEqual(Object.keys(item).sort(), ['id', 'nombre'])
    items[0].nombre = 'CAMBIO EXTERNO'
    assert.equal((await api.getCategoryById(4)).nombre, 'Abrigos')
  })
  await t.test('consulta por ID y búsqueda exacta con/sin mayúsculas', async () => {
    assert.equal((await api.getCategoryById('1')).nombre, 'Remeras')
    assert.equal((await api.getCategoryByName(' remeras ')).id, 1)
    assert.equal((await api.getCategoryByName('Remeras', { ignorarMayusculas: false })).id, 1)
    await rejectsWith(api.getCategoryByName('remeras', { ignorarMayusculas: false }), 404)
    await rejectsWith(api.getCategoryByName('Rem'), 404)
  })
  await t.test('IDs inexistentes o inválidos y nombre vacío', async () => {
    await rejectsWith(api.getCategoryById(9999), 404)
    await rejectsWith(api.getCategoryById(0), 400)
    await rejectsWith(api.getCategoryById('abc'), 400)
    await rejectsWith(api.getCategoryByName(' '), 400)
    await rejectsWith(api.createCategory({ nombre: ' ' }), 400)
  })
  await t.test('alta, normalización y duplicados ignorando mayúsculas', async () => {
    created = await api.createCategory({ nombre: ' Accesorios ' })
    assert.deepEqual(created, { id: 7, nombre: 'Accesorios' })
    await rejectsWith(api.createCategory({ nombre: 'accesorios' }), 409)
    await rejectsWith(api.createCategory({ nombre: 'REMERAS' }), 409)
  })
  await t.test('edición conserva ID, detecta duplicados y permite el mismo nombre', async () => {
    await rejectsWith(api.updateCategory(created.id, { nombre: 'Camisas' }), 409)
    await rejectsWith(api.updateCategory(9999, { nombre: 'Otro' }), 404)
    const edited = await api.updateCategory(created.id, { nombre: ' Accesorios de verano ' })
    assert.deepEqual(edited, { id: created.id, nombre: 'Accesorios de verano' })
    assert.equal((await api.updateCategory(created.id, { nombre: 'ACCESORIOS DE VERANO' })).id, created.id)
    assert.equal((await api.getCategories()).length, 7)
  })
  await t.test('categoría con productos no puede eliminarse', async () => {
    await rejectsWith(api.deleteCategory(1), 409)
    assert.equal((await api.getCategoryById(1)).nombre, 'Remeras')
  })
  await t.test('baja sin contenido, exclusión del listado y reserva del nombre', async () => {
    assert.equal(await api.deleteCategory(created.id), undefined)
    assert.equal((await api.getCategories()).length, 6)
    await rejectsWith(api.getCategoryById(created.id), 404)
    await rejectsWith(api.getCategoryByName('ACCESORIOS DE VERANO'), 404)
    await rejectsWith(api.deleteCategory(created.id), 404)
    await rejectsWith(api.updateCategory(created.id, { nombre: 'Otro' }), 404)
    await rejectsWith(api.createCategory({ nombre: 'Accesorios de verano' }), 409)
  })
  await t.test('vacío/error demostrativos no destruyen los datos', async () => {
    assert.deepEqual(await api.getCategories({ mode: 'empty' }), [])
    await rejectsWith(api.getCategories({ mode: 'error' }), 500)
    assert.equal((await api.getCategories()).length, 6)
  })
  await t.test('una solicitud cancelada no crea una categoría', async () => {
    const controller = new AbortController()
    const pending = api.createCategory({ nombre: 'Cancelada' }, { signal: controller.signal })
    controller.abort()
    await assert.rejects(pending, { name: 'AbortError' })
    await rejectsWith(api.getCategoryByName('Cancelada'), 404)
  })
})
