export const CURRENCY_SYMBOL = "ETB"
export const DEFAULT_CURRENCY = "ETB"

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number | string, currency: string = DEFAULT_CURRENCY,): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount

      if (!Number.isFinite(num)) {
        return `${currency} 0.00`
      }

  return `${currency} ${numberFormatter.format(num)}`
}

// export function formatCurrency(amount: number | string, currency: string = DEFAULT_CURRENCY): string {
//   const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
//   return `${currency} ${numAmount.toFixed(2)}`
// }

export function formatCurrencyCompact(amount: number | string): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `${CURRENCY_SYMBOL} ${numAmount.toFixed(2)}`
}

