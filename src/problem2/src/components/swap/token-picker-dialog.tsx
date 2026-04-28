import { useMemo } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TokenIcon } from '@/components/token-icon'
import { formatAmount, formatUsd } from '@/lib/format'
import type { Token } from '@/types/swap'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: Token[]
  balances: Record<string, number>
  onSelect: (token: Token) => void
  excludeSymbol?: string
}

export function TokenPickerDialog({
  open,
  onOpenChange,
  tokens,
  balances,
  onSelect,
  excludeSymbol,
}: Props) {
  const sorted = useMemo(() => {
    const filtered = excludeSymbol
      ? tokens.filter((t) => t.symbol !== excludeSymbol)
      : tokens
    // tokens with balance first (descending USD value), then alphabetical
    return [...filtered].sort((a, b) => {
      const aUsd = (balances[a.symbol] ?? 0) * a.price
      const bUsd = (balances[b.symbol] ?? 0) * b.price
      if (aUsd !== bUsd) return bUsd - aUsd
      return a.symbol.localeCompare(b.symbol)
    })
  }, [tokens, balances, excludeSymbol])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-5 pb-2 pt-5">
          <DialogTitle>Select token</DialogTitle>
        </DialogHeader>
        <Command className="rounded-none">
          <CommandInput placeholder="Search by name or symbol" />
          <CommandList className="max-h-80">
            <CommandEmpty>No tokens found.</CommandEmpty>
            <CommandGroup>
              {sorted.map((token) => {
                const balance = balances[token.symbol] ?? 0
                return (
                  <CommandItem
                    key={token.symbol}
                    value={token.symbol}
                    onSelect={() => {
                      onSelect(token)
                      onOpenChange(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3"
                  >
                    <TokenIcon
                      symbol={token.symbol}
                      src={token.iconUrl}
                      className="size-7 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{token.symbol}</span>
                    <div className="flex shrink-0 flex-col items-end text-sm">
                      <span className="tabular-nums">{formatAmount(balance)}</span>
                      <span className="text-muted-foreground tabular-nums text-xs">
                        {formatUsd(balance * token.price)}
                      </span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
