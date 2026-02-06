import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { MainLayout } from "@/components/layout";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo";
import { OfflineIndicator } from "@/components/offline-indicator";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trimurtirealestate.com";
const SITE_DESCRIPTION =
  "Your trusted partner in Mumbai real estate for over 20 years. Find MHADA properties, flats for sale and rent in Kandivali West.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trimurti Real Estate | Mumbai Properties",
    template: "%s | Trimurti Real Estate",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "real estate",
    "Mumbai",
    "Kandivali West",
    "MHADA",
    "flats for sale",
    "flats for rent",
    "property",
    "1BHK",
    "2BHK",
    "3BHK",
    "MHADA complex",
    "property dealer",
    "real estate agent Mumbai",
  ],
  authors: [{ name: "Trimurti Real Estate" }],
  creator: "Trimurti Real Estate",
  publisher: "Trimurti Real Estate",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Trimurti Real Estate",
    title: "Trimurti Real Estate | Mumbai Properties",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Trimurti Real Estate - Mumbai Properties",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trimurti Real Estate | Mumbai Properties",
    description: SITE_DESCRIPTION,
    images: ["/images/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    // Add verification codes when available
    // google: "google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster position="top-right" richColors />
          <OfflineIndicator />
        </AuthProvider>
      </body>
    </html>
  );
}
