const BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'

export function tokenIconUrl(symbol: string): string {
  return `${BASE}/${symbol.toUpperCase()}.svg`
}
