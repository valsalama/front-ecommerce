import { useEffect, useRef, useState } from 'react'
import FeedbackMessage from '../ui/FeedbackMessage'

function DeleteCategoryConfirm({ category, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  async function handleDelete() {
    setSubmitting(true)
    setError('')
    try { await onConfirm() } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }
  return (
    <dialog ref={dialogRef} className="category-dialog" aria-labelledby="delete-category-title"
      onCancel={(event) => { event.preventDefault(); if (!submitting) onCancel() }}>
      <p className="category-kicker">Administración de categorías</p>
      <h2 id="delete-category-title">¿Eliminar {category.nombre}?</h2>
      <p>La categoría dejará de estar disponible. Si tiene productos asociados, no se podrá eliminar.</p>
      {error && <FeedbackMessage type="error" title="No se pudo eliminar">{error}</FeedbackMessage>}
      <div className="category-actions">
        <button className="secondary-button" type="button" disabled={submitting} onClick={onCancel} autoFocus>Cancelar</button>
        <button className="primary-button category-danger" type="button" disabled={submitting} onClick={handleDelete}>
          {submitting ? 'Eliminando…' : 'Confirmar eliminación'}
        </button>
      </div>
    </dialog>
  )
}
export default DeleteCategoryConfirm
