import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/useCart'
import './carrito.css'

// Botón reutilizable para el catálogo, el detalle de producto y favoritos.
// Uso: <AddToCartButton productoId={producto.id} stock={producto.stock} />
// Sin sesión lleva al login y, al ingresar, vuelve a la pantalla de origen.
function AddToCartButton({
  productoId,
  stock,
  cantidad = 1,
  className = 'primary-button',
  showFeedback = true,
  children = 'Agregar al carrito',
}) {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const soldOut = stock !== undefined && stock <= 0

  useEffect(() => {
    if (status !== 'added') return undefined

    const timeoutId = window.setTimeout(() => setStatus('idle'), 2500)
    return () => window.clearTimeout(timeoutId)
  }, [status])

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }

    setStatus('adding')
    setError('')

    try {
      await addItem(productoId, cantidad)
      setStatus('added')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }

  const label = soldOut
    ? 'Agotado'
    : status === 'adding'
      ? 'Agregando…'
      : status === 'added'
        ? 'Agregado ✓'
        : children

  return (
    <div className="add-to-cart">
      <button
        className={className}
        type="button"
        onClick={handleClick}
        disabled={soldOut || status === 'adding'}
      >
        {label}
      </button>

      {showFeedback && (
        <p className="add-to-cart__message" aria-live="polite">
          {status === 'added' && <Link to="/carrito">Ver carrito</Link>}
          {status === 'error' && <span className="is-error">{error}</span>}
        </p>
      )}
    </div>
  )
}

export default AddToCartButton
