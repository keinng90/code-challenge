export type Token = {
  symbol: string
  price: number
  iconUrl: string
  lastUpdated: Date
}

export type Side = 'pay' | 'receive'

export const Side = {
  Pay: 'pay',
  Receive: 'receive',
} as const satisfies Record<string, Side>

export type StatusKind =
  | 'no-pay-token'
  | 'no-receive-token'
  | 'no-amount'
  | 'negative'
  | 'insufficient'
  | 'prices-stale'
  | 'ready'

export const StatusKind = {
  NoPayToken: 'no-pay-token',
  NoReceiveToken: 'no-receive-token',
  NoAmount: 'no-amount',
  Negative: 'negative',
  Insufficient: 'insufficient',
  PricesStale: 'prices-stale',
  Ready: 'ready',
} as const satisfies Record<string, StatusKind>

export type SwapStatus =
  | { kind: typeof StatusKind.NoPayToken }
  | { kind: typeof StatusKind.NoReceiveToken }
  | { kind: typeof StatusKind.NoAmount }
  | { kind: typeof StatusKind.Negative }
  | { kind: typeof StatusKind.Insufficient; symbol: string }
  | { kind: typeof StatusKind.PricesStale }
  | { kind: typeof StatusKind.Ready }

export type SwapInput = {
  payToken: Token
  receiveToken: Token
  payAmount: number
  receiveAmount: number
  rate: number
}
