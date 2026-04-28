import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSwapForm } from './use-swap-form'
import type { Token } from '@/types/swap'

const ETH: Token = { symbol: 'ETH', price: 2000, iconUrl: 'x', lastUpdated: new Date() }
const USDC: Token = { symbol: 'USDC', price: 1, iconUrl: 'x', lastUpdated: new Date() }

describe('useSwapForm.flip', () => {
  it('swaps tokens and amounts and toggles lastEditedSide', () => {
    const { result } = renderHook(() => useSwapForm())

    act(() => {
      result.current.setPayToken(ETH)
      result.current.setReceiveToken(USDC)
    })

    act(() => {
      result.current.setPayAmount('2')
    })

    // pay=2 ETH → receive=4000 USDC
    expect(result.current.payToken?.symbol).toBe('ETH')
    expect(result.current.receiveToken?.symbol).toBe('USDC')
    expect(result.current.payAmount).toBe('2')
    expect(result.current.receiveAmount).toBe('4000')

    act(() => {
      result.current.flip()
    })

    expect(result.current.payToken?.symbol).toBe('USDC')
    expect(result.current.receiveToken?.symbol).toBe('ETH')
    expect(result.current.payAmount).toBe('4000')
    expect(result.current.receiveAmount).toBe('2')
  })

  it('auto-flips when the new pay token equals the current receive token', () => {
    const { result } = renderHook(() => useSwapForm())

    act(() => {
      result.current.setPayToken(ETH)
      result.current.setReceiveToken(USDC)
    })

    act(() => {
      result.current.setPayToken(USDC) // already on receive side
    })

    expect(result.current.payToken?.symbol).toBe('USDC')
    expect(result.current.receiveToken?.symbol).toBe('ETH')
  })
})
