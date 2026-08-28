interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-border/60 ${className}`} aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="p-8" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-48" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="mt-8 h-64" />
    </div>
  );
}
