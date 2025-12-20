import { z } from 'zod';

// Property filter validation for public API
export const propertyFiltersSchema = z.object({
  listing_type: z.enum(['sale', 'rent']).optional(),
  property_type: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .pipe(z.array(z.enum(['1rk', '1bhk', '2bhk', '3bhk', 'shop', 'office'])))
    .optional(),
  building_id: z.string().uuid().optional(),
  min_price: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
  max_price: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
  bedrooms: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0).max(4))
    .optional(),
  furnishing: z.enum(['unfurnished', 'semi_furnished', 'fully_furnished']).optional(),
  page: z
    .string()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .default('12')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(50)),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).default('newest'),
});

export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;

// Favorite validation
export const favoriteSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;
