/** Color and sign follow the rounded number the reader actually sees. */
export function roundedValue(value: number, digits = 2): number {
  return Number(value.toFixed(digits)) || 0
}

export function signedNumber(value: number, digits = 2): string {
  const rounded = roundedValue(value, digits)
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(digits)}`
}

export function numberTone(value: number, digits = 2): string {
  const rounded = roundedValue(value, digits)
  return rounded > 0 ? 'text-sage-dark' : rounded < 0 ? 'text-loss' : 'text-charcoal/65'
}
