import ReviewCard from './ReviewCard'

function ReviewList({ reviews, authors, currentUserId }) {
  if (reviews.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__content">
          <h3>Todavía no hay reseñas</h3>
          <p>Sé la primera persona en contarnos qué te pareció esta prenda.</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard
            review={review}
            authorName={authors[review.usuarioId] ?? `Usuario #${review.usuarioId}`}
            isOwn={review.usuarioId === currentUserId}
          />
        </li>
      ))}
    </ul>
  )
}

export default ReviewList
