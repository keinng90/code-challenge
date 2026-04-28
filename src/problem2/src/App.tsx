import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageLayout } from './components/page-layout'
import { Header } from './components/header'
import { SwapCard } from './components/swap/swap-card'
import { usePrices } from './hooks/use-prices'
import { useBalances } from './hooks/use-balances'
import { useSwap } from './hooks/use-swap'
import { useSwapForm } from './hooks/use-swap-form'
import { isStorageAvailable } from './lib/balances-storage'
import { formatAmount } from './lib/format'

function StorageWarning() {
  useEffect(() => {
    if (!isStorageAvailable()) {
      toast.warning('Local storage unavailable — balances will not persist this session.')
    }
  }, [])
  return null
}

export default function App() {
  const prices = usePrices()
  const tokens = prices.data?.tokens

  const balances = useBalances({
    tokens,
    onDelistedDropped: (count) => {
      if (count > 0) {
        toast(
          `Removed ${count} delisted token${count === 1 ? '' : 's'} from your balances`,
        )
      }
    },
  })

  const form = useSwapForm()
  const [reviewOpen, setReviewOpen] = useState(false)

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
    <PageLayout
      header={
        <Header
          onRefreshPrices={() => {
            prices.refetch()
          }}
          refreshing={prices.isFetching}
        />
      }
    >
      <StorageWarning />
      <SwapCard
        prices={prices}
        balances={balances}
        form={form}
        swap={swap}
        reviewOpen={reviewOpen}
        onReviewOpenChange={setReviewOpen}
      />
    </PageLayout>
  )
}
