import { MockApiError } from './http'

const BASE_URL = '/api/usuarios'

// Se retirarán los botones de demostración del formulario.
export const DEMO_ACCOUNTS = {}

async function readResponse(response) {
  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    throw new MockApiError({
      ...data,
      estado: response.status,
      mensaje:
        data?.mensaje ||
        data?.message ||
        `No se pudo completar la solicitud (${response.status})`,
    })
  }

  return data
}

async function getCsrfToken() {
  const response = await fetch(`${BASE_URL}/csrf`, {
    credentials: 'same-origin',
    cache: 'no-store',
  })

  return readResponse(response)
}

async function post(path, data) {
  const csrf = await getCsrfToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    ...(data !== undefined && {
      body: JSON.stringify(data),
    }),
  })

  return readResponse(response)
}

export async function getSession({ signal } = {}) {
  const response = await fetch(`${BASE_URL}/me`, {
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) {
    return null
  }

  const data = await readResponse(response)

  return {
    response: { usuario: data.usuario },
    access: data.access,
  }
}

export async function login(credentials) {
  await post('/login', {
    mail: credentials.mail.trim().toLowerCase(),
    contrasenia: credentials.contrasenia,
  })

  const session = await getSession()

  if (!session) {
    throw new Error('No se pudo recuperar la sesión. Intentá nuevamente.')
  }

  return session
}

export async function register(data) {
  return post('/registro', {
    nombreUsuario: data.nombreUsuario.trim(),
    mail: data.mail.trim().toLowerCase(),
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    contrasenia: data.contrasenia,
  })
}

export async function logout() {
  await post('/logout')
}