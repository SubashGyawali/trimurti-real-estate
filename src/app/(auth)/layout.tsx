import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s | Trimurti Real Estate",
    default: "Authentication",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col overflow-y-auto bg-gradient-to-br from-[hsl(var(--brand-blue))] to-primary">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex justify-center pt-8 md:pt-12">
        <Link
          href="/"
          className="text-2xl font-bold text-white transition-opacity hover:opacity-90 md:text-3xl"
        >
          Trimurti{" "}
          <span className="text-[hsl(var(--brand-gold))]">Real Estate</span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-6 text-center text-sm text-white/60">
        <p>&copy; {new Date().getFullYear()} Trimurti Real Estate. All rights reserved.</p>
      </div>
    </div>
  );
}
