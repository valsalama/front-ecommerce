import AddToCartButton from './AddToCartButton'
import { formatPrice } from './formatPrice'

// Prendas que todavía no están en el carrito, para simular el agregado desde
// la misma pantalla mientras el catálogo incorpora el botón.
function CartSuggestions({ products, cart }) {
  const inCart = new Set(cart?.items.map((item) => item.productoId) ?? [])
  const suggestions = products.filter((product) => !inCart.has(product.id))

  if (suggestions.length === 0) return null

  return (
    <section className="cart-suggestions" aria-labelledby="cart-suggestions-title">
      <h2 id="cart-suggestions-title">Sumá más prendas</h2>

      <ul className="cart-suggestions__grid">
        {suggestions.map((product) => {
          const cover = product.fotos?.find((foto) => foto.esPortada) ?? product.fotos?.[0]

          return (
            <li key={product.id} className="cart-suggestion">
              {cover && <img src={cover.url} alt={product.nombre} />}
              <div className="cart-suggestion__info">
                <h3>{product.nombre}</h3>
                <p>{formatPrice(product.precio)}</p>
              </div>
              <AddToCartButton
                productoId={product.id}
                stock={product.stock}
                className="secondary-button"
              >
                Agregar
              </AddToCartButton>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default CartSuggestions
