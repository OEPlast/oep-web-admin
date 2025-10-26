/**
 * Review Statistics Cards Component
 * Displays key metrics for review dashboard
 */

'use client';

import { useReviewStatistics } from '@/hooks/queries/useReviews';
import { Badge, Loader, Text, Title } from 'rizzui';
import {
  PiStarFill,
  PiClockClockwise,
  PiCheckCircle,
  PiXCircle,
} from 'react-icons/pi';
import cn from '@core/utils/class-names';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="rounded-lg border border-muted bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Text className="mb-1 text-sm font-medium text-gray-600">{title}</Text>
          <Title as="h3" className="mb-2 text-3xl font-bold text-gray-900">
            {value}
          </Title>
        </div>
        <div className={cn('rounded-lg p-3', colorClasses[color])}>{icon}</div>
      </div>
    </div>
  );
}

export default function ReviewStatisticsCards() {
  const { data: stats, isLoading, error } = useReviewStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-32 items-center justify-center rounded-lg border border-muted bg-white"
          >
            <Loader variant="spinner" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <Text className="text-red-600">Failed to load statistics</Text>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Reviews */}
      <StatCard
        title="Total Reviews"
        value={stats.total.toLocaleString()}
        icon={<PiStarFill className="h-6 w-6" />}
        color="blue"
      />

      {/* Pending Reviews */}
      <StatCard
        title="Pending Reviews"
        value={stats.pending.toLocaleString()}
        icon={<PiClockClockwise className="h-6 w-6" />}
        color="yellow"
      />

      {/* Approved Reviews */}
      <StatCard
        title="Approved Reviews"
        value={stats.approved.toLocaleString()}
        icon={<PiCheckCircle className="h-6 w-6" />}
        color="green"
      />

      {/* Rejected Reviews */}
      <StatCard
        title="Rejected Reviews"
        value={stats.rejected.toLocaleString()}
        icon={<PiXCircle className="h-6 w-6" />}
        color="red"
      />

      {/* Average Rating */}
      <div className="rounded-lg border border-muted bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:col-span-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Text className="mb-1 text-sm font-medium text-gray-600">Average Rating</Text>
            <div className="mb-2 flex items-center gap-2">
              <Title as="h3" className="text-3xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </Title>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PiStarFill
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < Math.round(stats.averageRating)
                        ? 'fill-orange text-orange'
                        : 'fill-gray-300 text-gray-300'
                    )}
                  />
                ))}
              </div>
            </div>
            <Text className="text-sm text-gray-500">
              Based on {stats.total.toLocaleString()} reviews
            </Text>
          </div>
          <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
            <PiStarFill className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="rounded-lg border border-muted bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:col-span-2">
        <Text className="mb-4 text-sm font-medium text-gray-700">Rating Distribution</Text>
        <div className="space-y-3">
          {stats.ratingDistribution &&
            Object.entries(stats.ratingDistribution)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([rating, count]) => {
                const percentage =
                  stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex w-16 items-center gap-1">
                      <Text className="text-sm font-medium text-gray-700">{rating}</Text>
                      <PiStarFill className="h-3 w-3 fill-orange text-orange" />
                    </div>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-orange transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <Text className="w-16 text-right text-sm text-gray-600">
                      {count} ({percentage}%)
                    </Text>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
