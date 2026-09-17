export default function AdminLoading() {
  return (
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
  );
}
