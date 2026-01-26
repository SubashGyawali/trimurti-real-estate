"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Phone, MessageCircle, User, LogOut, Heart, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/auth-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PHONE_NUMBER = "+91 98765 43210";
const WHATSAPP_NUMBER = "919876543210";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isAuthenticated, isLoading, isAdmin, profile, signOut } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello! I'm interested in learning more about properties.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled
            ? "bg-primary/95 shadow-md backdrop-blur-md"
            : "bg-primary"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center justify-self-start">
              <motion.span
                className="text-xl font-bold text-white md:text-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Trimurti{" "}
                <span className="text-[hsl(var(--brand-gold))]">Real Estate</span>
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "text-[hsl(var(--brand-gold))]"
                        : "text-white/90 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center justify-self-end gap-2">
              {/* Phone - Desktop only */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-white hover:bg-white/10 hover:text-white lg:flex"
                asChild
              >
                <a href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {PHONE_NUMBER}
                </a>
              </Button>

              {/* WhatsApp Button - Desktop only */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-9 w-9 rounded-full bg-[#25D366] text-white hover:bg-[#20BD5A] md:flex"
                onClick={handleWhatsAppClick}
                aria-label="Contact via WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* User Menu - Desktop */}
              <div className="hidden md:block">
                {isLoading ? (
                  <Skeleton className="h-9 w-24 bg-white/20" />
                ) : isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full p-0 hover:bg-white/10"
                      >
                        <Avatar className="h-9 w-9 border-2 border-white/30">
                          <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                            {getInitials(profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites" className="flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          Saved Properties
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center">
                              <Shield className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/login">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white md:hidden"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        profile={profile}
        onSignOut={handleSignOut}
      />
    </>
  );
}
