export class MockApiError extends Error {
  constructor(payload) {
    super(payload.mensaje || 'No pudimos completar la solicitud')
    this.name = 'MockApiError'
    this.status = payload.estado
    this.payload = payload
  }
}

export async function readJson(path, { signal } = {}) {
  const response = await fetch(path, { signal })

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}`)
  }

  return response.json()
}

export function wait(milliseconds = 450, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, milliseconds)

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId)
        reject(new DOMException('Solicitud cancelada', 'AbortError'))
      },
      { once: true },
    )
  })
}
