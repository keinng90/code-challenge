import { RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

type Props = {
  onRefreshPrices: () => void
  refreshing?: boolean
}

export function Header({ onRefreshPrices, refreshing = false }: Props) {
  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-6">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
        <span className="text-base font-semibold tracking-tight">Swap</span>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh prices"
              onClick={onRefreshPrices}
              disabled={refreshing}
            >
              <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh prices</TooltipContent>
        </Tooltip>
        <ThemeToggle />
      </div>
    </header>
  )
}
