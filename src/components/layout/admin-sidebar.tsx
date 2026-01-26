"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building, List, MessageSquare, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
  { href: "/admin/properties", label: "Properties", icon: <List className="h-4 w-4" /> },
  { href: "/admin/buildings", label: "Buildings", icon: <Building className="h-4 w-4" /> },
  { href: "/admin/inquiries", label: "Inquiries", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/admin/visits", label: "Visits", icon: <Calendar className="h-4 w-4" /> },
];

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("bg-background border-r w-64 p-4 flex flex-col h-full", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Admin</h3>
      </div>

      <nav className="flex-1 overflow-auto">
        <ul className="space-y-1">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 pt-4 border-t">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-sm text-muted-foreground hover:underline"
        >
          Back to site
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
