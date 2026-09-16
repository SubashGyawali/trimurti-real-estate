import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PropertyCard } from './property-card'
import type { PropertyWithImages } from '@/types/database'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

const mockProperty: PropertyWithImages = {
  id: '1',
  title: 'Test Property',
  slug: 'test-property',
  property_type: '2bhk',
  listing_type: 'sale',
  price: 10000000,
  is_verified: true,
  is_active: true,
  is_featured: false,
  created_at: '',
  updated_at: '',
  building_id: null,
  description: null,
  deposit: null,
  maintenance: null,
  carpet_area: 800,
  floor_number: 5,
  total_floors: 10,
  furnishing: 'unfurnished',
  bedrooms: 2,
  bathrooms: 2,
  balconies: 1,
  parking: true,
  facing: 'East',
  availability_date: null,
  views_count: 0,
  location_lat: null,
  location_lng: null,
  amenities: [],
  created_by: null,
  property_images: []
}

describe('PropertyCard', () => {
  it('renders verified badge when property is verified', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText(/verified/i)).toBeInTheDocument()
  })

  it('does not render verified badge when property is not verified', () => {
    const unverifiedProperty = { ...mockProperty, is_verified: false }
    render(<PropertyCard property={unverifiedProperty} />)
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument()
  })
})
