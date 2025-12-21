import { render, screen } from '@testing-library/react'
import { PropertyHeader } from './property-header'
import type { PropertyWithDetails } from '@/types/database'

// Mock toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))

// Mock dependencies
vi.mock('@/components/property/favorite-button', () => ({
  FavoriteButton: () => <button>Favorite</button>,
}))

const mockProperty: PropertyWithDetails = {
  id: '1',
  title: 'Test Header Property',
  slug: 'test-header',
  price: 5000000,
  listing_type: 'sale',
  property_type: '1bhk',
  is_verified: true,
  created_at: '',
  updated_at: '',
  building_id: null,
  description: null,
  deposit: null,
  maintenance: null,
  carpet_area: 500,
  floor_number: 1,
  total_floors: 7,
  furnishing: 'semi_furnished',
  bedrooms: 1,
  bathrooms: 1,
  balconies: 0,
  parking: false,
  facing: null,
  availability_date: null,
  is_featured: false,
  is_active: true,
  views_count: 0,
  location_lat: null,
  location_lng: null,
  amenities: [],
  created_by: null,
  property_images: [],
  building: null
}

describe('PropertyHeader', () => {
  it('renders verified badge', () => {
    render(<PropertyHeader property={mockProperty} />)
    expect(screen.getByText(/verified/i)).toBeInTheDocument()
  })
})
