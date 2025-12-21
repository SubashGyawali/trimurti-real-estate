import { render, screen } from '@testing-library/react'
import { VerifiedBadge } from './verified-badge'

describe('VerifiedBadge', () => {
  it('renders the verified badge with correct text', () => {
    render(<VerifiedBadge />)
    expect(screen.getByText(/verified/i)).toBeInTheDocument()
  })
})
