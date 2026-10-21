import { MockApiError, readJson, wait } from './http'

export async function getUsers({ mode = 'data', signal } = {}) {
  await wait(420, signal)

  if (mode === 'error') {
    const payload = await readJson('/data/error-usuarios.json', { signal })
    throw new MockApiError(payload)
  }

  const path = mode === 'empty' ? '/data/usuarios-vacio.json' : '/data/usuarios.json'
  return readJson(path, { signal })
}

export async function getUserById(id, { signal } = {}) {
  const users = await getUsers({ signal })
  const user = users.find((candidate) => candidate.id === Number(id))

  if (!user) {
    const payload = await readJson('/data/error-usuario-no-encontrado.json', { signal })
    throw new MockApiError(payload)
  }

  return user
}
