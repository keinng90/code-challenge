import { ArrowDown, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TokenIcon } from '@/components/token-icon'
import { formatAmount, formatRate, formatUsd } from '@/lib/format'
import type { Token } from '@/types/swap'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  payToken: Token
  receiveToken: Token
  payAmount: number
  receiveAmount: number
  rate: number
  pending: boolean
  onConfirm: () => void
}

export function ReviewDialog({
  open,
  onOpenChange,
  payToken,
  receiveToken,
  payAmount,
  receiveAmount,
  rate,
  pending,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review swap</DialogTitle>
          <DialogDescription>
            Rate may have moved since you opened this, confirm to lock.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Row
            label="You pay"
            token={payToken}
            amount={payAmount}
          />
          <div className="-my-1 flex justify-center text-muted-foreground">
            <ArrowDown className="size-4" />
          </div>
          <Row
            label="You receive"
            token={receiveToken}
            amount={receiveAmount}
          />
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span className="tabular-nums">
              {formatRate(rate, payToken.symbol, receiveToken.symbol)}
            </span>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Swapping…
              </>
            ) : (
              'Confirm swap'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, token, amount }: { label: string; token: Token; amount: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-medium tabular-nums">
          {formatAmount(amount)} <span className="text-muted-foreground">{token.symbol}</span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatUsd(amount * token.price)}
        </span>
      </div>
      <TokenIcon symbol={token.symbol} src={token.iconUrl} className="size-9" />
    </div>
  )
}
