
import { Link } from 'react-router-dom'
import AddToCartButton from './carrito/AddToCartButton'
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
  detalleUrl,
}) {
  const disponible = stock > 0
  // Si se pasa detalleUrl, la imagen y el nombre llevan al detalle del producto.
  const linkTo = (content) => (detalleUrl ? <Link to={detalleUrl}>{content}</Link> : content)

  return (
    <article className="product-card">
      <div className="product-card__media">
        {linkTo(
          <img
            src={imagen}
            alt={nombre}
            className="product-card__image"
            loading="lazy"
          />,
        )}

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

        <h3 className="product-card__name">{linkTo(nombre)}</h3>
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

          {/* Botón compartido del módulo carrito (Ian) */}
          <AddToCartButton
            productoId={productoId}
            stock={stock}
            className="product-card__button"
            showFeedback={false}
          >
            Agregar
          </AddToCartButton>
        </div>
      </div>
    </article>
  )
}

export default CardProductos
