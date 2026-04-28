import { describe, it, expect } from 'vitest'
import { formatAmount, formatUsd, formatRate, parseAmount, toDecimalString } from './format'

describe('formatAmount', () => {
  it('formats integer amounts', () => {
    expect(formatAmount(0)).toBe('0')
    expect(formatAmount(1234)).toBe('1,234')
  })

  it('keeps decimals up to 6 places, trims trailing zeros', () => {
    expect(formatAmount(1.5)).toBe('1.5')
    expect(formatAmount(1.234567)).toBe('1.234567')
    expect(formatAmount(1.5000)).toBe('1.5')
  })

  it('shows < 0.000001 for tiny non-zero values', () => {
    expect(formatAmount(0.0000001)).toBe('<0.000001')
  })
})

describe('formatUsd', () => {
  it('formats USD amounts with two decimals', () => {
    expect(formatUsd(0)).toBe('$0.00')
    expect(formatUsd(1234.5)).toBe('$1,234.50')
  })

  it('shows < $0.01 for tiny non-zero values', () => {
    expect(formatUsd(0.001)).toBe('<$0.01')
  })
})

describe('formatRate', () => {
  it('formats a rate row', () => {
    expect(formatRate(1847.32, 'ETH', 'USDC')).toBe('1 ETH ≈ 1,847.32 USDC')
  })

  it('uses smaller unit for sub-unit rates', () => {
    expect(formatRate(0.000541, 'USDC', 'ETH')).toBe('1 USDC ≈ 0.000541 ETH')
  })

  it('uses significant digits for sub-microunit rates', () => {
    expect(formatRate(0.00000041, 'USDC', 'ETH')).toBe('1 USDC ≈ 4.100e-7 ETH')
  })
})

describe('parseAmount', () => {
  it('passes valid decimal strings through', () => {
    expect(parseAmount('12.345')).toBe('12.345')
  })

  it('clamps to 6 decimal places', () => {
    expect(parseAmount('1.2345678')).toBe('1.234567')
  })

  it('rejects negative numbers', () => {
    expect(parseAmount('-5')).toBe('')
  })

  it('rejects non-numeric input', () => {
    expect(parseAmount('abc')).toBe('')
    expect(parseAmount('1.2.3')).toBe('')
  })

  it('strips leading zeros except in 0.x form', () => {
    expect(parseAmount('00012')).toBe('12')
    expect(parseAmount('0.5')).toBe('0.5')
    expect(parseAmount('0')).toBe('0')
  })

  it('preserves a trailing dot while typing', () => {
    expect(parseAmount('5.')).toBe('5.')
  })

  it('returns empty string for empty input', () => {
    expect(parseAmount('')).toBe('')
  })

  it('returns the previous value when input is invalid', () => {
    expect(parseAmount('5..', '5.')).toBe('5.')
    expect(parseAmount('abc', '12.3')).toBe('12.3')
  })

  it('strips commas (e.g. pasted grouped numbers)', () => {
    expect(parseAmount('1,234.5')).toBe('1234.5')
  })
})

describe('toDecimalString', () => {
  it('returns plain decimal string with no grouping', () => {
    expect(toDecimalString(1234.5)).toBe('1234.5')
    expect(toDecimalString(1662.84151)).toBe('1662.84151')
  })

  it('clamps to 6 fractional digits', () => {
    expect(toDecimalString(1.2345678)).toBe('1.234568')
  })

  it('returns empty string for zero or non-finite', () => {
    expect(toDecimalString(0)).toBe('')
    expect(toDecimalString(-1)).toBe('')
    expect(toDecimalString(NaN)).toBe('')
    expect(toDecimalString(Infinity)).toBe('')
  })
})
