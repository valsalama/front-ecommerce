function StarRating({ value, label }) {
  const filledStars = Math.round(value)

  return (
    <span
      className="star-rating"
      role="img"
      aria-label={label ?? `Calificación: ${value} de 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= filledStars ? 'is-filled' : undefined}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default StarRating
