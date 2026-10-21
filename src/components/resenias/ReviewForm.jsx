import { useState } from 'react'
import FeedbackMessage from '../ui/FeedbackMessage'
import { MAX_COMMENT_LENGTH } from '../../services/reseniaService'
import StarRatingInput from './StarRatingInput'

function ReviewForm({ onSubmit }) {
  const [calificacion, setCalificacion] = useState(null)
  const [comentario, setComentario] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [published, setPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const commentTooLong = comentario.length > MAX_COMMENT_LENGTH

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setFormError('')
    setPublished(false)

    try {
      await onSubmit({ calificacion, comentario: comentario.trim() || null })
      setCalificacion(null)
      setComentario('')
      setPublished(true)
    } catch (error) {
      setFieldErrors(error.payload?.errores ?? {})
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <h3>Dejá tu reseña</h3>

      <StarRatingInput
        value={calificacion}
        onChange={setCalificacion}
        error={fieldErrors.calificacion}
        disabled={submitting}
      />

      <label className="form-field" htmlFor="resenia-comentario">
        <span>Comentario (opcional)</span>
        <textarea
          id="resenia-comentario"
          rows="4"
          value={comentario}
          placeholder="Contanos cómo te quedó, el talle, la calidad…"
          aria-invalid={Boolean(fieldErrors.comentario) || commentTooLong}
          aria-describedby="resenia-comentario-ayuda"
          disabled={submitting}
          onChange={(event) => setComentario(event.target.value)}
        />
        <small
          id="resenia-comentario-ayuda"
          className={commentTooLong ? 'form-field__error' : 'review-form__counter'}
        >
          {fieldErrors.comentario ?? `${comentario.length}/${MAX_COMMENT_LENGTH} caracteres`}
        </small>
      </label>

      {formError && (
        <FeedbackMessage title="No pudimos publicar tu reseña" type="error">
          {formError}
        </FeedbackMessage>
      )}

      {published && (
        <FeedbackMessage title="Reseña publicada" type="success">
          Gracias por compartir tu opinión.
        </FeedbackMessage>
      )}

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Publicando…' : 'Publicar reseña'}
      </button>
    </form>
  )
}

export default ReviewForm
