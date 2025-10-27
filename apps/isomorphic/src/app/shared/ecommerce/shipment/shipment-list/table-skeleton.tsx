'use client';

export default function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-9 w-64 animate-pulse rounded bg-gray-100" />
      <div className="overflow-hidden rounded-md border border-gray-200">
        <div className="h-10 w-full animate-pulse bg-gray-50" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse border-t bg-white" />
        ))}
      </div>
    </div>
  );
}
