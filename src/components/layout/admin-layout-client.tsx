"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AdminSidebar from "./admin-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-background">
        {/* Mobile Header - visible on < lg */}
        <div className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-semibold">Admin Panel</span>
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Admin Panel</SheetTitle>
            </SheetHeader>
            <AdminSidebar
              className="border-r-0 w-full"
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="container mx-auto px-4 py-6">
          <div className="lg:flex lg:gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <AdminSidebar />
            </div>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminLayoutClient;
