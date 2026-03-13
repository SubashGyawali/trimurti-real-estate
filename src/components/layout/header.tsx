"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  Phone,
  MessageCircle,
  User,
  LogOut,
  Heart,
  Shield,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { useScrollState } from "@/hooks/use-scroll-state";

// Dynamic import LiquidGlass to avoid SSR issues (WebGL)
const LiquidGlass = dynamic(() => import("liquid-glass-react"), {
  ssr: false,
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PHONE_NUMBER = "+91 98194 46163";
const WHATSAPP_NUMBER = "919819446163";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isCompact } = useScrollState(50);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [glassError, setGlassError] = useState(false);
  const { user, isAuthenticated, isLoading, isAdmin, profile, signOut } =
    useAuthContext();

  // Detect desktop for LiquidGlass (WebGL is desktop-focused)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
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
    const message = encodeURIComponent(
      "Hello! I'm interested in learning more about properties."
    );
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

  const showCompact = isCompact && isDesktop;

  const navContent = (
    <div
      className={cn(
        "flex items-center justify-between transition-all duration-300",
        showCompact ? "h-12 px-6" : "h-16 px-4 md:h-20"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <span
          className={cn(
            "whitespace-nowrap font-bold text-white transition-all duration-300",
            showCompact ? "text-sm" : "text-base sm:text-xl md:text-2xl"
          )}
        >
          Trimurti{" "}
          <span className="text-[hsl(var(--brand-gold))]">
            {showCompact ? "RE" : "Real Estate"}
          </span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-0.5 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 font-medium transition-colors",
              showCompact ? "text-xs" : "text-sm",
              pathname === link.href
                ? "text-[hsl(var(--brand-gold))]"
                : "text-white/90 hover:text-white hover:bg-white/10"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Phone - Desktop only, hidden in compact */}
        {!showCompact && (
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
        )}

        {/* WhatsApp Button - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "hidden rounded-full bg-[#25D366] text-white hover:bg-[#20BD5A] md:flex",
            showCompact ? "h-7 w-7" : "h-9 w-9"
          )}
          onClick={handleWhatsAppClick}
          aria-label="Contact via WhatsApp"
        >
          <MessageCircle className={showCompact ? "h-3.5 w-3.5" : "h-5 w-5"} />
        </Button>

        {/* User Menu - Desktop */}
        <div className="hidden md:block">
          {isLoading ? (
            <Skeleton
              className={cn(
                "bg-white/20",
                showCompact ? "h-7 w-16" : "h-9 w-24"
              )}
            />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full p-0 hover:bg-white/10",
                    showCompact ? "h-7 w-7" : "h-9 w-9"
                  )}
                >
                  <Avatar
                    className={cn(
                      "border-2 border-white/30",
                      showCompact ? "h-7 w-7" : "h-9 w-9"
                    )}
                  >
                    {(profile?.avatar_url ||
                      user?.user_metadata?.avatar_url) && (
                      <AvatarImage
                        src={
                          profile?.avatar_url || user?.user_metadata?.avatar_url
                        }
                        alt={profile?.full_name || "User avatar"}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-white/20 text-sm font-medium text-white">
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
              size={showCompact ? "sm" : "sm"}
              className={cn(
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
                showCompact && "h-7 px-3 text-xs"
              )}
              asChild
            >
              <Link href="/login">
                <User
                  className={cn(
                    "mr-1.5",
                    showCompact ? "h-3 w-3" : "h-4 w-4"
                  )}
                />
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
  );

  return (
    <>
      <header className="fixed top-0 z-40 w-full">
        {/* Full-width background — visible in expanded state */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-primary"
          animate={{ opacity: showCompact ? 0 : 1 }}
          transition={{ duration: 0.35 }}
        />

        {/* Nav container — morphs between full-width and compact pill */}
        <motion.div
          className="relative"
          animate={
            showCompact
              ? {
                  maxWidth: "52rem",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "0.75rem",
                  borderRadius: "9999px",
                }
              : {
                  maxWidth: "100%",
                  marginLeft: "0px",
                  marginRight: "0px",
                  marginTop: "0px",
                  borderRadius: "0px",
                }
          }
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {showCompact ? (
            // Compact: Liquid glass pill — sized container for LiquidGlass centering
            !glassError ? (
              <div className="relative flex items-center justify-center" style={{ height: "3.5rem" }}>
                <LiquidGlass
                  displacementScale={40}
                  blurAmount={0.6}
                  saturation={140}
                  elasticity={0.15}
                  cornerRadius={999}
                  className="w-full"
                  padding="0"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    background: "rgba(30, 58, 95, 0.45)",
                  }}
                >
                  {navContent}
                </LiquidGlass>
              </div>
            ) : (
              // Fallback for non-WebGL browsers
              <div className="glass-fallback rounded-full shadow-lg">
                {navContent}
              </div>
            )
          ) : (
            // Expanded: Full-width with container
            <div className="container mx-auto">{navContent}</div>
          )}
        </motion.div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />
    </>
  );
}
