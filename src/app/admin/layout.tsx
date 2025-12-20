import AdminLayoutClient from "@/components/layout/admin-layout-client";

// Force dynamic rendering for admin routes
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin - Trimurti Real Estate",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
