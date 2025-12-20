"use client";

import React from "react";
import AdminSidebar from "./admin-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="lg:flex lg:gap-6">
            <div className="hidden lg:block">
              <AdminSidebar />
            </div>
            <main className="flex-1 mt-6 lg:mt-0">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminLayoutClient;
