const AMOUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  useGrouping: true,
})

const AMOUNT_FORMATTER_PLAIN = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  useGrouping: false,
})

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const SMALLEST_DISPLAYED_AMOUNT = 0.000001
const SMALLEST_DISPLAYED_USD = 0.01

export function toDecimalString(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return AMOUNT_FORMATTER_PLAIN.format(value)
}

export function formatAmount(value: number): string {
  if (value === 0) return '0'
  if (value > 0 && value < SMALLEST_DISPLAYED_AMOUNT) return '<0.000001'
  return AMOUNT_FORMATTER.format(value)
}

export function formatUsd(value: number): string {
  if (value === 0) return '$0.00'
  if (value > 0 && value < SMALLEST_DISPLAYED_USD) return '<$0.01'
  return USD_FORMATTER.format(value)
}

export function formatRate(rate: number, fromSymbol: string, toSymbol: string): string {
  let displayed: string
  if (rate > 0 && rate < 0.000001) {
    // Use 4 significant digits for sub-microunit rates so the value is readable
    displayed = rate.toPrecision(4)
  } else {
    displayed = formatAmount(rate)
  }
  return `1 ${fromSymbol} ≈ ${displayed} ${toSymbol}`
}

export function parseAmount(input: string, previous: string = ''): string {
  if (input === '') return ''

  // Strip commas so users can paste grouped numbers like "1,234.5"
  const cleaned = input.replace(/,/g, '')

  // Reject anything not matching a single decimal number
  if (!/^\d*\.?\d*$/.test(cleaned)) return previous

  const [intPartRaw, decPart] = cleaned.split('.')
  const intPart = intPartRaw === '' ? '' : String(parseInt(intPartRaw, 10))

  if (cleaned.endsWith('.') && decPart === '') {
    return `${intPart === '' ? '0' : intPart}.`
  }

  const clampedDec = decPart !== undefined ? decPart.slice(0, 6) : undefined

  if (clampedDec === undefined) return intPart === '' ? '' : intPart
  if (intPart === '') return `0.${clampedDec}`
  return `${intPart}.${clampedDec}`
}
