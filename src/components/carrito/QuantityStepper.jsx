function QuantityStepper({ value, onChange, disabled = false, label }) {
  return (
    <div className="quantity-stepper" role="group" aria-label={`Cantidad de ${label}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled}
        aria-label={value === 1 ? `Quitar ${label} del carrito` : `Restar una unidad de ${label}`}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        aria-label={`Sumar una unidad de ${label}`}
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
