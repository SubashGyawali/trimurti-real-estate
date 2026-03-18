import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { ContactContent } from "./_components/contact-content";

export const metadata: Metadata = {
  title: "Contact Us | Trimurti Real Estate",
  description:
    "Get in touch with Trimurti Real Estate for property inquiries in Kandivali West, Mumbai. Call, WhatsApp, or visit us. We're here to help you find your perfect home.",
  openGraph: {
    title: "Contact Us | Trimurti Real Estate",
    description:
      "Reach out to Trimurti Real Estate for property inquiries in Kandivali West, Mumbai.",
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

export default function ContactPage() {
  return <ContactContent />;
}
