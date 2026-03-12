// src/lib/data/landing-data.ts
// Sample data for landing page sections

import {
  Calendar,
  Users,
  Building2,
  MapPin,
  FileText,
  Shield,
  Heart,
} from "lucide-react";
import type {
  FeaturedListing,
  TeamMember,
  Testimonial,
  Feature,
  StatItem,
  HeroContent,
  BannerContent,
  FAQItem,
} from "@/types/landing";

/**
 * Hero section content
 */
export const heroContent: HeroContent = {
  badge: "Trusted Real Estate Partner Since 2004",
  title: "Find Your Dream Home",
  highlightedText: "in Kandivali West",
  subtitle:
    "20+ years of trusted real estate service in MHADA Complex. Your dream home is just a search away.",
  primaryCta: {
    text: "Browse Properties",
    href: "/properties",
  },
  secondaryCta: {
    text: "Contact Us",
    href: "/contact",
  },
  // Unsplash: modern apartment building, mumbai skyline
  backgroundImage:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80",
};

/**
 * Trust badges / stats data
 */
export const trustStats: StatItem[] = [
  {
    id: "experience",
    end: 20,
    suffix: "+",
    label: "Years Experience",
    icon: Calendar,
    description: "Serving Kandivali West since 2004",
  },
  {
    id: "families",
    end: 500,
    suffix: "+",
    label: "Happy Families",
    icon: Users,
    description: "Trusted by hundreds of families",
  },
  {
    id: "buildings",
    end: 53,
    suffix: "",
    label: "Buildings Covered",
    icon: Building2,
    description: "MHADA Complex & nearby areas",
  },
];

/**
 * Sample featured listings
 * Replace image URLs with actual Supabase storage URLs in production
 * Unsplash keywords: apartment interior, living room, bedroom, kitchen
 */
export const sampleListings: FeaturedListing[] = [
  {
    id: "1",
    title: "Spacious 2 BHK in Tower A",
    slug: "spacious-2bhk-tower-a",
    price: 8500000,
    listingType: "sale",
    propertyType: "2bhk",
    carpetArea: 650,
    bedrooms: 2,
    bathrooms: 2,
    floor: 5,
    totalFloors: 24,
    furnishing: "semi_furnished",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    ],
    building: "MHADA Tower A",
    isVerified: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "Cozy 1 BHK Near Garden",
    slug: "cozy-1bhk-near-garden",
    price: 12000,
    listingType: "rent",
    propertyType: "1bhk",
    carpetArea: 450,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 7,
    furnishing: "fully_furnished",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    ],
    building: "MHADA Building 15",
    isVerified: true,
    isFeatured: true,
  },
  {
    id: "3",
    title: "Budget-Friendly 1 RK",
    slug: "budget-friendly-1rk",
    price: 7000,
    listingType: "rent",
    propertyType: "1rk",
    carpetArea: 280,
    floor: 2,
    totalFloors: 7,
    furnishing: "unfurnished",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    building: "MHADA Building 22",
    isVerified: false,
    isFeatured: true,
  },
  {
    id: "4",
    title: "Premium 3 BHK with Balcony",
    slug: "premium-3bhk-balcony",
    price: 15500000,
    listingType: "sale",
    propertyType: "3bhk",
    carpetArea: 950,
    bedrooms: 3,
    bathrooms: 2,
    floor: 12,
    totalFloors: 24,
    furnishing: "semi_furnished",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
    building: "MHADA Tower B",
    isVerified: true,
    isFeatured: true,
  },
  {
    id: "5",
    title: "Well-Maintained 2 BHK for Rent",
    slug: "well-maintained-2bhk-rent",
    price: 18000,
    listingType: "rent",
    propertyType: "2bhk",
    carpetArea: 600,
    bedrooms: 2,
    bathrooms: 1,
    floor: 4,
    totalFloors: 7,
    furnishing: "semi_furnished",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    building: "MHADA Building 8",
    isVerified: true,
    isFeatured: true,
  },
  {
    id: "6",
    title: "Corner Shop in Prime Location",
    slug: "corner-shop-prime-location",
    price: 3500000,
    listingType: "sale",
    propertyType: "shop",
    carpetArea: 200,
    furnishing: "unfurnished",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80",
    building: "MHADA Commercial Block",
    isVerified: true,
    isFeatured: true,
  },
];

/**
 * Features section data
 */
export const features: Feature[] = [
  {
    id: "local-expertise",
    icon: MapPin,
    title: "Local Expertise",
    description:
      "Deep knowledge of Kandivali West real estate market with 20+ years of experience in MHADA properties.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "documentation",
    icon: FileText,
    title: "Hassle-Free Documentation",
    description:
      "Complete assistance with property documentation, legal verification, and registration process.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "verified-listings",
    icon: Shield,
    title: "Verified Listings",
    description:
      "Every property is personally verified for authenticity, legal clarity, and accurate pricing.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "personal-touch",
    icon: Heart,
    title: "Personal Touch",
    description:
      "Dedicated personal attention to understand your needs and find the perfect home for your family.",
    color: "bg-rose-100 text-rose-600",
  },
];

/**
 * Team members / agents data
 */
export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Mr. Niraj Koirala",
    title: "Proprietor & Principal Broker",
    image: "/images/Niraj Picture.jpg",
    experience: "20+ years in Kandivali real estate",
    phone: "+91 98194 46163",
    whatsapp: "919819446163",
    email: "niraj@trimurtirealestate.com",
    bio: "A trusted name in Kandivali West, Mr. Niraj has guided 500+ families through MHADA sales, rentals, and resale decisions.",
    isFounder: true,
    founderBio:
      "Since 2004, Mr. Niraj Koirala has been the go-to real estate expert in Kandivali West. With an intimate knowledge of every building, every floor, and every corner of the MHADA complex, he has built Trimurti Real Estate into the most trusted property agency in the area. His commitment to transparency, honest pricing, and personal attention has helped over 500 families settle into their dream homes.",
    specializations: [
      "MHADA Property Resales",
      "Property Valuation",
      "Legal Documentation",
      "Rental Management",
    ],
    stats: [
      { value: 20, suffix: "+", label: "Years Experience" },
      { value: 500, suffix: "+", label: "Families Helped" },
      { value: 53, suffix: "", label: "Buildings Covered" },
    ],
    socialLinks: {
      facebook: "https://facebook.com/trimurtirealestate",
      instagram: "https://instagram.com/trimurtirealestate",
    },
  },
  {
    id: "2",
    name: "Mr. Devashish Bhattacharya",
    title: "Property Consultant",
    image: "/images/Devashish Bhattacharya.png",
    experience: "10 years experience",
    phone: "+91 70651 30907",
    whatsapp: "917065130907",
    email: "devashish@trimurtirealestate.com",
    bio: "Helps families shortlist practical rental options and relocate smoothly within Kandivali West.",
    specializations: ["Rental Properties", "Family Relocations", "Tenant Screening"],
  },
  {
    id: "3",
    name: "Mr. Subash Gyawali",
    title: "Media Manager",
    image: "/images/Subash.jpeg",
    experience: "6 years experience",
    phone: "+91 85912 27626",
    whatsapp: "918591227626",
    email: "subash@trimurtirealestate.com",
    bio: "Manages digital presence, property photography, and media outreach to showcase Trimurti's listings effectively.",
    specializations: ["Digital Marketing", "Property Photography", "Social Media"],
  },
];

/**
 * Customer testimonials
 */
export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "Trimurti Real Estate made our home-buying journey smooth and stress-free. Mr. Niraj's deep knowledge of MHADA properties helped us find the perfect 2BHK within our budget. Highly recommended!",
    name: "Ravi & Priya Sharma",
    location: "MHADA Tower A, Kandivali West",
    rating: 5,
    propertyType: "2 BHK Purchase",
    date: "2024",
  },
  {
    id: "2",
    quote:
      "We were new to Mumbai and needed a rental urgently. The team at Trimurti understood our requirements perfectly and found us a lovely 1BHK near the garden within a week. The documentation was handled professionally.",
    name: "Amit Patel",
    location: "MHADA Building 15",
    rating: 5,
    propertyType: "1 BHK Rental",
    date: "2024",
  },
  {
    id: "3",
    quote:
      "After trying multiple agents, we finally found Trimurti Real Estate. Their transparency about pricing and honest advice about properties saved us from making a costly mistake. Trustworthy and reliable!",
    name: "Sunita Deshmukh",
    location: "MHADA Building 22, Kandivali West",
    rating: 5,
    propertyType: "2 BHK Purchase",
    date: "2023",
  },
];

/**
 * CTA Banner content
 */
export const ctaBannerContent: BannerContent = {
  title: "Looking for Something Specific?",
  subtitle:
    "Tell us your requirements and we'll help you find the perfect property. No obligation, just honest advice.",
  cta: {
    text: "Share Your Requirements",
    href: "/contact?type=requirements",
  },
  secondaryCta: {
    text: "Call Now",
    href: "tel:+919819446163",
  },
  // Unsplash: modern apartment building exterior, family home
  backgroundImage:
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80",
};

/**
 * FAQ data for structured data
 */
export const faqs: FAQItem[] = [
  {
    question: "What areas do you cover in Kandivali West?",
    answer:
      "We specialize in MHADA Complex properties including all 53 seven-storied buildings and 24-storied towers. We also cover nearby private buildings like Bhoomi Park, Marina, and Dotam.",
  },
  {
    question: "What types of properties do you deal with?",
    answer:
      "We handle 1RK, 1BHK, 2BHK, and 3BHK residential apartments for both sale and rent. We also assist with commercial spaces like shops and offices in the MHADA area.",
  },
  {
    question: "Do you help with property documentation?",
    answer:
      "Yes, we provide complete assistance with property documentation including legal verification, society NOC, stamp duty, registration, and transfer procedures for MHADA properties.",
  },
  {
    question: "How can I schedule a property visit?",
    answer:
      "You can schedule a property visit by calling us, sending a WhatsApp message, or filling out the contact form on our website. We typically arrange visits within 24-48 hours.",
  },
];

/**
 * Contact information
 */
export const contactInfo = {
  phone: "+91 98194 46163",
  whatsapp: "919819446163",
  email: "info@trimurtirealestate.com",
  address: "30/007, Dolphin CHS, CSR Complex, Opp. Ekta Nagar, Kandivali West, Mumbai 400067",
  workingHours: "Mon-Sat: 10:00 AM - 7:00 PM",
  googleMapsUrl: "https://maps.google.com/?q=19.2094,72.8544",
};

/**
 * Social media links
 */
export const socialLinks = {
  facebook: "https://facebook.com/trimurtirealestate",
  instagram: "https://instagram.com/trimurtirealestate",
  youtube: "https://youtube.com/@trimurtirealestate",
  twitter: "https://twitter.com/trimurtire",
};
