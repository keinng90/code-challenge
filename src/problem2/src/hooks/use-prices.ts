import { useQuery } from '@tanstack/react-query'
import { tokenIconUrl } from '@/lib/token-icon-url'
import type { Token } from '@/types/swap'

const PRICES_URL = 'https://interview.switcheo.com/prices.json'

type RawEntry = {
  currency: string
  date: string
  price?: number
}

type PricesData = {
  priceMap: Record<string, number>
  updatedAt: Date
  tokens: Token[]
}

async function fetchPrices(): Promise<PricesData> {
  // `cache: 'no-store'` bypasses the browser HTTP cache so a manual refresh 
  const res = await fetch(PRICES_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Prices fetch failed: ${res.status}`)
  const raw = (await res.json()) as RawEntry[]

  // Dedupe by currency keeping the latest date; drop entries without price
  const latest = new Map<string, RawEntry>()
  for (const entry of raw) {
    if (typeof entry.price !== 'number') continue
    const existing = latest.get(entry.currency)
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latest.set(entry.currency, entry)
    }
  }

  const priceMap: Record<string, number> = {}
  const tokens: Token[] = []
  for (const entry of latest.values()) {
    priceMap[entry.currency] = entry.price!
    tokens.push({
      symbol: entry.currency,
      price: entry.price!,
      iconUrl: tokenIconUrl(entry.currency),
      lastUpdated: new Date(entry.date),
    })
  }
  return { priceMap, updatedAt: new Date(), tokens }
}

export function usePrices() {
  return useQuery({
    queryKey: ['prices'],
    queryFn: fetchPrices,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}
