export const CURRENCY_SYMBOL = "ETB"
export const DEFAULT_CURRENCY = "ETB"

export function formatCurrency(amount: number | string, currency: string = DEFAULT_CURRENCY): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `${currency} ${numAmount.toFixed(2)}`
}

export function formatCurrencyCompact(amount: number | string): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `${CURRENCY_SYMBOL} ${numAmount.toFixed(2)}`
}
