import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  symbol: string
  src: string
  className?: string
}

function hashHue(symbol: string): number {
  let h = 0
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) % 360
  return h
}

export function TokenIcon({ symbol, src, className }: Props) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    const hue = hashHue(symbol)
    return (
      <div
        aria-hidden
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
          className,
        )}
        style={{ backgroundColor: `hsl(${hue} 65% 45%)` }}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setErrored(true)}
      className={cn('inline-block shrink-0 rounded-full', className)}
    />
  )
}
