
import './FavoriteButton.css'

function FavoriteButton({
  active = false,
  busy = false,
  onClick,
  productName = 'Este producto',
}) {
  return (
    <button
      className={`favorite-button${active ? ' is-active' : ''}`}
      type="button"
      aria-label={
        active
          ? `Quitar ${productName} de favoritos`
          : `Agregar ${productName} a favoritos`
      }
      aria-pressed={active}
      disabled={busy}
      onClick={onClick}
      title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>
    </button>
  )
}

export default FavoriteButton
