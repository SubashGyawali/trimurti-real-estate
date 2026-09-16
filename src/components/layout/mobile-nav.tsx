"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle, User, LogIn, Heart, LogOut, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PHONE_NUMBER = "+91 98194 46163";
const WHATSAPP_NUMBER = "919819446163";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  user?: SupabaseUser | null;
  profile?: Profile | null;
  onSignOut?: () => void;
}

export function MobileNav({
  isOpen,
  onClose,
  isAuthenticated = false,
  isAdmin = false,
  user,
  profile,
  onSignOut,
}: MobileNavProps) {
  const pathname = usePathname();

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello! I'm interested in learning more about properties.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] bg-primary p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-left">
            <span className="text-xl font-bold text-white">
              Trimurti{" "}
              <span className="text-[hsl(var(--brand-gold))]">Real Estate</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <Separator className="bg-white/20" />

        <nav className="flex flex-col p-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "py-3 text-lg font-medium transition-colors",
                pathname === link.href
                  ? "text-[hsl(var(--brand-gold))]"
                  : "text-white/90 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Separator className="bg-white/20" />

        <div className="flex flex-col gap-3 p-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <a href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" />
              {PHONE_NUMBER}
            </a>
          </Button>

          <Button
            className="w-full justify-start gap-3 bg-[#25D366] text-white hover:bg-[#20BD5A]"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Us
          </Button>
        </div>

        <div className="flex flex-col gap-2 p-6">
          {isAuthenticated ? (
            <>
              {profile?.full_name && (
                <div className="mb-2 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/30">
                    {(profile?.avatar_url || user?.user_metadata?.avatar_url) && (
                      <AvatarImage
                        src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                        alt={profile?.full_name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-white/20 text-white">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-white/60">
                    Hello, {profile.full_name.split(" ")[0]}
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/profile" onClick={onClose}>
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/favorites" onClick={onClose}>
                  <Heart className="h-4 w-4" />
                  Saved Properties
                </Link>
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/admin" onClick={onClose}>
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-white/30 bg-transparent text-destructive hover:bg-white/10 hover:text-destructive"
                onClick={() => {
                  onSignOut?.();
                  onClose();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/login" onClick={onClose}>
                <LogIn className="h-4 w-4" />
                Login / Register
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
