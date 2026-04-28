import { useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
  onClick: () => void
}

export function FlipDirectionButton({ onClick }: Props) {
  const [spin, setSpin] = useState(false)
  return (
    <div className="-my-2 flex justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Swap pair"
            onClick={() => {
              setSpin((s) => !s)
              onClick()
            }}
            className="size-10 rounded-full border-4 border-card bg-background shadow-md transition-all hover:scale-110 hover:border-indigo-400/30 hover:bg-gradient-to-br hover:from-indigo-500/10 hover:to-fuchsia-500/10 hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:border-fuchsia-400/30 dark:hover:shadow-fuchsia-500/20"
          >
            <ArrowDown
              className={cn(
                'size-4 transition-transform duration-200',
                spin && 'rotate-180',
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Swap pair</TooltipContent>
      </Tooltip>
    </div>
  )
}
