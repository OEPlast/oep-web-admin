'use client';

export default function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters Skeleton */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 border-b border-gray-200 bg-gray-50 p-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-gray-300"></div>
          ))}
        </div>

        {/* Rows */}
        {[...Array(10)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-7 gap-4 border-b border-gray-100 p-4 last:border-b-0"
          >
            {/* Image */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded bg-gray-200"></div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Other columns */}
            {[...Array(6)].map((_, colIndex) => (
              <div key={colIndex} className="flex items-center">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 animate-pulse rounded bg-gray-200"></div>
          ))}
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
