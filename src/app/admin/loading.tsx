export default function AdminLoading() {
  return (
    <div className="admin flex min-h-screen bg-background">
      {/* Sidebar skeleton - matches AdminSidebar (collapsible w-16/w-64, bg-card border-r) */}
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 shrink-0 border-r bg-card border-border">
        <div className="flex flex-col h-full">
          {/* Brand skeleton */}
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 animate-pulse" />
            <div className="leading-none min-w-0 flex-1 overflow-hidden">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-0.5 h-3 w-16 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="ml-auto h-7 w-7 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Navigation skeleton */}
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
            <ul className="space-y-1">
              {[...Array(7)].map((_, i) => (
                <li key={i}>
                  <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5">
                    <div className="h-[18px] w-[18px] shrink-0 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-20 animate-pulse rounded bg-muted/70 truncate" />
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer skeleton */}
          <div className="border-t border-border px-3 py-4">
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
              <div className="h-4 w-4 animate-pulse rounded bg-muted flex-shrink-0" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar skeleton */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted lg:hidden" />
          <div className="hidden lg:flex h-9 w-9 items-center justify-center animate-pulse rounded-lg bg-muted" />
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-4 w-4 animate-pulse rounded bg-primary/10" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </header>

        {/* Page content skeleton */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
            <div className="space-y-3">
              <div className="h-7 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-72 animate-pulse rounded bg-muted/70" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="h-28 animate-pulse rounded-xl border bg-card" />
                <div className="h-28 animate-pulse rounded-xl border bg-card" />
                <div className="h-28 animate-pulse rounded-xl border bg-card" />
                <div className="h-28 animate-pulse rounded-xl border bg-card" />
              </div>
              <div className="mt-6 h-[320px] animate-pulse rounded-xl border bg-card" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
