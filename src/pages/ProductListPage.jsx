import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from '../components/productos/Pagination'
import ProductFilters from '../components/productos/ProductFilters'
import ProductGrid from '../components/productos/ProductGrid'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { getCategories } from '../services/categoryService'
import { readPage, searchProducts } from '../services/productService'
import '../components/ProductList.css'
import '../components/productos/productos.css'

const PAGE_SIZE = 6
const EMPTY_FILTERS = { nombre: '', categoriaId: '', precioMin: '', precioMax: '', conStock: false, sort: 'nombre,asc' }

// Los filtros viven en la URL (?nombre=&categoriaId=&page=…), igual que los
// query params de GET /api/productos/buscar. Así se puede volver atrás o compartir.
const readFilters = (params) => ({
  nombre: params.get('nombre') ?? '',
  categoriaId: params.get('categoriaId') ?? '',
  precioMin: params.get('precioMin') ?? '',
  precioMax: params.get('precioMax') ?? '',
  conStock: params.get('conStock') === 'true',
  sort: params.get('sort') ?? 'nombre,asc',
})

function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const applied = readFilters(params)
  const pageNumber = Number(params.get('page') ?? 0)
  const [form, setForm] = useState(applied)
  const [categories, setCategories] = useState([])
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('data')
  const query = params.toString()

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const filters = readFilters(new URLSearchParams(query))
    setForm(filters)
    setStatus('loading')
    searchProducts({
      ...filters,
      categoriaId: filters.categoriaId || undefined,
      conStock: filters.conStock || undefined,
      page: Number(new URLSearchParams(query).get('page') ?? 0),
      size: PAGE_SIZE,
      mode,
      signal: controller.signal,
    })
      .then((page) => {
        setResult(readPage(page))
        setStatus('success')
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('error')
      })
    return () => controller.abort()
  }, [query, mode])

  const applyFilters = (values, page = 0) => {
    const next = new URLSearchParams()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== '' && value !== false && !(key === 'sort' && value === 'nombre,asc')) next.set(key, value)
    })
    if (page > 0) next.set('page', page)
    setParams(next)
  }

  return (
    <section className="page-shell products-page" aria-labelledby="products-title">
      <PageHeading eyebrow="Catálogo" title="Todas las prendas"
        description="Buscá por nombre, filtrá por categoría, precio o disponibilidad y ordená los resultados." />
      <h2 id="products-title" className="visually-hidden">Catálogo de productos</h2>

      <ProductFilters values={form} categories={categories} onChange={setForm}
        onSubmit={() => applyFilters(form)} onReset={() => applyFilters(EMPTY_FILTERS)} />

      <div className="products-toolbar">
        <p aria-live="polite">
          {status === 'success' && `${result.totalElements} ${result.totalElements === 1 ? 'prenda' : 'prendas'}`}
          {status === 'success' && result.totalPages > 1 && ` · página ${result.number + 1} de ${result.totalPages}`}
        </p>
        <details className="products-demo">
          <summary>Probar estados</summary>
          <label htmlFor="products-mode">Respuesta simulada
            <select className="state-select" id="products-mode" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="data">Con datos</option>
              <option value="empty">Sin resultados</option>
              <option value="error">Error del servidor</option>
            </select>
          </label>
        </details>
      </div>

      {status === 'loading' && <LoadingState label="Buscando prendas…" />}
      {status === 'error' && (
        <div className="products-message">
          <FeedbackMessage type="error" title="No pudimos completar la búsqueda">{error}</FeedbackMessage>
          <button type="button" className="secondary-button" onClick={() => { setMode('data'); applyFilters(EMPTY_FILTERS) }}>
            Ver todo el catálogo
          </button>
        </div>
      )}
      {status === 'success' && result.content.length === 0 && (
        <div className="empty-state"><div className="empty-state__content">
          <h2>No encontramos prendas</h2>
          <p>Probá con otra búsqueda o limpiá los filtros.</p>
          <button type="button" className="secondary-button" onClick={() => { setMode('data'); applyFilters(EMPTY_FILTERS) }}>
            Limpiar filtros
          </button>
        </div></div>
      )}
      {status === 'success' && result.content.length > 0 && (
        <>
          <ProductGrid products={result.content} />
          <Pagination number={result.number} totalPages={result.totalPages}
            onChange={(page) => { applyFilters(applied, page); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        </>
      )}
      {pageNumber > 0 && status === 'success' && result.content.length === 0 && result.totalElements > 0 && (
        <button type="button" className="secondary-button" onClick={() => applyFilters(applied, 0)}>Ir a la primera página</button>
      )}
    </section>
  )
}

export default ProductListPage
