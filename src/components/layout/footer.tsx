import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/properties?type=sale", label: "Buy Property" },
  { href: "/properties?type=rent", label: "Rent Property" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const PHONE_NUMBER = "+91 98194 46163";
const EMAIL = "info@trimurtirealestate.com";
const ADDRESS = "30/007, Dolphin CHS, CSR Complex, Opp. Ekta Nagar, Kandivali West, Mumbai 400067";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative isolate z-10 overflow-hidden bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              Trimurti{" "}
              <span className="text-[hsl(var(--brand-gold))]">Real Estate</span>
            </h3>
            <p className="text-sm leading-relaxed text-white/80">
              Your trusted partner in Mumbai real estate for over 20 years.
              Specializing in MHADA properties in Kandivali West - helping families
              find their perfect home.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[hsl(var(--brand-gold))]">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[hsl(var(--brand-gold))]">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
                  className="flex items-start gap-3 text-sm text-white/80 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  {PHONE_NUMBER}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-start gap-3 text-sm text-white/80 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{ADDRESS}</span>
              </li>
            </ul>
          </div>

          {/* Social & Business Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[hsl(var(--brand-gold))]">Connect With Us</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/trimurtiproperty"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/trimurti.real.estate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/Trimurti_Agency"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@TrimurtiRealEstate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4 space-y-1 text-sm text-white/80">
              <p className="font-medium text-white">Business Hours</p>
              <p>Mon - Sat: 10:00 AM - 8:00 PM</p>
              <p>Sunday: By Appointment</p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/20" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-white/60 md:flex-row md:text-left">
          <p>&copy; {currentYear} Trimurti Real Estate. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
