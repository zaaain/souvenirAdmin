/** Qatar (QAR) – used across the app */
export const CURRENCY_SYMBOL = 'QAR '

export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null || value === '') return CURRENCY_SYMBOL + '0'
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return CURRENCY_SYMBOL + '0'
  return CURRENCY_SYMBOL + n.toLocaleString()
}
