import StarRating from './StarRating'

function getInitials(name) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')

  return initials || '#'
}

function ReviewCard({ review, authorName, isOwn = false }) {
  return (
    <article className="review-card">
      <header className="review-card__header">
        <div className="review-card__avatar" aria-hidden="true">
          {getInitials(authorName)}
        </div>
        <div>
          <h3 className="review-card__author">
            {authorName}
            {isOwn && <span className="review-card__badge">Tu reseña</span>}
          </h3>
          <StarRating value={review.calificacion} />
        </div>
      </header>

      {review.comentario ? (
        <p className="review-card__comment">{review.comentario}</p>
      ) : (
        <p className="review-card__comment review-card__comment--empty">
          Esta persona no dejó comentario.
        </p>
      )}
    </article>
  )
}

export default ReviewCard
