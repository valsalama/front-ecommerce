import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import DeleteCategoryConfirm from '../components/categorias/DeleteCategoryConfirm'
import useCategory from '../components/categorias/useCategory'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { deleteCategory } from '../services/categoryService'
import './categorias.css'

function CategoryDetailPage() {
  const { id } = useParams()
  const { category, status, error } = useCategory(id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteButtonRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <section className="page-shell categories-page" aria-labelledby="category-detail-title">
      <PageHeading eyebrow="Administración · Categorías" title="Detalle de categoría"
        description="Consultá la categoría y administrá su nombre o disponibilidad.">
        <Link className="button-link button-link--secondary" to="/categorias">Volver al listado</Link>
      </PageHeading>
      {status === 'loading' && <LoadingState label="Cargando categoría…" />}
      {status === 'error' && <FeedbackMessage type="error" title="No pudimos encontrar la categoría">{error}</FeedbackMessage>}
      {status === 'success' && category && <>
        {location.state?.categoryMessage && <FeedbackMessage type="success" title={location.state.categoryMessage} />}
        <article className="category-detail-card">
          <p className="category-kicker">Colección TRAMA</p>
          <h2 id="category-detail-title">{category.nombre}</h2>
          <dl className="category-data"><div><dt>ID de categoría</dt><dd>#{category.id}</dd></div><div><dt>Nombre</dt><dd>{category.nombre}</dd></div></dl>
          <div className="category-actions">
            <Link className="button-link" to={`/categorias/${category.id}/editar`}>Editar categoría</Link>
            <button ref={deleteButtonRef} className="secondary-button category-danger-outline" type="button" onClick={() => setConfirmDelete(true)}>Eliminar categoría</button>
          </div>
        </article>
        {confirmDelete && <DeleteCategoryConfirm category={category}
          onCancel={() => { setConfirmDelete(false); deleteButtonRef.current?.focus() }}
          onConfirm={async () => {
            await deleteCategory(category.id)
            navigate('/categorias', { replace: true, state: { categoryMessage: `Categoría «${category.nombre}» eliminada.` } })
          }} />}
      </>}
    </section>
  )
}
export default CategoryDetailPage
