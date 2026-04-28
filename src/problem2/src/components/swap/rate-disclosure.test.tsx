import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RateDisclosure } from './rate-disclosure'
import type { Token } from '@/types/swap'

const ETH: Token = { symbol: 'ETH', price: 2000, iconUrl: 'x', lastUpdated: new Date() }
const USDC: Token = { symbol: 'USDC', price: 1, iconUrl: 'x', lastUpdated: new Date() }

describe('RateDisclosure', () => {
  it('displays the direct rate by default and inverts on click', async () => {
    const user = userEvent.setup()
    render(<RateDisclosure payToken={ETH} receiveToken={USDC} updatedAt={new Date()} now={Date.now()} />)

    expect(screen.getByText('1 ETH ≈ 2,000 USDC')).toBeInTheDocument()

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('1 USDC ≈ 0.0005 ETH')).toBeInTheDocument()
  })

  it('renders nothing when either token is missing', () => {
    const { container } = render(
      <RateDisclosure payToken={null} receiveToken={USDC} updatedAt={new Date()} now={Date.now()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
