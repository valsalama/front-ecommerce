// Reglas de validación de fotos, iguales a las de FotoService del backend.
export const MAX_PHOTOS_PER_PRODUCT = 10
export const MAX_PHOTO_URL_LENGTH = 500

const IMAGE_URL = /^https?:\/\/[^\s/?#]+(?:\/[^\s?#]*)?\.(?:jpg|jpeg|png)(?:\?[^\s#]*)?$/i

// Devuelve el mensaje de error del backend o una cadena vacía si la URL es válida.
export function getPhotoUrlError(url) {
  const value = typeof url === 'string' ? url.trim() : ''

  if (!value) return 'La URL de la foto es obligatoria'
  if (value.length > MAX_PHOTO_URL_LENGTH) {
    return `La URL de la foto no puede superar los ${MAX_PHOTO_URL_LENGTH} caracteres`
  }
  if (!IMAGE_URL.test(value)) {
    return `La URL debe ser http o https y terminar en .jpg, .jpeg o .png: ${value}`
  }

  return ''
}
