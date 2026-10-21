import { readJson, wait } from './http'

export async function getCategories({ signal } = {}) {
  await wait(300, signal)
  return readJson('/data/categorias.json', { signal })
}
