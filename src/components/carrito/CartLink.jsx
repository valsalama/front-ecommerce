import { NavLink } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import './carrito.css'

// Acceso al carrito con la cantidad de prendas, pensado para el encabezado.
function CartLink() {
  const { itemCount } = useCart()

  return (
    <NavLink
      to="/carrito"
      className={({ isActive }) => `cart-link${isActive ? ' active' : ''}`}
      aria-label={`Carrito, ${itemCount} ${itemCount === 1 ? 'prenda' : 'prendas'}`}
    >
      Carrito
      <span className="cart-link__count" aria-hidden="true">
        {itemCount}
      </span>
    </NavLink>
  )
}

export default CartLink
