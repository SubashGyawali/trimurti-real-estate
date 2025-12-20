import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

async function fetchStats() {
  const supabase = await createClient();

  // Total properties
  const { count: totalProperties } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });

  // Active listings (try common column names)
  let activeListings = 0;
  try {
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact" })
      .eq("status", "active");
    activeListings = count ?? 0;
  } catch {
    // fallback to total if no status column
    activeListings = totalProperties ?? 0;
  }

  // This month's inquiries
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();

  const { count: inquiriesThisMonth } = await supabase
    .from("inquiries")
    .select("id", { count: "exact" })
    .gte("created_at", startIso);

  // Pending visits
  let pendingVisits = 0;
  try {
    const { count } = await supabase
      .from("property_visits")
      .select("id", { count: "exact" })
      .eq("status", "pending");
    pendingVisits = count ?? 0;
  } catch {
    // fallback: count all visits
    const { count } = await supabase.from("property_visits").select("id", { count: "exact" });
    pendingVisits = count ?? 0;
  }

  // Recent inquiries
  const { data: recentInquiries } = await supabase
    .from("inquiries")
    .select("id, name, phone, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent properties
  const { data: recentProperties } = await supabase
    .from("properties")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return {
    totalProperties: totalProperties ?? 0,
    activeListings,
    inquiriesThisMonth: inquiriesThisMonth ?? 0,
    pendingVisits,
    recentInquiries: recentInquiries ?? [],
    recentProperties: recentProperties ?? [],
  };
}

export default async function AdminPage() {
  const stats = await fetchStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Properties</CardTitle>
            <CardDescription>{stats.totalProperties}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>{stats.activeListings}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month's Inquiries</CardTitle>
            <CardDescription>{stats.inquiriesThisMonth}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Visits</CardTitle>
            <CardDescription>{stats.pendingVisits}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stats.recentInquiries.map((inq: any) => (
                <li key={inq.id} className="flex flex-col">
                  <div className="text-sm font-medium">{inq.name} — {inq.phone}</div>
                  <div className="text-xs text-muted-foreground">{inq.message?.slice?.(0, 120) || "—"}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stats.recentProperties.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{p.title || `Property ${p.id}`}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
