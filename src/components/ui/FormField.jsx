function FormField({ error, id, label, ...inputProps }) {
  const errorId = `${id}-error`

  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
      {error && (
        <small id={errorId} className="form-field__error">
          {error}
        </small>
      )}
    </label>
  )
}

export default FormField
