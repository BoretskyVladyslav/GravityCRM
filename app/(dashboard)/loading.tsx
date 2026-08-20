export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted/60 rounded-lg" />
        <div className="h-4 w-72 bg-muted/40 rounded-md" />
      </div>

      {/* Grid skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-card border border-border/50 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted/70 rounded-md" />
              <div className="h-6 w-6 bg-muted/50 rounded-lg" />
            </div>
            <div className="h-8 w-32 bg-muted/80 rounded-lg mt-2" />
            <div className="h-3 w-full bg-muted/40 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main content table/panel skeleton */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-muted/70 rounded-md" />
          <div className="h-8 w-24 bg-muted/50 rounded-lg" />
        </div>
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-muted/30 rounded-xl border border-border/30"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
