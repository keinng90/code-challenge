export function computeRate(fromPrice: number, toPrice: number): number {
  if (!fromPrice || !toPrice) return 0
  return fromPrice / toPrice
}

export function computeReceive(payAmount: number, rate: number): number {
  if (payAmount <= 0 || rate <= 0) return 0
  return payAmount * rate
}

export function computePay(receiveAmount: number, rate: number): number {
  if (receiveAmount <= 0 || rate <= 0) return 0
  return receiveAmount / rate
}
