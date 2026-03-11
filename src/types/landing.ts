// src/types/landing.ts
// TypeScript interfaces for landing page components

import type { LucideIcon } from "lucide-react";

/**
 * Featured listing data for landing page cards
 */
export interface FeaturedListing {
  id: string;
  title: string;
  slug: string;
  price: number;
  listingType: "sale" | "rent";
  propertyType: "1rk" | "1bhk" | "2bhk" | "3bhk" | "shop" | "office";
  carpetArea: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  furnishing: "unfurnished" | "semi_furnished" | "fully_furnished";
  image: string;
  images?: string[];
  building?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
}

/**
 * Team member/agent profile data
 */
export interface TeamMember {
  id: string;
  name: string;
  title: string;
  image: string;
  experience: string;
  phone: string;
  whatsapp: string;
  email?: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  isFounder?: boolean;
  founderBio?: string;
  specializations?: string[];
  stats?: Array<{ value: number; suffix: string; label: string }>;
}

/**
 * Customer testimonial data
 */
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number;
  avatar?: string;
  propertyType?: string;
  date?: string;
}

/**
 * Feature tile data for features section
 */
export interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

/**
 * Stat counter data for trust badges
 */
export interface StatItem {
  id: string;
  end: number;
  suffix: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

/**
 * CTA Banner props
 */
export interface BannerContent {
  title: string;
  subtitle: string;
  cta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  backgroundImage: string;
}

/**
 * Hero section content
 */
export interface HeroContent {
  badge?: string;
  title: string;
  highlightedText: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
  backgroundImage: string;
}

/**
 * Contact form data
 */
export interface LandingContactFormData {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

/**
 * FAQ item for structured data
 */
export interface FAQItem {
  question: string;
  answer: string;
}
