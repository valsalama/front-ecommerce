import { MockApiError, readJson, wait } from './http'

export const DEMO_ACCOUNTS = {
  user: {
    mail: 'benja@trama.com',
    contrasenia: 'trama123',
    label: 'Usuario',
  },
  admin: {
    mail: 'admin@trama.com',
    contrasenia: 'admin123',
    label: 'Administrador',
  },
}

async function getErrorPayload(path) {
  return readJson(path)
}

export async function login(credentials) {
  await wait()

  const account = Object.values(DEMO_ACCOUNTS).find(
    (candidate) =>
      candidate.mail === credentials.mail.trim().toLowerCase() &&
      candidate.contrasenia === credentials.contrasenia,
  )

  if (!account) {
    throw new MockApiError(await getErrorPayload('/data/error-login.json'))
  }

  const access = account === DEMO_ACCOUNTS.admin ? 'ADMIN' : 'USUARIO'
  const responsePath =
    access === 'ADMIN'
      ? '/data/login-admin-response.json'
      : '/data/login-response.json'
  const response = await readJson(responsePath)

  return { response, access }
}

export async function register(data) {
  await wait(550)

  const users = await readJson('/data/usuarios.json')
  const duplicated = users.some(
    (user) =>
      user.mail.toLowerCase() === data.mail.trim().toLowerCase() ||
      user.nombreUsuario.toLowerCase() === data.nombreUsuario.trim().toLowerCase(),
  )

  if (duplicated) {
    throw new MockApiError(await getErrorPayload('/data/error-registro-duplicado.json'))
  }

  const responseTemplate = await readJson('/data/registro-response.json')
  return {
    ...responseTemplate,
    nombreUsuario: data.nombreUsuario.trim(),
    mail: data.mail.trim().toLowerCase(),
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
  }
}
