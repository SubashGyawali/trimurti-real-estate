import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo";
import { OfflineIndicator } from "@/components/offline-indicator";
import { siteConfig } from "@/lib/site-config";
import { buildOpenGraphImage, resolveAbsoluteUrl } from "@/lib/social-meta";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const facebookAppId = process.env.NEXT_PUBLIC_FB_APP_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Trimurti Real Estate | Mumbai Properties",
    template: "%s | Trimurti Real Estate",
  },
  description: siteConfig.description.full,
  keywords: [
    "real estate",
    "Mumbai",
    "Kandivali West",
    "Malad West",
    "flats for sale",
    "flats for rent",
    "property",
    "1BHK",
    "2BHK",
    "3BHK",
    "property dealer",
    "real estate agent Mumbai",
    "affordable housing Mumbai",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Trimurti Real Estate | Mumbai Properties",
    description: siteConfig.description.og,
    images: [
      buildOpenGraphImage(
        siteConfig.images.ogDefault,
        siteConfig.images.ogDefaultAlt,
        siteConfig.images.ogWidth,
        siteConfig.images.ogHeight
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.twitter,
    creator: siteConfig.social.twitter,
    title: "Trimurti Real Estate | Mumbai Properties",
    description: siteConfig.description.og,
    images: [
      {
        url: resolveAbsoluteUrl(siteConfig.images.ogDefault),
        alt: siteConfig.images.ogDefaultAlt,
      },
    ],
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
  alternates: {
    canonical: "/",
  },
  other: {
    "pinterest-rich-pin": "true",
    "msapplication-TileColor": "#1e3a5f",
    ...(facebookAppId ? { "fb:app_id": facebookAppId } : {}),
  },
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster position="top-right" richColors />
          <OfflineIndicator />
        </AuthProvider>
      </body>
    </html>
  );
}
