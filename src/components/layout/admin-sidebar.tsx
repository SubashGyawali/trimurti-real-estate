"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  List,
  MessageSquare,
  CalendarClock,
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  Instagram,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: List },
  { href: "/admin/buildings", label: "Buildings", icon: Building2 },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/visits", label: "Visits", icon: CalendarClock },
  { href: "/admin/instagram", label: "Instagram AI", icon: Instagram },
  { href: "/admin/home-settings", label: "Home Settings", icon: SlidersHorizontal },
];

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "flex w-[240px] flex-col bg-brand-blue text-white",
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/20">
          <Sparkles className="h-4 w-4 text-brand-gold" />
        </div>
        <div className="leading-none">
          <span className="text-sm font-bold tracking-tight">Trimurti</span>
          <span className="ml-1 text-sm font-bold tracking-tight text-brand-gold">
            RE
          </span>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/40">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                    active
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/8 hover:text-white/90"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      active
                        ? "text-brand-gold"
                        : "text-white/40 group-hover:text-white/70"
                    )}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-gold" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/50 transition-colors hover:bg-white/8 hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
