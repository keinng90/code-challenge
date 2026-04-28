import type { Token } from '@/types/swap'

export const STORAGE_KEY = 'swap.balances.v1'
const SEED_HIGH_USD = 5000
const SEED_MID_USD = 50
const PROBE_KEY = 'swap.__probe__'

export type BalancesMap = Record<string, number>

export function isStorageAvailable(): boolean {
  try {
    localStorage.setItem(PROBE_KEY, '1')
    localStorage.removeItem(PROBE_KEY)
    return true
  } catch {
    return false
  }
}

export function readBalances(): BalancesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as BalancesMap
    return {}
  } catch {
    return {}
  }
}

export function writeBalances(balances: BalancesMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(balances))
  } catch {
    // swallowed: caller decides whether to surface a toast
  }
}

export function seedBalances(tokens: Token[], rng: () => number = Math.random): BalancesMap {
  const out: BalancesMap = {}
  for (const token of tokens) {
    const r = rng()
    let usd: number
    if (r < 0.2) {
      usd = 0
    } else if (r < 0.5) {
      // 1..50 USD
      usd = 1 + rng() * (SEED_MID_USD - 1)
    } else {
      // 50..5000 USD
      usd = SEED_MID_USD + rng() * (SEED_HIGH_USD - SEED_MID_USD)
    }
    const amount = token.price > 0 ? usd / token.price : 0
    out[token.symbol] = Math.round(amount * 1_000_000) / 1_000_000
  }
  return out
}
