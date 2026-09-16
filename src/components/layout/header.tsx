"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { isCompact: isScrolled } = useScrollState(800);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user, isAuthenticated, isLoading, isAdmin, profile, signOut } =
    useAuthContext();

  const isLandingPage = pathname === "/";
  // Full-wide header only on landing page before scroll; pill shape everywhere else
  const isPillShape = !isLandingPage || isScrolled;

  // Grid glass header always has a dark blue base, so always use light text on desktop
  const useLightDesktopText = true;

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

  const desktopTextClass = useLightDesktopText ? "lg:text-white" : "lg:text-foreground";
  const desktopMutedTextClass = useLightDesktopText
    ? "text-white/80 hover:text-white"
    : "text-foreground/70 hover:text-foreground";
  const desktopActiveTextClass = useLightDesktopText
    ? "text-[hsl(var(--brand-gold))]"
    : "text-primary";
  const desktopOutlineButtonClass = useLightDesktopText
    ? "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
    : "border-border/60 bg-background/70 text-foreground hover:bg-background hover:text-foreground";
  const desktopGhostButtonClass = useLightDesktopText
    ? "text-white hover:bg-white/10 hover:text-white"
    : "text-foreground hover:bg-foreground/5 hover:text-foreground";
  const avatarBorderClass = useLightDesktopText
    ? "border-white/30"
    : "border-border/60";

  return (
    <>
      <header>
        <nav className={cn("fixed top-0 z-50 w-full", isPillShape ? "px-2" : "px-0 lg:px-0")}>
          <div
            className={cn(
              "mx-auto mt-2 rounded-2xl border border-border/40 bg-background/80 px-4 shadow-lg shadow-black/5 backdrop-blur-lg transition-all duration-500 ease-in-out sm:px-6 header-grid-glass",
              !isPillShape
                ? "lg:mt-0 lg:w-full lg:max-w-[100%] lg:rounded-none lg:border-white/15 lg:px-12"
                : "lg:mt-3 lg:max-w-4xl lg:rounded-[2rem] lg:border-white/30 lg:px-5 header-grid-glass-scrolled"
            )}
          >
            <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full items-center justify-between lg:w-auto">
                <Link href="/" aria-label="home" className="flex items-center">
                  <span
                    className={cn(
                      "whitespace-nowrap text-lg font-bold tracking-tight text-foreground transition-colors sm:text-xl",
                      desktopTextClass
                    )}
                  >
                    Trimurti{" "}
                    <span className="text-[hsl(var(--brand-gold))]">
                      Real Estate
                    </span>
                  </span>
                </Link>

                <button
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label="Open menu"
                  className="relative z-20 -mr-2 rounded-full p-2 text-foreground transition-colors hover:bg-foreground/5 lg:hidden"
                >
                  <Menu className="size-6" />
                </button>
              </div>

              <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                <ul className="flex items-center gap-8 text-sm">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "block font-medium transition-colors duration-150",
                          pathname === link.href
                            ? desktopActiveTextClass
                            : desktopMutedTextClass
                        )}
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden w-full items-center justify-end gap-2 lg:flex lg:w-auto">
                {!isPillShape && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-2", desktopOutlineButtonClass)}
                    asChild
                  >
                    <a href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}>
                      <Phone className="h-4 w-4" />
                      {PHONE_NUMBER}
                    </a>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-[#25D366] text-white hover:bg-[#20BD5A] hover:text-white"
                  onClick={handleWhatsAppClick}
                  aria-label="Contact via WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>

                {isLoading ? (
                  <Skeleton className="h-9 w-24 bg-foreground/10" />
                ) : isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-full p-0",
                          desktopGhostButtonClass
                        )}
                      >
                        <Avatar className={cn("h-9 w-9 border-2", avatarBorderClass)}>
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
                    size="sm"
                    className={desktopOutlineButtonClass}
                    asChild
                  >
                    <Link href="/login">
                      <User className="mr-1.5 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

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
