import { useState } from 'react'
import { Link } from 'react-router-dom'
import FeedbackMessage from '../ui/FeedbackMessage'
import FormField from '../ui/FormField'

function CategoryForm({ initialName = '', editing = false, onSave }) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!name.trim()) { setError('El nombre de la categoría es obligatorio'); return }
    setSubmitting(true)
    try {
      await onSave({ nombre: name.trim() })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="category-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <p className="category-form__intro">Elegí un nombre claro para agrupar las prendas de la colección.</p>
      {error && <FeedbackMessage type="error" title="No pudimos guardar la categoría">{error}</FeedbackMessage>}
      <FormField id="category-name" name="nombre" label="Nombre de la categoría"
        placeholder="Por ejemplo: Accesorios" autoComplete="off"
        value={name} onChange={(event) => { setName(event.target.value); setError('') }}
        disabled={submitting} required error={error && !name.trim() ? error : undefined} />
      <p className="category-form__hint">El nombre es obligatorio y no puede repetirse, aunque cambien las mayúsculas.</p>
      <div className="category-actions">
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear categoría'}
        </button>
        {!submitting && <Link className="button-link button-link--secondary" to="/categorias">Cancelar</Link>}
      </div>
    </form>
  )
}
export default CategoryForm
