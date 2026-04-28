import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TokenIcon } from '@/components/token-icon'
import { cn } from '@/lib/utils'
import type { Token } from '@/types/swap'

type Props = {
  token: Token | null
  onClick: () => void
  open: boolean
  placeholder?: string
}

export function TokenPickerButton({ token, onClick, open, placeholder = 'Select token' }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        'h-auto gap-2 rounded-full border-border/60 bg-background/70 px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-background',
        token && 'pl-1.5',
      )}
    >
      {token ? (
        <>
          <TokenIcon symbol={token.symbol} src={token.iconUrl} className="size-6" />
          <span>{token.symbol}</span>
        </>
      ) : (
        <span>{placeholder}</span>
      )}
      <ChevronDown
        className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
      />
    </Button>
  )
}
