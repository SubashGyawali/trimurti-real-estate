"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Building2,
  List,
  MessageSquare,
  CalendarClock,
  Sparkles,
  Instagram,
} from "lucide-react";
import AdminSidebar from "./admin-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: List },
  { href: "/admin/buildings", label: "Buildings", icon: Building2 },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/visits", label: "Visits", icon: CalendarClock },
  { href: "/admin/instagram", label: "Instagram AI", icon: Instagram },
];

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Auth is enforced server-side in src/app/admin/layout.tsx (getUser + is_admin check + redirect).
  // Keeping this component client-only for sidebar/topbar interactivity avoids the
  // previous full-screen ProtectedRoute "Loading..." flash on every hard refresh.
  return (
    <div className="admin flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            <AdminSidebar
              className="h-full"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <Sparkles className="h-4 w-4 text-[#d4a853]" />
            <span className="text-sm font-bold">
              Trimurti <span className="text-[#d4a853]">RE</span>
            </span>
          </div>

          {/* Breadcrumb / page title */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            {navItems.map((item) =>
              isActive(item.href) ? (
                <div key={item.href} className="flex items-center gap-1.5">
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                </div>
              ) : null
            )}
          </div>

          {/* Right side spacer */}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayoutClient;
