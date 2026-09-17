export default function AdminLoading() {
  return (
    <div className="admin flex min-h-screen bg-muted/30">
      <div className="hidden lg:flex lg:h-screen lg:w-[240px] shrink-0 border-r bg-brand-blue" />
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex h-14 shrink-0 items-center border-b bg-background px-4 lg:px-6">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
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
      </div>
    </div>
  );
}
