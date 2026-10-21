
import FavoriteButton from './FavoriteButton'
import './CardProductos.css'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function CardProductos({
  productoId,
  nombre,
  descripcion,
  precio,
  categoria,
  imagen,
  stock,
  children,
  isFavorite = false,
  onToggleFavorite,
  favoriteBusy = false,
}) {
  const disponible = stock > 0

  return (
    <article className="product-card">
      <div className="product-card__media">
        <img
          src={imagen}
          alt={nombre}
          className="product-card__image"
        />

        <span className="product-card__category">{categoria}</span>

        {onToggleFavorite && (
          <div className="product-card__favorite">
            <FavoriteButton
              active={isFavorite}
              busy={favoriteBusy}
              productName={nombre}
              onClick={() => onToggleFavorite(productoId)}
            />
          </div>
        )}
      </div>

      <div className="product-card__content">
        <div className="product-card__badges">{children}</div>

        <h3 className="product-card__name">{nombre}</h3>
        <p className="product-card__description">{descripcion}</p>

        <div className="product-card__footer">
          <div>
            <span className="product-card__price">
              {currencyFormatter.format(precio)}
            </span>

            <span
              className={`product-card__stock ${
                !disponible ? 'is-unavailable' : ''
              }`}
            >
              {disponible ? `${stock} disponibles` : 'Sin stock'}
            </span>
          </div>

          <button
            className="product-card__button"
            type="button"
            disabled={!disponible}
          >
            {disponible ? 'Agregar' : 'Agotado'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default CardProductos
