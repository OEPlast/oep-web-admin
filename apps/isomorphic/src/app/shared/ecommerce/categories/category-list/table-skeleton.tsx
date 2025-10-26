import cn from '@core/utils/class-names';

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
}

export default function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonBox className="h-9 w-64" />
        <SkeletonBox className="h-9 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="border border-muted rounded-md overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-muted bg-gray-50 p-4">
          <SkeletonBox className="h-5 w-5" />
          <SkeletonBox className="h-5 w-20" />
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-5 w-24" />
          <SkeletonBox className="h-5 w-20" />
          <SkeletonBox className="h-5 w-24" />
          <SkeletonBox className="h-5 w-24" />
          <SkeletonBox className="h-5 w-20" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-muted p-4 last:border-0"
          >
            <SkeletonBox className="h-5 w-5" />
            <SkeletonBox className="h-20 w-20 rounded-lg" />
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-6 w-16 rounded-full" />
            <SkeletonBox className="h-6 w-16 rounded-full" />
            <SkeletonBox className="h-5 w-24" />
            <div className="flex gap-2 ml-auto">
              <SkeletonBox className="h-8 w-8 rounded" />
              <SkeletonBox className="h-8 w-8 rounded" />
              <SkeletonBox className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between py-4">
        <SkeletonBox className="h-5 w-32" />
        <div className="flex gap-2">
          <SkeletonBox className="h-9 w-20" />
          <SkeletonBox className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
