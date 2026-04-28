import { describe, it, expect } from 'vitest'
import { deriveStatus } from './validation'
import type { Token } from '@/types/swap'

const ETH: Token = {
  symbol: 'ETH',
  price: 1800,
  iconUrl: 'x',
  lastUpdated: new Date(),
}
const USDC: Token = {
  symbol: 'USDC',
  price: 1,
  iconUrl: 'x',
  lastUpdated: new Date(),
}

const baseInput = {
  payToken: ETH,
  receiveToken: USDC,
  payAmount: '1',
  balances: { ETH: 5, USDC: 0 },
  pricesStale: false,
}

describe('deriveStatus', () => {
  it('flags missing pay token', () => {
    expect(deriveStatus({ ...baseInput, payToken: null })).toEqual({ kind: 'no-pay-token' })
  })

  it('flags missing receive token', () => {
    expect(deriveStatus({ ...baseInput, receiveToken: null })).toEqual({
      kind: 'no-receive-token',
    })
  })

  it('flags empty or zero amount as no-amount', () => {
    expect(deriveStatus({ ...baseInput, payAmount: '' })).toEqual({ kind: 'no-amount' })
    expect(deriveStatus({ ...baseInput, payAmount: '0' })).toEqual({ kind: 'no-amount' })
    expect(deriveStatus({ ...baseInput, payAmount: '0.0' })).toEqual({ kind: 'no-amount' })
  })

  it('flags negative amounts', () => {
    expect(deriveStatus({ ...baseInput, payAmount: '-1' })).toEqual({ kind: 'negative' })
  })

  it('flags insufficient balance', () => {
    expect(deriveStatus({ ...baseInput, payAmount: '10' })).toEqual({
      kind: 'insufficient',
      symbol: 'ETH',
    })
  })

  it('flags stale prices', () => {
    expect(deriveStatus({ ...baseInput, pricesStale: true })).toEqual({ kind: 'prices-stale' })
  })

  it('returns ready when everything is valid', () => {
    expect(deriveStatus(baseInput)).toEqual({ kind: 'ready' })
  })

  it('prioritizes prices-stale over other issues', () => {
    expect(deriveStatus({ ...baseInput, pricesStale: true, payAmount: '' })).toEqual({
      kind: 'prices-stale',
    })
  })

  it('surfaces insufficient before missing receive token', () => {
    // pay token + over-balance amount, receive still empty: show the more
    // informative balance error rather than waiting for the user to pick receive.
    expect(deriveStatus({ ...baseInput, receiveToken: null, payAmount: '10' })).toEqual({
      kind: 'insufficient',
      symbol: 'ETH',
    })
  })

  it('surfaces negative amount before missing receive token', () => {
    expect(deriveStatus({ ...baseInput, receiveToken: null, payAmount: '-1' })).toEqual({
      kind: 'negative',
    })
  })
})
