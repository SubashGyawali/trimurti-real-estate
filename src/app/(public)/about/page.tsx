import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { AboutContent } from "./_components/about-content";

// Static page - revalidate every 24 hours
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "About Us | Trimurti Real Estate",
  description:
    "Learn about Trimurti Real Estate - 20+ years of trusted real estate service in Kandivali West, Mumbai. Meet Mr. Niraj Koirala and discover our story.",
  openGraph: {
    title: "About Us | Trimurti Real Estate",
    description:
      "20+ years of trusted real estate service in Kandivali West, Mumbai.",
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.images.ogDefault,
        width: siteConfig.images.ogWidth,
        height: siteConfig.images.ogHeight,
        alt: siteConfig.images.ogDefaultAlt,
        type: "image/jpeg",
      },
    ],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
