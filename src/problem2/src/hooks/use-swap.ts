import { useMutation } from '@tanstack/react-query'
import type { SwapInput } from '@/types/swap'

const SIMULATED_DELAY_MS = 1200

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

type UseSwapArgs = {
  onSuccess: (input: SwapInput) => void
  onError?: (error: Error, input: SwapInput) => void
}

export function useSwap({ onSuccess, onError }: UseSwapArgs) {
  return useMutation({
    mutationFn: async (input: SwapInput) => {
      await delay(SIMULATED_DELAY_MS)
      return input
    },
    onSuccess,
    onError,
  })
}
