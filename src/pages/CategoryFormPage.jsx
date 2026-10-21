import { Link, useNavigate, useParams } from 'react-router-dom'
import CategoryForm from '../components/categorias/CategoryForm'
import useCategory from '../components/categorias/useCategory'
import FeedbackMessage from '../components/ui/FeedbackMessage'
import LoadingState from '../components/ui/LoadingState'
import PageHeading from '../components/ui/PageHeading'
import { createCategory, updateCategory } from '../services/categoryService'
import './categorias.css'

function EditCategoryForm({ id, onSave }) {
  const { category, status, error } = useCategory(id)
  if (status === 'loading') return <LoadingState label="Cargando categoría…" />
  if (status === 'error') return <FeedbackMessage type="error" title="No se puede editar esta categoría">{error}</FeedbackMessage>
  return <CategoryForm key={category.id} initialName={category.nombre} editing onSave={onSave} />
}

function CategoryFormPage() {
  const { id } = useParams()
  const editing = id !== undefined
  const navigate = useNavigate()
  async function handleSave(datos) {
    const category = editing ? await updateCategory(id, datos) : await createCategory(datos)
    navigate(`/categorias/${category.id}`, {
      replace: true,
      state: { categoryMessage: editing ? 'Cambios guardados correctamente.' : 'Categoría creada correctamente.' },
    })
  }
  return (
    <section className="page-shell categories-page" aria-label={editing ? 'Editar categoría' : 'Nueva categoría'}>
      <PageHeading eyebrow="Administración · Categorías" title={editing ? 'Editar categoría' : 'Nueva categoría'}
        description={editing ? 'Actualizá el nombre de una categoría de la colección.' : 'Dale lugar a una nueva selección de prendas.'}>
        <Link className="button-link button-link--secondary" to="/categorias">Volver al listado</Link>
      </PageHeading>
      {editing ? <EditCategoryForm id={id} onSave={handleSave} /> : <CategoryForm key="new" onSave={handleSave} />}
    </section>
  )
}
export default CategoryFormPage
