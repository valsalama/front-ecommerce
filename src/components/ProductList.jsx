import productos from '../data/products.json'
import CardProductos from './CardProductos'
import './ProductList.css'

function ProductList() {
  return (
    <section className="product-list" id="productos" aria-labelledby="product-list-title">
      <div className="product-list__heading">
        <div>
          <p className="product-list__eyebrow">Selección de temporada</p>
          <h2 id="product-list-title">Nuestros productos</h2>
        </div>
        <p>{productos.length} prendas</p>
      </div>

      <div className="products-grid">
        {productos.map((producto) => (
          <CardProductos
            key={producto.id}
            nombre={producto.nombre}
            descripcion={producto.descripcion}
            precio={producto.precio}
            categoria={producto.categoria}
            imagen={producto.imagen}
            stock={producto.stock}
          >
            {producto.entregaGratis && (
              <span className="product-badge product-badge--shipping">
                Entrega gratis
              </span>
            )}

            {producto.compraInternacional && (
              <span className="product-badge product-badge--international">
                Compra internacional
              </span>
            )}
          </CardProductos>
        ))}
      </div>
    </section>
  )
}

export default ProductList
