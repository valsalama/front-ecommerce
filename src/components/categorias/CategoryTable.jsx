import { Link } from 'react-router-dom'

function CategoryTable({ categories }) {
  return (
    <div className="categories-table-wrapper">
      <table className="categories-table">
        <caption className="visually-hidden">Categorías activas y acciones de administración</caption>
        <thead><tr><th scope="col">ID</th><th scope="col">Categoría</th><th scope="col">Acciones</th></tr></thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td data-label="ID"><span className="category-id">#{category.id}</span></td>
              <td data-label="Categoría"><strong>{category.nombre}</strong></td>
              <td data-label="Acciones"><div className="category-row-actions">
                <Link to={`/categorias/${category.id}`} aria-label={`Ver detalle de ${category.nombre}`}>Ver detalle</Link>
                <Link to={`/categorias/${category.id}/editar`} aria-label={`Editar ${category.nombre}`}>Editar</Link>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default CategoryTable
