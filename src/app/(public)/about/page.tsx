import type { Metadata } from "next";
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
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
