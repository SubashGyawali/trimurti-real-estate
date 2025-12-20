import type { Metadata } from "next";
import { ContactContent } from "./_components/contact-content";

// Force dynamic - contact page has a map component that requires window
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Trimurti Real Estate",
  description:
    "Get in touch with Trimurti Real Estate for property inquiries in Kandivali West, Mumbai. Call, WhatsApp, or visit us. We're here to help you find your perfect home.",
  openGraph: {
    title: "Contact Us | Trimurti Real Estate",
    description:
      "Reach out to Trimurti Real Estate for property inquiries in Kandivali West, Mumbai.",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
