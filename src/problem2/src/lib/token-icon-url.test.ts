import { describe, it, expect } from 'vitest'
import { tokenIconUrl } from './token-icon-url'

describe('tokenIconUrl', () => {
  it('builds a Switcheo token-icons URL from a symbol', () => {
    expect(tokenIconUrl('SWTH')).toBe(
      'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg',
    )
  })

  it('uppercases lowercase symbols', () => {
    expect(tokenIconUrl('swth')).toBe(
      'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg',
    )
  })
})
