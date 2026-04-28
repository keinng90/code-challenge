import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { SwapCard } from './swap-card'
import * as balancesStorage from '@/lib/balances-storage'
import { usePrices } from '@/hooks/use-prices'
import { useBalances } from '@/hooks/use-balances'
import { useSwap } from '@/hooks/use-swap'
import { useSwapForm } from '@/hooks/use-swap-form'
import { formatAmount } from '@/lib/format'

function SwapCardWrapper() {
  const prices = usePrices()
  const tokens = prices.data?.tokens
  const balances = useBalances({ tokens })
  const form = useSwapForm()
  const [reviewOpen, setReviewOpen] = React.useState(false)

  const swap = useSwap({
    onSuccess: (input) => {
      balances.applySwap(
        input.payToken.symbol,
        input.payAmount,
        input.receiveToken.symbol,
        input.receiveAmount,
      )
      toast.success(
        `Swapped ${formatAmount(input.payAmount)} ${input.payToken.symbol} for ${formatAmount(
          input.receiveAmount,
        )} ${input.receiveToken.symbol}`,
      )
      form.resetAmounts()
      setReviewOpen(false)
    },
  })

  return (
    <SwapCard
      prices={prices}
      balances={balances}
      form={form}
      swap={swap}
      reviewOpen={reviewOpen}
      onReviewOpenChange={setReviewOpen}
    />
  )
}

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <TooltipProvider>
          <SwapCardWrapper />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })

  // Deterministic seed: every token gets exactly $5,000 worth
  vi.spyOn(balancesStorage, 'seedBalances').mockImplementation((tokens) => {
    const out: Record<string, number> = {}
    for (const t of tokens) out[t.symbol] = Math.round((5000 / t.price) * 1_000_000) / 1_000_000
    return out
  })

  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify([
        { currency: 'ETH', date: '2024-01-01T00:00:00Z', price: 2000 },
        { currency: 'USDC', date: '2024-01-01T00:00:00Z', price: 1 },
      ]),
      { status: 200 },
    ),
  )
})

describe('SwapCard happy path', () => {
  it('lets the user pick tokens, enter an amount, review, and confirm', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderCard()

    // Wait for prices to load (Skeleton swaps for the actual card)
    await screen.findByText(/Select a token to pay/i)

    // Pick pay token: ETH
    await user.click(screen.getByRole('button', { name: 'Select pay token' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByText('ETH'))

    // Pick receive token: USDC
    await user.click(screen.getByRole('button', { name: 'Select receive token' }))
    const dialog2 = await screen.findByRole('dialog')
    await user.click(within(dialog2).getByText('USDC'))

    // Enter pay amount of 1 ETH
    const payInput = screen.getByLabelText('You pay')
    await user.clear(payInput)
    await user.type(payInput, '1')

    // Receive should auto-fill to 2000 USDC
    expect(screen.getByLabelText('You receive')).toHaveValue('2000')

    // Submit -> review opens
    await user.click(screen.getByRole('button', { name: 'Review swap' }))
    const reviewDialog = await screen.findByRole('dialog', { name: 'Review swap' })
    expect(reviewDialog).toBeInTheDocument()

    // Confirm -> simulated 1.2s delay
    await user.click(within(reviewDialog).getByRole('button', { name: /Confirm swap/i }))
    vi.advanceTimersByTime(1300)

    // Success toast appears
    await waitFor(() => expect(screen.getByText(/Swapped/)).toBeInTheDocument())
  })
})

describe('SwapCard validation surface', () => {
  it('shows an error when amount exceeds balance', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderCard()
    await screen.findByText(/Select a token to pay/i)

    await user.click(screen.getByRole('button', { name: 'Select pay token' }))
    await user.click(within(await screen.findByRole('dialog')).getByText('ETH'))
    await user.click(screen.getByRole('button', { name: 'Select receive token' }))
    await user.click(within(await screen.findByRole('dialog')).getByText('USDC'))

    const payInput = screen.getByLabelText('You pay')
    await user.clear(payInput)
    await user.type(payInput, '10') // seed gives 5000/2000 = 2.5 ETH; 10 > 2.5

    expect(screen.getByRole('button', { name: /Insufficient ETH balance/i })).toBeDisabled()
    expect(screen.getByText(/Not enough ETH/i)).toBeInTheDocument()
  })

  it('rejects negative input via the parser', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderCard()
    await screen.findByText(/Select a token to pay/i)

    await user.click(screen.getByRole('button', { name: 'Select pay token' }))
    await user.click(within(await screen.findByRole('dialog')).getByText('ETH'))

    const payInput = screen.getByLabelText('You pay')
    await user.clear(payInput)
    await user.type(payInput, '-')

    // Parser rejects '-' so input stays empty
    expect(payInput).toHaveValue('')
  })

  it('omits the already-selected token from the opposite side picker', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderCard()
    await screen.findByText(/Select a token to pay/i)

    // Pick ETH on pay side
    await user.click(screen.getByRole('button', { name: 'Select pay token' }))
    await user.click(within(await screen.findByRole('dialog')).getByText('ETH'))

    // Open the receive picker — ETH must not be in the list
    await user.click(screen.getByRole('button', { name: 'Select receive token' }))
    const receiveDialog = await screen.findByRole('dialog')
    expect(within(receiveDialog).queryByRole('option', { name: /^ETH/ })).not.toBeInTheDocument()
    expect(within(receiveDialog).getByRole('option', { name: /^USDC/ })).toBeInTheDocument()
  })
})

