import Link from "next/link";
import {
  Home,
  TrendingUp,
  MessageSquare,
  CalendarClock,
  ArrowRight,
  Phone,
  Clock,
  Building2,
  Instagram,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

async function fetchStats() {
  const supabase = await createClient();

  const { count: totalProperties } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });

  const { count: activeCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const { count: inquiriesThisMonth } = await supabase
    .from("inquiries")
    .select("id", { count: "exact" })
    .gte("created_at", start.toISOString());

  let pendingVisits = 0;
  try {
    const { count } = await supabase
      .from("property_visits")
      .select("id", { count: "exact" })
      .eq("status", "pending");
    pendingVisits = count ?? 0;
  } catch {
    const { count } = await supabase
      .from("property_visits")
      .select("id", { count: "exact" });
    pendingVisits = count ?? 0;
  }

  let instagramReplied = 0;
  try {
    const { count } = await supabase
      .from("instagram_agent_comments")
      .select("id", { count: "exact" })
      .eq("status", "sent");
    instagramReplied = count ?? 0;
  } catch {
    instagramReplied = 0;
  }

  const { data: recentInquiries } = await supabase
    .from("inquiries")
    .select("id, name, phone, email, message, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentProperties } = await supabase
    .from("properties")
    .select("id, title, listing_type, property_type, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: recentInstagramComments } = await supabase
    .from("instagram_agent_comments")
    .select("id, username, comment_text, category, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalProperties: totalProperties ?? 0,
    activeListings: activeCount ?? 0,
    inquiriesThisMonth: inquiriesThisMonth ?? 0,
    pendingVisits,
    instagramReplied,
    recentInquiries: recentInquiries ?? [],
    recentProperties: recentProperties ?? [],
    recentInstagramComments: recentInstagramComments ?? [],
  };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const statCards = [
  {
    label: "Total Properties",
    key: "totalProperties" as const,
    icon: Home,
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
    href: "/admin/properties",
  },
  {
    label: "Active Listings",
    key: "activeListings" as const,
    icon: TrendingUp,
    color: "text-status-success",
    bg: "bg-status-success/10",
    href: "/admin/properties",
  },
  {
    label: "Inquiries This Month",
    key: "inquiriesThisMonth" as const,
    icon: MessageSquare,
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    href: "/admin/inquiries",
  },
  {
    label: "Pending Visits",
    key: "pendingVisits" as const,
    icon: CalendarClock,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    href: "/admin/visits",
  },
  {
    label: "IG Replies Sent",
    key: "instagramReplied" as const,
    icon: Instagram,
    color: "text-brand-coral",
    bg: "bg-brand-coral/10",
    href: "/admin/instagram",
  },
];

const typeLabels: Record<string, string> = {
  "1rk": "1 RK",
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  shop: "Shop",
  office: "Office",
};

const statusColors: Record<string, string> = {
  new: "bg-status-info/10 text-status-info",
  contacted: "bg-status-warning/10 text-status-warning",
  closed: "bg-muted text-muted-foreground",
};

export default async function AdminPage() {
  const stats = await fetchStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your properties and activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="group relative overflow-hidden rounded-xl border bg-background p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {stats[card.key]}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  card.bg
                )}
              >
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Inquiries */}
        <div className="rounded-xl border bg-background">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recent Inquiries</h2>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentInquiries.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No inquiries yet
              </p>
            ) : (
              stats.recentInquiries.map((inq: any) => (
                <div
                  key={inq.id}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                >
                  {/* Avatar circle */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                    {inq.name
                      ?.split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {inq.name}
                      </span>
                      {inq.status && (
                        <span
                          className={cn(
                            "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
                            statusColors[inq.status] || statusColors.new
                          )}
                        >
                          {inq.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {inq.message?.slice(0, 80) || "No message"}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      {inq.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {inq.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(inq.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="rounded-xl border bg-background">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recent Properties</h2>
            </div>
            <Link
              href="/admin/properties"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentProperties.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No properties yet
              </p>
            ) : (
              stats.recentProperties.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                >
                  {/* Type indicator */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                      p.listing_type === "rent"
                        ? "bg-status-info/10 text-status-info"
                        : "bg-status-success/10 text-status-success"
                    )}
                  >
                    {p.listing_type === "rent" ? "R" : "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.title || "Untitled Property"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>
                        {typeLabels[p.property_type] || p.property_type}
                      </span>
                      <span>·</span>
                      <span
                        className={cn(
                          "font-medium",
                          p.is_active ? "text-status-success" : "text-muted-foreground"
                        )}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                      <span>·</span>
                      <span>{timeAgo(p.created_at)}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Instagram Comments */}
        <div className="rounded-xl border bg-background">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-[#E4405F]" />
              <h2 className="text-sm font-semibold">Recent Instagram Comments</h2>
            </div>
            <Link
              href="/admin/instagram"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentInstagramComments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No comments yet
              </p>
            ) : (
              stats.recentInstagramComments.map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-coral/10 text-xs font-bold text-brand-coral">
                    {c.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {c.username || 'Unknown'}
                      </span>
                      {c.status && (
                        <span
                          className={cn(
                            "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
                            c.status === 'sent' && 'bg-status-success/10 text-status-success',
                            c.status === 'failed' && 'bg-status-error/10 text-status-error',
                            c.status === 'pending' && 'bg-status-warning/10 text-status-warning',
                            c.status === 'ignored' && 'bg-muted text-muted-foreground',
                            'bg-status-info/10 text-status-info'
                          )}
                        >
                          {c.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {c.comment_text?.slice(0, 80) || 'No comment'}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      {c.category && (
                        <span className="flex items-center gap-1">
                          <span className="text-[10px] uppercase">{c.category}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(c.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
