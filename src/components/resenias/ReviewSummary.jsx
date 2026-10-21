import StarRating from './StarRating'

const averageFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function ReviewSummary({ average, total }) {
  if (total === 0) {
    return (
      <div className="review-summary review-summary--empty">
        <p className="review-summary__label">Todavía no hay calificaciones</p>
      </div>
    )
  }

  const formattedAverage = averageFormatter.format(average)

  return (
    <div className="review-summary">
      <p className="review-summary__score">{formattedAverage}</p>
      <div>
        <StarRating value={average} label={`Promedio: ${formattedAverage} de 5`} />
        <p className="review-summary__label">
          {total} {total === 1 ? 'reseña' : 'reseñas'}
        </p>
      </div>
    </div>
  )
}

export default ReviewSummary
