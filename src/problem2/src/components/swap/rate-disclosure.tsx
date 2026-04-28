import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { computeRate } from '@/lib/swap-math'
import { formatRate } from '@/lib/format'
import type { Token } from '@/types/swap'

type Props = {
  payToken: Token | null
  receiveToken: Token | null
  updatedAt: Date | undefined
  now: number
}

function timeAgo(updatedAt: Date | undefined, now: number): string {
  if (!updatedAt) return ''
  const seconds = Math.max(0, Math.floor((now - updatedAt.getTime()) / 1000))
  if (seconds < 60) return `Updated ${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `Updated ${minutes}m ago`
}

export function RateDisclosure({ payToken, receiveToken, updatedAt, now }: Props) {
  const [inverted, setInverted] = useState(false)

  if (!payToken || !receiveToken) return null

  const directRate = computeRate(payToken.price, receiveToken.price)
  const inverseRate = computeRate(receiveToken.price, payToken.price)
  if (directRate <= 0) return null

  const text = inverted
    ? formatRate(inverseRate, receiveToken.symbol, payToken.symbol)
    : formatRate(directRate, payToken.symbol, receiveToken.symbol)

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => setInverted((v) => !v)}
      className="mt-3 h-auto w-full justify-between rounded-xl px-3 py-2 text-xs font-normal text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground"
    >
      <span className="tabular-nums">{text}</span>
      <span>{timeAgo(updatedAt, now)}</span>
    </Button>
  )
}
