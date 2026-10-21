import { MockApiError, readJson, wait } from './http'

export async function getProducts({ signal } = {}) {
  await wait(300, signal)
  return readJson('/data/productos.json', { signal })
}

export async function getProductById(id, { signal } = {}) {
  const products = await getProducts({ signal })
  const product = products.find((candidate) => candidate.id === Number(id))

  if (!product) {
    const payload = await readJson('/data/error-producto-no-encontrado.json', { signal })
    throw new MockApiError(payload)
  }

  return product
}
