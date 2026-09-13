import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { buildOpenGraphImage } from "@/lib/social-meta";
import { PrivacyContent } from "./_components/privacy-content";

// Static page - revalidate every 24 hours
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Privacy Policy | Trimurti Real Estate",
  description:
    "Learn how Trimurti Real Estate collects, uses, and protects your personal information. Your privacy matters to us. Read our complete privacy policy.",
  openGraph: {
    title: "Privacy Policy | Trimurti Real Estate",
    description:
      "How we collect, use, and protect your personal information when you use our services.",
    url: `${siteConfig.url}/privacy`,
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

export default function PrivacyPage() {
  return <PrivacyContent />;
}