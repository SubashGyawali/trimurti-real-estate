"use client";

import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
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
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ className, onNavigate, collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-200 ease-in-out bg-card border-r border-border",
        collapsed ? "w-16" : "w-64",
        className
      )}
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="leading-none min-w-0 flex-1 overflow-hidden">
            <span className="text-sm font-bold tracking-tight text-foreground truncate block">Trimurti</span>
            <span className="ml-1 text-sm font-bold tracking-tight text-primary truncate block">RE</span>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Admin Panel
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
            collapsed && "rotate-180"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors flex-shrink-0",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {active && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            collapsed
              ? "justify-center"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          title={collapsed ? "Back to site" : undefined}
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
