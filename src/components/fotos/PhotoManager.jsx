import './fotos.css'
import { useCallback, useEffect, useState } from 'react'
import { addPhotos, deletePhoto, getPhotos, setCoverPhoto } from '../../services/photoService'
import { getPhotoUrlError, MAX_PHOTOS_PER_PRODUCT } from '../../services/photoRules'
import FeedbackMessage from '../ui/FeedbackMessage'
import LoadingState from '../ui/LoadingState'

// Gestión de fotos de un producto: consultar, agregar por URL, elegir portada y
// eliminar. Cubre los cuatro endpoints de FotoController.
function PhotoManager({ productoId, usuarioId }) {
  const [state, setState] = useState({ status: 'loading', photos: [], error: '' })
  const [urls, setUrls] = useState([''])
  const [formError, setFormError] = useState('')
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [broken, setBroken] = useState({})

  useEffect(() => {
    const controller = new AbortController()
    getPhotos(productoId, { signal: controller.signal })
      .then((photos) => setState({ status: 'success', photos, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', photos: [], error: error.message })
      })
    return () => controller.abort()
  }, [productoId])

  const run = useCallback(async (action, successMessage) => {
    setBusy(true)
    setMessage(null)
    setFormError('')

    try {
      const photos = await action()
      setState({ status: 'success', photos, error: '' })
      setMessage({ type: 'success', text: successMessage })
      return true
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      return false
    } finally {
      setBusy(false)
    }
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    const filled = urls.map((url) => url.trim()).filter(Boolean)
    const invalid = filled.map(getPhotoUrlError).find(Boolean)
    setMessage(null)

    if (filled.length === 0) return setFormError('Debe indicar al menos una foto')
    if (invalid) return setFormError(invalid)

    setFormError('')
    const ok = await run(
      () => addPhotos(productoId, { usuarioId, fotos: filled }),
      filled.length === 1 ? 'Se agregó la foto.' : `Se agregaron ${filled.length} fotos.`,
    )
    if (ok) setUrls([''])
  }

  const { status, photos } = state
  const previewable = urls.filter((url) => url.trim() && !getPhotoUrlError(url))

  return (
    <div className="photo-manager">
      {status === 'loading' && <LoadingState label="Cargando fotos…" />}
      {status === 'error' && <FeedbackMessage type="error" title="No pudimos cargar las fotos">{state.error}</FeedbackMessage>}
      {message && <FeedbackMessage type={message.type} title={message.type === 'success' ? 'Listo' : 'No se pudo completar la acción'}>{message.text}</FeedbackMessage>}

      {status === 'success' && (
        <>
          <p className="photo-manager__count" aria-live="polite">{photos.length} de {MAX_PHOTOS_PER_PRODUCT} fotos</p>

          {photos.length === 0 ? (
            <div className="empty-state"><div className="empty-state__content">
              <h2>Este producto no tiene fotos</h2>
              <p>Agregá al menos una URL de imagen para mostrarlo en el catálogo.</p>
            </div></div>
          ) : (
            <ul className="photo-grid">
              {photos.map((photo) => (
                <li key={photo.id} className="photo-card">
                  <div className="photo-card__image">
                    {broken[photo.id] ? <span>No se pudo cargar la imagen</span> : (
                      <img src={photo.url} alt={`Foto ${photo.id}`} onError={() => setBroken((current) => ({ ...current, [photo.id]: true }))} />
                    )}
                    {photo.esPortada && <span className="photo-card__badge">Portada</span>}
                  </div>
                  <div className="photo-card__actions">
                    {!photo.esPortada && (
                      <button type="button" className="secondary-button" disabled={busy} onClick={() => run(() => setCoverPhoto(productoId, photo.id, usuarioId), 'Se actualizó la portada.')}>
                        Hacer portada
                      </button>
                    )}
                    {toDelete === photo.id ? (
                      <>
                        <button type="button" className="primary-button photo-danger" disabled={busy} onClick={async () => { await run(() => deletePhoto(productoId, photo.id, usuarioId), 'Se eliminó la foto.'); setToDelete(null) }}>Confirmar</button>
                        <button type="button" className="secondary-button" disabled={busy} onClick={() => setToDelete(null)}>Cancelar</button>
                      </>
                    ) : (
                      <button type="button" className="secondary-button photo-danger-outline" disabled={busy} onClick={() => setToDelete(photo.id)}>Eliminar</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className="photo-form" onSubmit={handleAdd} noValidate>
            <h2>Agregar fotos</h2>
            <p className="photo-form__hint">Se cargan por URL (http o https, terminada en .jpg, .jpeg o .png). No se suben archivos.</p>
            {urls.map((url, index) => (
              <div className="photo-form__row" key={index}>
                <input
                  className="search-field"
                  type="url"
                  inputMode="url"
                  aria-label={`URL de la nueva foto ${index + 1}`}
                  aria-invalid={Boolean(formError)}
                  placeholder="https://…/foto.jpg"
                  value={url}
                  onChange={(event) => setUrls(urls.map((item, i) => (i === index ? event.target.value : item)))}
                  disabled={busy}
                />
                {urls.length > 1 && <button type="button" className="secondary-button" onClick={() => setUrls(urls.filter((_, i) => i !== index))}>Quitar</button>}
              </div>
            ))}
            {formError && <small className="form-field__error" role="alert">{formError}</small>}

            {previewable.length > 0 && (
              <div className="photo-preview" aria-label="Vista previa">
                {previewable.map((url) => <img key={url} src={url} alt="Vista previa de la nueva foto" />)}
              </div>
            )}

            <div className="photo-form__actions">
              <button type="button" className="secondary-button" onClick={() => setUrls([...urls, ''])} disabled={busy || photos.length + urls.length >= MAX_PHOTOS_PER_PRODUCT}>+ Otra URL</button>
              <button type="submit" className="primary-button" disabled={busy}>{busy ? 'Guardando…' : 'Guardar fotos'}</button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default PhotoManager
