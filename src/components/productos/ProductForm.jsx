import FormField from '../ui/FormField'

// Formulario de alta y edición. Arma el body de ProductoCrearDTO:
// { nombre, descripcion, precio, stock, categoriaId, usuarioId, fotos: [urls] }.
// Las fotos se cargan como URLs porque así las recibe el backend
// (la gestión completa de fotos es del módulo de Julian).
function ProductForm({ values, errors = {}, categories, onChange, onSubmit, submitting, submitLabel }) {
  const update = (field) => (event) => onChange({ ...values, [field]: event.target.value })
  const urls = values.fotos.split('\n').map((url) => url.trim()).filter(Boolean)

  return (
    <form className="product-form" noValidate onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
      <FormField id="producto-nombre" label="Nombre" value={values.nombre} onChange={update('nombre')}
        error={errors.nombre} placeholder="Ej.: Remera Essential" maxLength={120} />

      <label className="form-field" htmlFor="producto-descripcion">
        <span>Descripción</span>
        <textarea id="producto-descripcion" rows="4" value={values.descripcion} onChange={update('descripcion')}
          aria-invalid={Boolean(errors.descripcion)} placeholder="Material, calce y detalles de la prenda" />
        {errors.descripcion && <small className="form-field__error">{errors.descripcion}</small>}
      </label>

      <div className="product-form__row">
        <FormField id="producto-precio" label="Precio (ARS)" type="number" min="0" step="100"
          value={values.precio} onChange={update('precio')} error={errors.precio} />
        <FormField id="producto-stock" label="Stock" type="number" min="0" step="1"
          value={values.stock} onChange={update('stock')} error={errors.stock} />
      </div>

      <label className="form-field" htmlFor="producto-categoria">
        <span>Categoría</span>
        <select className="state-select" id="producto-categoria" value={values.categoriaId}
          onChange={update('categoriaId')} aria-invalid={Boolean(errors.categoriaId)}>
          <option value="">Elegí una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.nombre}</option>
          ))}
        </select>
        {errors.categoriaId && <small className="form-field__error">{errors.categoriaId}</small>}
      </label>

      <label className="form-field" htmlFor="producto-fotos">
        <span>Fotos (una URL por línea; la primera es la portada)</span>
        <textarea id="producto-fotos" rows="3" value={values.fotos} onChange={update('fotos')}
          aria-invalid={Boolean(errors.fotos)} placeholder="https://…" />
        {errors.fotos && <small className="form-field__error">{errors.fotos}</small>}
      </label>

      {urls.length > 0 && (
        <div className="product-form__preview" aria-label="Vista previa de fotos">
          {urls.map((url, index) => (
            <figure key={`${url}-${index}`}>
              <img src={url} alt={`Vista previa ${index + 1}`} />
              {index === 0 && <figcaption>Portada</figcaption>}
            </figure>
          ))}
        </div>
      )}

      <div className="product-form__actions">
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
