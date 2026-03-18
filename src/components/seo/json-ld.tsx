import type { PropertyWithDetails } from '@/types';
import { siteConfig } from '@/lib/site-config';

const SITE_URL = siteConfig.url;

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE_URL}/#organization`,
    name: 'Trimurti Real Estate',
    description:
      'Your trusted partner in Mumbai real estate for over 20 years. Specializing in MHADA properties, flats for sale and rent in Kandivali West.',
    url: SITE_URL,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '19:00',
      },
    ],
    areaServed: {
      '@type': 'City',
      name: 'Mumbai',
    },
    priceRange: '₹₹',
    image: `${SITE_URL}${siteConfig.images.ogDefault}`,
    logo: `${SITE_URL}${siteConfig.images.logo}`,
    sameAs: Object.values(siteConfig.social).filter((v) => v.startsWith('http')),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: 'Trimurti Real Estate',
    description: 'Real estate agency specializing in MHADA properties in Kandivali West, Mumbai',
    url: SITE_URL,
    telephone: siteConfig.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '19:00',
      },
    ],
    priceRange: '₹₹',
    image: `${SITE_URL}${siteConfig.images.ogDefault}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PropertyJsonLd({ property }: { property: PropertyWithDetails }) {
  const primaryImage =
    property.property_images?.find((img) => img.is_primary)?.image_url ||
    property.property_images?.[0]?.image_url;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${SITE_URL}/properties/${property.slug}`,
    datePosted: property.created_at,
    price: property.price,
    priceCurrency: 'INR',
    image: primaryImage,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kandivali West',
      addressRegion: 'Mumbai',
      postalCode: '400067',
      addressCountry: 'IN',
    },
    geo:
      property.location_lat && property.location_lng
        ? {
            '@type': 'GeoCoordinates',
            latitude: property.location_lat,
            longitude: property.location_lng,
          }
        : undefined,
    numberOfRooms: property.bedrooms,
    floorSize: property.carpet_area
      ? {
          '@type': 'QuantitativeValue',
          value: property.carpet_area,
          unitCode: 'FTK',
        }
      : undefined,
    broker: {
      '@type': 'RealEstateAgent',
      name: siteConfig.name,
      telephone: siteConfig.contact.phone,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Trimurti Real Estate',
    description: 'Find your dream home in Kandivali West, Mumbai',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/properties?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
