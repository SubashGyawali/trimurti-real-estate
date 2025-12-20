"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Building, List, MessageSquare, Calendar, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function AdminSidebar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <aside className={cn("bg-surface border-r w-64 p-4 flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Admin</h3>
        <Button variant="ghost" size="icon" onClick={() => setOpen((s) => !s)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-auto">
        <ul className="space-y-1">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          Back to site
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
