// Paginación de un Page de Spring: number empieza en 0.
function Pagination({ number, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Paginación de productos">
      <button type="button" className="secondary-button" disabled={number === 0} onClick={() => onChange(number - 1)}>
        Anterior
      </button>
      <ol>
        {Array.from({ length: totalPages }, (_, index) => (
          <li key={index}>
            <button
              type="button"
              className={`pagination__page${index === number ? ' is-current' : ''}`}
              aria-current={index === number ? 'page' : undefined}
              onClick={() => onChange(index)}
            >
              {index + 1}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="secondary-button" disabled={number >= totalPages - 1} onClick={() => onChange(number + 1)}>
        Siguiente
      </button>
    </nav>
  )
}

export default Pagination
