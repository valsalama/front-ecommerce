function StarRatingInput({ value, onChange, error, disabled = false }) {
  return (
    <fieldset
      className="star-input"
      disabled={disabled}
      aria-describedby={error ? 'resenia-calificacion-error' : undefined}
    >
      <legend>Calificación</legend>

      <div className="star-input__options">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className={star <= (value ?? 0) ? 'is-active' : undefined}>
            <input
              type="radio"
              name="calificacion"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
            />
            <span aria-hidden="true">★</span>
            <span className="visually-hidden">
              {star} {star === 1 ? 'estrella' : 'estrellas'}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <small id="resenia-calificacion-error" className="form-field__error">
          {error}
        </small>
      )}
    </fieldset>
  )
}

export default StarRatingInput
