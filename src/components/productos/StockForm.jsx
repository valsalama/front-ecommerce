import { useState } from 'react'

// Acción de PATCH /api/productos/{id}/stock dentro de la tabla de administración.
function StockForm({ producto, onSubmit }) {
  const [stock, setStock] = useState(String(producto.stock))
  const [saving, setSaving] = useState(false)
  const changed = stock !== String(producto.stock)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSubmit(producto, stock)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="stock-form" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor={`stock-${producto.id}`}>Stock de {producto.nombre}</label>
      <input id={`stock-${producto.id}`} type="number" step="1" value={stock}
        onChange={(event) => setStock(event.target.value)} />
      <button type="submit" disabled={!changed || saving}>{saving ? '…' : 'Guardar'}</button>
    </form>
  )
}

export default StockForm
