"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

const navItems = [
  {
    href: "/favorites",
    label: "Saved Properties",
    icon: Heart,
  },
  {
    href: "/profile",
    label: "My Profile",
    icon: User,
  },
];

interface UserSidebarProps {
  profile: Profile | null;
  email?: string;
  isAdmin?: boolean;
  onSignOut?: () => void;
}

export function UserSidebar({ profile, email, isAdmin = false, onSignOut }: UserSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
      <div className="flex h-full flex-col">
        {/* User Info */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
              {profile?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {profile?.full_name || "User"}
              </p>
              {email && (
                <p className="truncate text-sm text-muted-foreground">{email}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {isAdmin && (
              <>
                <li>
                  <Separator className="my-2" />
                </li>
                <li>
                  <Link
                    href="/admin"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname.startsWith("/admin")
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Shield className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <Separator />

        {/* Sign Out */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={onSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
