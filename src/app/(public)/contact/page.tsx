import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { buildOpenGraphImage } from "@/lib/social-meta";
import { ContactContent } from "./_components/contact-content";

export const metadata: Metadata = {
  title: "Contact Us | Trimurti Real Estate",
  description:
    "Get in touch with Trimurti Real Estate for property inquiries in Kandivali West, Mumbai. Call, WhatsApp, or visit us. We're here to help you find your perfect home.",
  openGraph: {
    title: "Contact Us | Trimurti Real Estate",
    description:
      "Reach out to Trimurti Real Estate for property inquiries in Kandivali West, Mumbai.",
    url: `${siteConfig.url}/contact`,
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

export default function ContactPage() {
  return <ContactContent />;
}
