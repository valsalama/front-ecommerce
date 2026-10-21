import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import StockForm from '../components/productos/StockForm'
import { formatPrice } from '../components/carrito/formatPrice'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { deleteProduct, getCoverUrl, getProducts, updateProductStock } from '../services/productService'
import '../components/productos/productos.css'

// Administración: listado (GET /api/productos), stock (PATCH /{id}/stock),
// baja (DELETE /{id}?usuarioId=) y accesos a alta, edición (POST / PUT)
// y a la gestión de fotos de Julian.
function AdminProductsPage() {
  const location = useLocation()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.productMessage ?? null)
  const [mode, setMode] = useState('data')
  const [otherUser, setOtherUser] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const dialogRef = useRef(null)
  // El backend sólo deja modificar al usuario que publicó el producto.
  // "Simular otro usuario" manda un usuarioId ajeno para mostrar el 403.
  const usuarioId = otherUser ? 1 : user?.id

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    getProducts({ mode, signal: controller.signal })
      .then((items) => {
        setProducts(items)
        setStatus('success')
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('error')
      })
    return () => controller.abort()
  }, [mode])

  const handleStock = async (producto, stock) => {
    setMessage(null)
    try {
      const updated = await updateProductStock(producto.id, { usuarioId, stock: stock === '' ? '' : Number(stock) })
      setProducts((items) => items.map((item) => (item.id === updated.id ? updated : item)))
      setMessage({ type: 'success', text: `Stock de "${updated.nombre}" actualizado a ${updated.stock}.` })
    } catch (requestError) {
      setMessage({ type: 'error', text: requestError.message })
    }
  }

  const openDelete = (producto) => {
    setToDelete(producto)
    dialogRef.current?.showModal()
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteProduct(toDelete.id, usuarioId)
      setProducts((items) => items.filter((item) => item.id !== toDelete.id))
      setMessage({ type: 'success', text: `"${toDelete.nombre}" se eliminó del catálogo.` })
    } catch (requestError) {
      setMessage({ type: 'error', text: requestError.message })
    } finally {
      setDeleting(false)
      dialogRef.current?.close()
    }
  }

  return (
    <section className="page-shell admin-products" aria-labelledby="admin-products-title">
      <PageHeading eyebrow="Administración · Catálogo" title="Productos"
        description="Publicá prendas nuevas, editá sus datos, actualizá el stock o dalas de baja.">
        <Link className="button-link" to="/admin/productos/nuevo">Nuevo producto</Link>
      </PageHeading>
      <h2 id="admin-products-title" className="visually-hidden">Gestión de productos</h2>

      {message && (
        <FeedbackMessage type={message.type ?? 'success'} title={message.text ?? message} />
      )}

      <div className="products-toolbar">
        <p aria-live="polite">{status === 'success' ? `${products.length} productos publicados` : 'Productos'}</p>
        <details className="products-demo">
          <summary>Probar estados</summary>
          <label htmlFor="admin-products-mode">Respuesta simulada
            <select className="state-select" id="admin-products-mode" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="data">Con datos</option>
              <option value="empty">Lista vacía</option>
              <option value="error">Error del servidor</option>
            </select>
          </label>
          <label className="product-filters__check" htmlFor="admin-other-user">
            <input id="admin-other-user" type="checkbox" checked={otherUser} onChange={(event) => setOtherUser(event.target.checked)} />
            Simular otro usuario (403)
          </label>
        </details>
      </div>

      {status === 'loading' && <LoadingState label="Cargando productos…" />}
      {status === 'error' && <FeedbackMessage type="error" title="No pudimos mostrar los productos">{error}</FeedbackMessage>}
      {status === 'success' && products.length === 0 && (
        <div className="empty-state"><div className="empty-state__content">
          <h2>Todavía no hay productos</h2>
          <p>Publicá la primera prenda del catálogo.</p>
          <Link className="button-link" to="/admin/productos/nuevo">Crear producto</Link>
        </div></div>
      )}
      {status === 'success' && products.length > 0 && (
        <div className="admin-products__table-wrapper">
          <table className="admin-products__table">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {products.map((producto) => (
                <tr key={producto.id}>
                  <td data-label="Producto">
                    <div className="admin-products__name">
                      {getCoverUrl(producto) && <img src={getCoverUrl(producto)} alt="" />}
                      <div><strong>{producto.nombre}</strong><small>#{producto.id}</small></div>
                    </div>
                  </td>
                  <td data-label="Categoría">{producto.categoria}</td>
                  <td data-label="Precio">{formatPrice(producto.precio)}</td>
                  <td data-label="Stock"><StockForm key={`${producto.id}-${producto.stock}`} producto={producto} onSubmit={handleStock} /></td>
                  <td data-label="Acciones">
                    <div className="admin-products__actions">
                      <Link to={`/productos/${producto.id}`}>Ver</Link>
                      <Link to={`/admin/productos/${producto.id}/editar`}>Editar</Link>
                      <Link to={`/admin/productos/${producto.id}/fotos`}>Fotos</Link>
                      <button type="button" onClick={() => openDelete(producto)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dialog className="product-dialog" ref={dialogRef} onClose={() => setToDelete(null)}>
        <p className="product-dialog__kicker">Eliminar producto</p>
        <h2>¿Eliminar "{toDelete?.nombre}"?</h2>
        <p>La prenda deja de aparecer en el catálogo. Esta acción no se puede deshacer.</p>
        <div className="product-dialog__actions">
          <button type="button" className="primary-button product-danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button type="button" className="secondary-button" onClick={() => dialogRef.current?.close()}>Cancelar</button>
        </div>
      </dialog>
    </section>
  )
}

export default AdminProductsPage
