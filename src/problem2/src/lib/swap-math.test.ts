import { describe, it, expect } from 'vitest'
import { computeRate, computeReceive, computePay } from './swap-math'

describe('computeRate', () => {
  it('divides from-price by to-price', () => {
    expect(computeRate(2000, 1)).toBe(2000)
    expect(computeRate(1, 2000)).toBe(0.0005)
  })

  it('returns 0 when either price is zero', () => {
    expect(computeRate(0, 1)).toBe(0)
    expect(computeRate(1, 0)).toBe(0)
  })
})

describe('computeReceive', () => {
  it('multiplies pay amount by rate', () => {
    expect(computeReceive(2, 1500)).toBe(3000)
  })

  it('returns 0 for zero or non-positive amounts', () => {
    expect(computeReceive(0, 1500)).toBe(0)
    expect(computeReceive(-1, 1500)).toBe(0)
  })
})

describe('computePay', () => {
  it('divides receive amount by rate', () => {
    expect(computePay(3000, 1500)).toBe(2)
  })

  it('returns 0 when rate is zero', () => {
    expect(computePay(100, 0)).toBe(0)
  })
})
