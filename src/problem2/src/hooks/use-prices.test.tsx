import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePrices } from './use-prices'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('usePrices', () => {
  it('builds a price map keyed by latest date per currency, dropping no-price entries', async () => {
    const data = [
      { currency: 'ETH', date: '2024-01-01T00:00:00Z', price: 1500 },
      { currency: 'ETH', date: '2024-02-01T00:00:00Z', price: 1800 },
      { currency: 'USDC', date: '2024-01-01T00:00:00Z', price: 1 },
      { currency: 'NOPRICE', date: '2024-01-01T00:00:00Z' },
    ]
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(data), { status: 200 }),
    )

    const { result } = renderHook(() => usePrices(), { wrapper })
    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(result.current.data!.priceMap).toEqual({ ETH: 1800, USDC: 1 })
    expect(result.current.data!.tokens.map((t) => t.symbol).sort()).toEqual(['ETH', 'USDC'])
  })
})
