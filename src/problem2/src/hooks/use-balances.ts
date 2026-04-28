import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// Balances are seeded once on first load (when localStorage is empty)
import {
  readBalances,
  writeBalances,
  seedBalances,
  type BalancesMap,
} from '@/lib/balances-storage'
import type { Token } from '@/types/swap'

type UseBalancesArgs = {
  tokens: Token[] | undefined
  onDelistedDropped?: (count: number) => void
}

type UseBalancesReturn = {
  balances: BalancesMap
  applySwap: (
    payToken: string,
    payAmount: number,
    receiveToken: string,
    receiveAmount: number,
  ) => void
}

function balancesEqual(a: BalancesMap, b: BalancesMap): boolean {
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length) return false
  return aKeys.every((k) => a[k] === b[k])
}

export function useBalances({ tokens, onDelistedDropped }: UseBalancesArgs): UseBalancesReturn {
  const [balances, setBalances] = useState<BalancesMap>(() => readBalances())

  const onDelistedDroppedRef = useRef(onDelistedDropped)
  useEffect(() => {
    onDelistedDroppedRef.current = onDelistedDropped
  })

  const symbolsKey = useMemo(() => {
    if (!tokens || tokens.length === 0) return ''
    return tokens
      .map((t) => t.symbol)
      .sort()
      .join(',')
  }, [tokens])

  useEffect(() => {
    if (!tokens || tokens.length === 0) return

    const validSymbols = new Set(tokens.map((t) => t.symbol))
    const stored = readBalances()

    if (Object.keys(stored).length === 0) {
      const seeded = seedBalances(tokens)
      setBalances(seeded)
      writeBalances(seeded)
      return
    }

    const cleaned: BalancesMap = {}
    let dropped = 0
    for (const [symbol, amount] of Object.entries(stored)) {
      if (validSymbols.has(symbol)) cleaned[symbol] = amount
      else dropped += 1
    }
    for (const t of tokens) {
      if (!(t.symbol in cleaned)) cleaned[t.symbol] = 0
    }

    if (!balancesEqual(cleaned, stored)) {
      setBalances(cleaned)
      writeBalances(cleaned)
    }
    if (dropped > 0) onDelistedDroppedRef.current?.(dropped)
  }, [symbolsKey])

  const applySwap = useCallback(
    (
      payToken: string,
      payAmount: number,
      receiveToken: string,
      receiveAmount: number,
    ) => {
      setBalances((prev) => {
        const next = { ...prev }
        next[payToken] = Math.max(0, (prev[payToken] ?? 0) - payAmount)
        next[receiveToken] = (prev[receiveToken] ?? 0) + receiveAmount
        next[payToken] = Math.round(next[payToken] * 1_000_000) / 1_000_000
        next[receiveToken] = Math.round(next[receiveToken] * 1_000_000) / 1_000_000
        writeBalances(next)
        return next
      })
    },
    [],
  )

  return { balances, applySwap }
}
