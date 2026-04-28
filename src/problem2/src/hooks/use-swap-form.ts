import { useCallback, useEffect, useState } from 'react'
import { computeRate, computeReceive, computePay } from '@/lib/swap-math'
import { parseAmount, toDecimalString } from '@/lib/format'
import { Side, type Token } from '@/types/swap'

type State = {
  payToken: Token | null
  receiveToken: Token | null
  payAmount: string
  receiveAmount: string
  lastEditedSide: Side
}

const INITIAL: State = {
  payToken: null,
  receiveToken: null,
  payAmount: '',
  receiveAmount: '',
  lastEditedSide: Side.Pay,
}

type UseSwapFormReturn = {
  payToken: Token | null
  receiveToken: Token | null
  payAmount: string
  receiveAmount: string
  setPayToken: (token: Token) => void
  setReceiveToken: (token: Token) => void
  setPayAmount: (raw: string) => void
  setReceiveAmount: (raw: string) => void
  flip: () => void
  resetAmounts: () => void
}

export function useSwapForm(): UseSwapFormReturn {
  const [state, setState] = useState<State>(INITIAL)

  const setPayToken = useCallback((token: Token) => {
    setState((prev) => {
      // Auto-flip if user picked the token already on the other side
      if (prev.receiveToken && prev.receiveToken.symbol === token.symbol) {
        return { ...prev, payToken: token, receiveToken: prev.payToken }
      }
      return { ...prev, payToken: token }
    })
  }, [])

  const setReceiveToken = useCallback((token: Token) => {
    setState((prev) => {
      if (prev.payToken && prev.payToken.symbol === token.symbol) {
        return { ...prev, receiveToken: token, payToken: prev.receiveToken }
      }
      return { ...prev, receiveToken: token }
    })
  }, [])

  const setPayAmount = useCallback((raw: string) => {
    setState((prev) => {
      const next = parseAmount(raw, prev.payAmount)
      const rate =
        prev.payToken && prev.receiveToken
          ? computeRate(prev.payToken.price, prev.receiveToken.price)
          : 0
      const numericPay = Number(next || '0')
      const receive = computeReceive(numericPay, rate)
      return {
        ...prev,
        payAmount: next,
        receiveAmount: receive > 0 ? toDecimalString(receive) : '',
        lastEditedSide: Side.Pay,
      }
    })
  }, [])

  const setReceiveAmount = useCallback((raw: string) => {
    setState((prev) => {
      const next = parseAmount(raw, prev.receiveAmount)
      const rate =
        prev.payToken && prev.receiveToken
          ? computeRate(prev.payToken.price, prev.receiveToken.price)
          : 0
      const numericReceive = Number(next || '0')
      const pay = computePay(numericReceive, rate)
      return {
        ...prev,
        receiveAmount: next,
        payAmount: pay > 0 ? toDecimalString(pay) : '',
        lastEditedSide: Side.Receive,
      }
    })
  }, [])

  const flip = useCallback(() => {
    setState((prev) => ({
      payToken: prev.receiveToken,
      receiveToken: prev.payToken,
      payAmount: prev.receiveAmount,
      receiveAmount: prev.payAmount,
      lastEditedSide: prev.lastEditedSide === Side.Pay ? Side.Receive : Side.Pay,
    }))
  }, [])

  const resetAmounts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      payAmount: '',
      receiveAmount: '',
      lastEditedSide: Side.Pay,
    }))
  }, [])

  // When the token pair or its prices change, recompute the non-edited side
  // from the latest state via setState's prev callback so we don't read stale
  // closure values.
  useEffect(() => {
    setState((prev) => {
      if (!prev.payToken || !prev.receiveToken) return prev
      const rate = computeRate(prev.payToken.price, prev.receiveToken.price)
      if (rate <= 0) return prev

      if (prev.lastEditedSide === Side.Pay) {
        const num = Number(prev.payAmount || '0')
        const receive = computeReceive(num, rate)
        const formatted = receive > 0 ? toDecimalString(receive) : ''
        return formatted === prev.receiveAmount ? prev : { ...prev, receiveAmount: formatted }
      }

      const num = Number(prev.receiveAmount || '0')
      const pay = computePay(num, rate)
      const formatted = pay > 0 ? toDecimalString(pay) : ''
      return formatted === prev.payAmount ? prev : { ...prev, payAmount: formatted }
    })
  }, [state.payToken, state.receiveToken])

  return {
    payToken: state.payToken,
    receiveToken: state.receiveToken,
    payAmount: state.payAmount,
    receiveAmount: state.receiveAmount,
    setPayToken,
    setReceiveToken,
    setPayAmount,
    setReceiveAmount,
    flip,
    resetAmounts,
  }
}
