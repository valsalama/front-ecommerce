// Mismo formato de precios que la tarjeta del catálogo.
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const formatPrice = (value) => currencyFormatter.format(value)
