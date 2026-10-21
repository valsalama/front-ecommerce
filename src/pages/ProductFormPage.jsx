import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductForm from '../components/productos/ProductForm'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { useAuth } from '../context/useAuth'
import { getCategories } from '../services/categoryService'
import { createProduct, getProductById, updateProduct } from '../services/productService'
import '../components/productos/productos.css'

const EMPTY = { nombre: '', descripcion: '', precio: '', stock: '', categoriaId: '', fotos: '' }

// Alta (POST /api/productos) y edición (PUT /api/productos/{id}) con el mismo formulario.
function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [values, setValues] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!isEdit) return undefined
    const controller = new AbortController()
    getProductById(id, { signal: controller.signal })
      .then((producto) => {
        setValues({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: String(producto.precio),
          stock: String(producto.stock),
          categoriaId: String(producto.categoriaId),
          fotos: producto.fotos.map((foto) => foto.url).join('\n'),
        })
        setStatus('ready')
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('not-found')
      })
    return () => controller.abort()
  }, [id, isEdit])

  const handleSubmit = async () => {
    setSubmitting(true)
    setErrors({})
    setError('')
    // Body = ProductoCrearDTO
    const body = {
      nombre: values.nombre,
      descripcion: values.descripcion,
      precio: values.precio === '' ? null : Number(values.precio),
      stock: values.stock === '' ? null : Number(values.stock),
      categoriaId: values.categoriaId ? Number(values.categoriaId) : null,
      usuarioId: user?.id,
      fotos: values.fotos.split('\n').map((url) => url.trim()).filter(Boolean),
    }
    try {
      const saved = isEdit ? await updateProduct(id, body) : await createProduct(body)
      navigate('/admin/productos', {
        state: { productMessage: { type: 'success', text: `"${saved.nombre}" se ${isEdit ? 'actualizó' : 'publicó'} correctamente.` } },
      })
    } catch (requestError) {
      setErrors(requestError.payload?.errores ?? {})
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-shell product-form-page" aria-labelledby="product-form-title">
      <PageHeading eyebrow="Administración · Catálogo" title={isEdit ? 'Editar producto' : 'Nuevo producto'}
        description={isEdit ? 'Modificá los datos de la prenda.' : 'Completá los datos para publicar una prenda en el catálogo.'}>
        <Link className="button-link button-link--secondary" to="/admin/productos">Volver al listado</Link>
      </PageHeading>
      <h2 id="product-form-title" className="visually-hidden">Formulario de producto</h2>

      {status === 'loading' && <LoadingState label="Cargando producto…" />}
      {status === 'not-found' && (
        <FeedbackMessage type="error" title="No encontramos el producto">{error}</FeedbackMessage>
      )}
      {status === 'ready' && (
        <>
          {error && (
            <FeedbackMessage type="error" title={error}>
              {Object.keys(errors).length > 0 && 'Revisá los campos marcados.'}
            </FeedbackMessage>
          )}
          <ProductForm values={values} errors={errors} categories={categories} onChange={setValues}
            onSubmit={handleSubmit} submitting={submitting} submitLabel={isEdit ? 'Guardar cambios' : 'Publicar producto'} />
        </>
      )}
    </section>
  )
}

export default ProductFormPage
