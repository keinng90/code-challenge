import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SwapInputRow } from './swap-input-row'
import { FlipDirectionButton } from './flip-direction-button'
import { RateDisclosure } from './rate-disclosure'
import { TokenPickerDialog } from './token-picker-dialog'
import { ReviewDialog } from './review-dialog'
import type { usePrices } from '@/hooks/use-prices'
import type { useBalances } from '@/hooks/use-balances'
import type { useSwap } from '@/hooks/use-swap'
import type { useSwapForm } from '@/hooks/use-swap-form'
import { computeRate } from '@/lib/swap-math'
import { deriveStatus } from '@/lib/validation'
import { Side, StatusKind, type SwapStatus, type Token } from '@/types/swap'

type SwapCardProps = {
  prices: ReturnType<typeof usePrices>
  balances: ReturnType<typeof useBalances>
  form: ReturnType<typeof useSwapForm>
  swap: ReturnType<typeof useSwap>
  reviewOpen: boolean
  onReviewOpenChange: (open: boolean) => void
}

const STALE_AFTER_MS = 120_000

function useNow(): number {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return Date.now()
}

function buttonLabel(status: SwapStatus): string {
  switch (status.kind) {
    case StatusKind.NoPayToken:
      return 'Select a token to pay'
    case StatusKind.NoReceiveToken:
      return 'Select a token to receive'
    case StatusKind.NoAmount:
      return 'Enter an amount'
    case StatusKind.Negative:
      return 'Amount must be positive'
    case StatusKind.Insufficient:
      return `Insufficient ${status.symbol} balance`
    case StatusKind.PricesStale:
      return 'Prices unavailable'
    case StatusKind.Ready:
      return 'Review swap'
  }
}

type ReviewSnapshot = {
  payToken: Token
  receiveToken: Token
  payAmount: number
  receiveAmount: number
  rate: number
}

export function SwapCard({
  prices,
  balances,
  form,
  swap,
  reviewOpen,
  onReviewOpenChange,
}: SwapCardProps) {
  const tokens = prices.data?.tokens
  const [pickerTarget, setPickerTarget] = useState<Side | null>(null)
  const [reviewSnapshot, setReviewSnapshot] = useState<ReviewSnapshot | null>(null)

  const now = useNow()
  const pricesStale = useMemo(() => {
    if (!prices.data) return false
    return now - prices.data.updatedAt.getTime() > STALE_AFTER_MS
  }, [prices.data, now])

  const status = deriveStatus({
    payToken: form.payToken,
    receiveToken: form.receiveToken,
    payAmount: form.payAmount,
    balances: balances.balances,
    pricesStale,
  })

  if (prices.isLoading) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/70 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl dark:bg-card/50 dark:shadow-fuchsia-500/15">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
        <Skeleton className="mt-3 h-10 w-full" />
      </div>
    )
  }

  if (prices.isError && !prices.data) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-card/70 p-6 text-center shadow-2xl shadow-destructive/10 backdrop-blur-2xl dark:bg-card/50">
        <p className="text-sm text-muted-foreground">
          Couldn't load token prices. Check your connection and retry.
        </p>
        <Button className="mt-4" onClick={() => prices.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const onSubmit = () => {
    if (status.kind !== StatusKind.Ready || !form.payToken || !form.receiveToken) return
    const rate = computeRate(form.payToken.price, form.receiveToken.price)
    setReviewSnapshot({
      payToken: form.payToken,
      receiveToken: form.receiveToken,
      payAmount: Number(form.payAmount),
      receiveAmount: Number(form.receiveAmount),
      rate,
    })
    onReviewOpenChange(true)
  }

  const onConfirm = () => {
    if (!reviewSnapshot) return
    swap.mutate({
      payToken: reviewSnapshot.payToken,
      receiveToken: reviewSnapshot.receiveToken,
      payAmount: reviewSnapshot.payAmount,
      receiveAmount: reviewSnapshot.receiveAmount,
      rate: reviewSnapshot.rate,
    })
  }

  const submitDisabled = status.kind !== StatusKind.Ready || swap.isPending || reviewOpen

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-1 relative overflow-hidden rounded-3xl border border-border/40 bg-card/75 p-5 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl md:p-6 dark:bg-card/50 dark:shadow-fuchsia-500/15">
        {/* Top-edge highlight for the glass effect */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent dark:via-fuchsia-400/40"
        />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Swap</h2>
        </div>

        <SwapInputRow
          role={Side.Pay}
          token={form.payToken}
          amount={form.payAmount}
          balance={form.payToken ? balances.balances[form.payToken.symbol] ?? 0 : 0}
          onAmountChange={form.setPayAmount}
          onPickToken={() => setPickerTarget(Side.Pay)}
          pickerOpen={pickerTarget === Side.Pay}
          errorText={
            status.kind === StatusKind.Insufficient && form.payToken
              ? `Not enough ${status.symbol}`
              : undefined
          }
        />
        <FlipDirectionButton onClick={form.flip} />
        <SwapInputRow
          role={Side.Receive}
          token={form.receiveToken}
          amount={form.receiveAmount}
          balance={form.receiveToken ? balances.balances[form.receiveToken.symbol] ?? 0 : 0}
          onAmountChange={form.setReceiveAmount}
          onPickToken={() => setPickerTarget(Side.Receive)}
          pickerOpen={pickerTarget === Side.Receive}
        />
        <RateDisclosure
          payToken={form.payToken}
          receiveToken={form.receiveToken}
          updatedAt={prices.data?.updatedAt}
          now={now}
        />
        <Button
          className={cn(
            'mt-4 h-12 w-full text-base font-semibold',
            status.kind === StatusKind.Ready &&
              !swap.isPending &&
              'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30 transition-shadow hover:from-indigo-400 hover:to-fuchsia-400 hover:shadow-xl hover:shadow-indigo-500/40 dark:shadow-fuchsia-500/30 dark:hover:shadow-fuchsia-500/40',
          )}
          disabled={submitDisabled}
          onClick={onSubmit}
        >
          {swap.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Swapping…
            </>
          ) : (
            buttonLabel(status)
          )}
        </Button>
      </div>

      <TokenPickerDialog
        open={pickerTarget !== null}
        onOpenChange={(open) => !open && setPickerTarget(null)}
        tokens={tokens ?? []}
        balances={balances.balances}
        excludeSymbol={
          pickerTarget === Side.Pay
            ? form.receiveToken?.symbol
            : pickerTarget === Side.Receive
              ? form.payToken?.symbol
              : undefined
        }
        onSelect={(token) => {
          if (pickerTarget === Side.Pay) form.setPayToken(token)
          else if (pickerTarget === Side.Receive) form.setReceiveToken(token)
          setPickerTarget(null)
        }}
      />

      {reviewSnapshot && (
        <ReviewDialog
          open={reviewOpen}
          onOpenChange={(open) => {
            if (!open && !swap.isPending) {
              onReviewOpenChange(false)
              setReviewSnapshot(null)
            }
          }}
          payToken={reviewSnapshot.payToken}
          receiveToken={reviewSnapshot.receiveToken}
          payAmount={reviewSnapshot.payAmount}
          receiveAmount={reviewSnapshot.receiveAmount}
          rate={reviewSnapshot.rate}
          pending={swap.isPending}
          onConfirm={onConfirm}
        />
      )}
    </>
  )
}
