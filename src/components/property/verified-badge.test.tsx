import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VerifiedBadge } from './verified-badge'

describe('VerifiedBadge', () => {
  it('renders the verified badge with correct text', () => {
    render(<VerifiedBadge />)
    expect(screen.getByText(/verified/i)).toBeInTheDocument()
  })
})
