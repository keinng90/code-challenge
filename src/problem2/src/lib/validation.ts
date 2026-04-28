import { StatusKind, type SwapStatus, type Token } from '@/types/swap'

export type DeriveStatusInput = {
  payToken: Token | null
  receiveToken: Token | null
  payAmount: string
  balances: Record<string, number>
  pricesStale: boolean
}

export function deriveStatus(input: DeriveStatusInput): SwapStatus {
  if (input.pricesStale) return { kind: StatusKind.PricesStale }
  if (!input.payToken) return { kind: StatusKind.NoPayToken }

  const trimmed = input.payAmount.trim()
  const amount = trimmed === '' ? NaN : Number(trimmed)

  if (!Number.isNaN(amount)) {
    if (amount < 0) return { kind: StatusKind.Negative }
    const balance = input.balances[input.payToken.symbol] ?? 0
    if (amount > balance) return { kind: StatusKind.Insufficient, symbol: input.payToken.symbol }
  }

  if (!input.receiveToken) return { kind: StatusKind.NoReceiveToken }

  if (trimmed === '' || Number.isNaN(amount) || amount === 0) return { kind: StatusKind.NoAmount }

  return { kind: StatusKind.Ready }
}
