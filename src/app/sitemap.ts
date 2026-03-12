import type { MetadataRoute } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Use direct Supabase client for sitemap — no cookies/request context is
// available during sitemap generation, so the prescribed server client
// (which relies on cookies()) cannot be used here.
function createPublicClient() {
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL || 'https://trimurtirealestate.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/requirements`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Fetch dynamic property pages (public data, no auth needed)
  try {
    const supabase = createPublicClient();
    const { data: properties } = (await supabase
      .from('properties')
      .select('slug, updated_at')
      .eq('is_active', true)) as {
      data: Array<{ slug: string; updated_at: string }> | null;
    };

    const propertyPages: MetadataRoute.Sitemap = (properties || []).map((property) => ({
      url: `${baseUrl}/properties/${property.slug}`,
      lastModified: new Date(property.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...propertyPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
