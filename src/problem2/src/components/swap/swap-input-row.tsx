import { TokenPickerButton } from './token-picker-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatAmount, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Side, type Token } from '@/types/swap'

type Props = {
  role: Side
  token: Token | null
  amount: string
  balance: number
  onAmountChange: (raw: string) => void
  onPickToken: () => void
  pickerOpen: boolean
  errorText?: string
  showMax?: boolean
}

export function SwapInputRow({
  role,
  token,
  amount,
  balance,
  onAmountChange,
  onPickToken,
  pickerOpen,
  errorText,
  showMax = role === Side.Pay,
}: Props) {
  const usdValue = token && amount ? Number(amount) * token.price : 0
  const label = role === Side.Pay ? 'You pay' : 'You receive'
  const placeholder = role === Side.Pay ? 'Select pay token' : 'Select receive token'
  // Scale the amount font down as the string grows so big numbers don't clip.
  // Default to text-3xl; only step down when needed. Use `md:` variants too,
  // because shadcn's <Input> base class sets `md:text-sm` which would otherwise
  // shrink the amount on desktop.
  const amountSize =
    amount.length <= 11
      ? 'text-3xl md:text-3xl'
      : amount.length <= 14
        ? 'text-2xl md:text-2xl'
        : amount.length <= 17
          ? 'text-xl md:text-xl'
          : 'text-lg md:text-lg'

  return (
    <div
      className={cn(
        'rounded-2xl border border-transparent bg-gradient-to-br from-muted/60 to-muted/30 px-4 py-4 transition-all',
        'focus-within:border-indigo-400/40 focus-within:from-muted/80 focus-within:to-muted/50 focus-within:shadow-[inset_0_1px_0_0_oklch(1_0_0_/_0.06)] dark:focus-within:border-fuchsia-400/40',
        errorText && 'border-destructive/40 from-destructive/10 to-destructive/5',
      )}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {token && (
          <span className="tabular-nums">
            Balance: {formatAmount(balance)}
            {showMax && balance > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="ml-2 h-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-primary hover:bg-primary/20 hover:text-primary"
                onClick={() => onAmountChange(String(balance))}
              >
                Max
              </Button>
            )}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <Input
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className={cn(
            'h-auto min-w-0 flex-1 border-0 bg-transparent p-0 font-medium tabular-nums shadow-none transition-[font-size] placeholder:text-muted-foreground/60 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none dark:bg-transparent',
            amountSize,
          )}
          aria-label={label}
        />
        <TokenPickerButton
          token={token}
          onClick={onPickToken}
          open={pickerOpen}
          placeholder={placeholder}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">{token && amount ? formatUsd(usdValue) : ' '}</span>
        {errorText && <span className="text-destructive">{errorText}</span>}
      </div>
    </div>
  )
}
