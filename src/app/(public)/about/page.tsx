import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { buildOpenGraphImage } from "@/lib/social-meta";
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
    url: `${siteConfig.url}/about`,
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    images: [
      buildOpenGraphImage(
        siteConfig.images.ogDefault,
        siteConfig.images.ogDefaultAlt,
        siteConfig.images.ogWidth,
        siteConfig.images.ogHeight
      ),
    ],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
