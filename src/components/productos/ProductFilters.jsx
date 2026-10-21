// Filtros de GET /api/productos/buscar: nombre, categoría, con stock,
// rango de precio y orden. El formulario es controlado por la página.
const SORT_OPTIONS = [
  { value: 'nombre,asc', label: 'Nombre (A-Z)' },
  { value: 'nombre,desc', label: 'Nombre (Z-A)' },
  { value: 'precio,asc', label: 'Menor precio' },
  { value: 'precio,desc', label: 'Mayor precio' },
]

function ProductFilters({ values, categories, onChange, onSubmit, onReset }) {
  const update = (field) => (event) => {
    const { type, checked, value } = event.target
    onChange({ ...values, [field]: type === 'checkbox' ? checked : value })
  }

  return (
    <form
      className="product-filters"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label className="product-filters__search" htmlFor="filter-nombre">
        Buscar
        <input
          className="search-field"
          id="filter-nombre"
          type="search"
          placeholder="Ej.: remera, jean, buzo…"
          value={values.nombre}
          onChange={update('nombre')}
        />
      </label>

      <label htmlFor="filter-categoria">
        Categoría
        <select className="state-select" id="filter-categoria" value={values.categoriaId} onChange={update('categoriaId')}>
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.nombre}</option>
          ))}
        </select>
      </label>

      <label htmlFor="filter-min">
        Precio mínimo
        <input className="search-field" id="filter-min" type="number" min="0" step="100"
          placeholder="$ desde" value={values.precioMin} onChange={update('precioMin')} />
      </label>

      <label htmlFor="filter-max">
        Precio máximo
        <input className="search-field" id="filter-max" type="number" min="0" step="100"
          placeholder="$ hasta" value={values.precioMax} onChange={update('precioMax')} />
      </label>

      <label htmlFor="filter-sort">
        Ordenar por
        <select className="state-select" id="filter-sort" value={values.sort} onChange={update('sort')}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="product-filters__check" htmlFor="filter-stock">
        <input id="filter-stock" type="checkbox" checked={values.conStock} onChange={update('conStock')} />
        Solo con stock
      </label>

      <div className="product-filters__actions">
        <button className="primary-button" type="submit">Aplicar</button>
        <button className="secondary-button" type="button" onClick={onReset}>Limpiar</button>
      </div>
    </form>
  )
}

export default ProductFilters
