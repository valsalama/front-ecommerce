import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CategoryTable from '../components/categorias/CategoryTable'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { getCategories, getCategoryById, getCategoryByName } from '../services/categoryService'
import './categorias.css'

function CategoriesPage() {
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [type, setType] = useState('nombre')
  const [term, setTerm] = useState('')
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [mode, setMode] = useState('data')
  const [request, setRequest] = useState({ type: 'all' })

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setStatus('loading')
      setError('')
      try {
        let items
        const options = { signal: controller.signal }
        if (mode !== 'data' || request.type === 'all') {
          items = await getCategories({ ...options, mode })
        } else if (request.type === 'id') {
          items = [await getCategoryById(request.term, options)]
        } else {
          items = [await getCategoryByName(request.term, { ...options, ignorarMayusculas: request.ignoreCase })]
        }
        if (controller.signal.aborted) return
        setCategories(items)
        setStatus('success')
      } catch (requestError) {
        if (controller.signal.aborted) return
        setCategories([])
        setError(requestError.message)
        setStatus('error')
      }
    }
    load()
    return () => controller.abort()
  }, [mode, request])

  function showAll() {
    setTerm('')
    setMode('data')
    setRequest({ type: 'all' })
  }

  return (
    <section className="page-shell categories-page" aria-labelledby="categories-title">
      <PageHeading eyebrow="Administración · Colecciones" title="Categorías"
        description="Organizá las prendas de TRAMA. Consultá las categorías y mantené actualizado el catálogo.">
        <Link className="button-link" to="/categorias/nueva">Nueva categoría</Link>
      </PageHeading>
      <h2 id="categories-title" className="visually-hidden">Gestión de categorías</h2>
      {location.state?.categoryMessage && <FeedbackMessage type="success" title={location.state.categoryMessage} />}

      <form className="category-search" onSubmit={(event) => {
        event.preventDefault()
        setMode('data')
        setRequest({ type, term: term.trim(), ignoreCase })
      }}>
        <label htmlFor="category-search-type">Buscar por
          <select className="state-select" id="category-search-type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="nombre">Nombre exacto</option><option value="id">Identificador</option>
          </select>
        </label>
        <label htmlFor="category-search-term">{type === 'id' ? 'ID de categoría' : 'Nombre de categoría'}
          <input className="search-field" id="category-search-term" type={type === 'id' ? 'number' : 'search'}
            min={type === 'id' ? 1 : undefined} step={type === 'id' ? 1 : undefined}
            placeholder={type === 'id' ? 'Ej.: 1' : 'Ej.: Remeras'} value={term}
            onChange={(event) => setTerm(event.target.value)} required />
        </label>
        <button className="primary-button" type="submit">Buscar</button>
        <button className="secondary-button" type="button" onClick={showAll}>Ver todas</button>
        {type === 'nombre' && <label className="category-checkbox" htmlFor="category-ignore-case">
          <input id="category-ignore-case" type="checkbox" checked={ignoreCase}
            onChange={(event) => setIgnoreCase(event.target.checked)} /> Ignorar mayúsculas y minúsculas
        </label>}
      </form>

      <div className="category-list-heading">
        <p aria-live="polite">{status === 'success' ? `${categories.length} ${categories.length === 1 ? 'categoría' : 'categorías'}` : 'Categorías activas'}</p>
        <details className="category-demo">
          <summary>Probar estados</summary>
          <label htmlFor="category-view-mode">Respuesta simulada
            <select className="state-select" id="category-view-mode" value={mode}
              onChange={(event) => { setMode(event.target.value); setRequest({ type: 'all' }) }}>
              <option value="data">Con datos</option><option value="empty">Lista vacía</option><option value="error">Error del servidor</option>
            </select>
          </label>
        </details>
      </div>
      {status === 'loading' && <LoadingState label="Cargando categorías…" />}
      {status === 'error' && <div className="category-message">
        <FeedbackMessage type="error" title="No pudimos mostrar las categorías">{error}</FeedbackMessage>
        <button type="button" className="secondary-button" onClick={showAll}>Volver a cargar categorías</button>
      </div>}
      {status === 'success' && categories.length === 0 && <div className="empty-state"><div className="empty-state__content">
        <h2>Todavía no hay categorías</h2><p>Creá una categoría para organizar una nueva colección.</p>
        <Link className="button-link" to="/categorias/nueva">Crear categoría</Link>
      </div></div>}
      {status === 'success' && categories.length > 0 && <CategoryTable categories={categories} />}
    </section>
  )
}
export default CategoriesPage
