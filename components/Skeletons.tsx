export function FeedSkeleton() {
  return (
    <div className="space-y-3">
      <div className="panel h-24 animate-pulse bg-slate-100" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="panel h-40 animate-pulse bg-slate-100" />
      ))}
    </div>
  );
}

export function ThreadSkeleton() {
  return (
    <div className="space-y-3">
      <div className="panel h-40 animate-pulse bg-slate-100" />
      <div className="panel h-24 animate-pulse bg-slate-100" />
      <div className="panel h-64 animate-pulse bg-slate-100" />
    </div>
  );
}
