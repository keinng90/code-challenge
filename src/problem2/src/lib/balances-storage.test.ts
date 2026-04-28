import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  STORAGE_KEY,
  readBalances,
  writeBalances,
  seedBalances,
  isStorageAvailable,
} from './balances-storage'
import type { Token } from '@/types/swap'

const tokens: Token[] = [
  { symbol: 'ETH', price: 2000, iconUrl: 'x', lastUpdated: new Date() },
  { symbol: 'USDC', price: 1, iconUrl: 'x', lastUpdated: new Date() },
]

beforeEach(() => {
  localStorage.clear()
})

describe('readBalances / writeBalances', () => {
  it('round-trips a balances map', () => {
    writeBalances({ ETH: 1.5, USDC: 200 })
    expect(readBalances()).toEqual({ ETH: 1.5, USDC: 200 })
  })

  it('returns empty object when nothing stored', () => {
    expect(readBalances()).toEqual({})
  })

  it('returns empty object on corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    expect(readBalances()).toEqual({})
  })
})

describe('seedBalances', () => {
  it('produces a non-negative balance for every token', () => {
    const seeded = seedBalances(tokens, () => 0.5)
    expect(Object.keys(seeded).sort()).toEqual(['ETH', 'USDC'])
    for (const symbol of Object.keys(seeded)) {
      expect(seeded[symbol]).toBeGreaterThanOrEqual(0)
    }
  })

  it('caps each balance at the equivalent of $5,000 with rng=1', () => {
    const seeded = seedBalances(tokens, () => 1)
    // $5000 / 2000 = 2.5 ETH; $5000 / 1 = 5000 USDC
    expect(seeded.ETH).toBeCloseTo(2.5, 6)
    expect(seeded.USDC).toBeCloseTo(5000, 6)
  })

  it('rounds to 6 decimal places', () => {
    const seeded = seedBalances(tokens, () => 1 / 3)
    const eth = seeded.ETH.toString()
    const decimals = eth.includes('.') ? eth.split('.')[1].length : 0
    expect(decimals).toBeLessThanOrEqual(6)
  })

  it('produces a zero balance when rng falls into the zero band', () => {
    const seeded = seedBalances(tokens, () => 0.1) // r < 0.2
    expect(seeded.ETH).toBe(0)
    expect(seeded.USDC).toBe(0)
  })
})

describe('isStorageAvailable', () => {
  it('returns true when localStorage works', () => {
    expect(isStorageAvailable()).toBe(true)
  })

  it('returns false when setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(isStorageAvailable()).toBe(false)
    spy.mockRestore()
  })
})
