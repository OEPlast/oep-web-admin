/**
 * Reviews Analytics Client Component
 *
 * Displays comprehensive review analytics including:
 * - Overview metrics (total reviews, average rating, positive/negative)
 * - Rating distribution breakdown (1-5 stars)
 * - Review sentiment trend over time
 * - Detailed reviews table with filters
 */

'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import { PiChatCircleTextDuotone, PiStarDuotone } from 'react-icons/pi';
import { Text } from 'rizzui';
import {
  useReviewsTable,
  useSeries,
  useSummary,
  useBreakdown,
} from '@/hooks/queries/analytics';
import AnalyticsBreakdownChart from '@/app/shared/analytics/analytics-breakdown-chart';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import AnalyticsSeriesChart from '@/app/shared/analytics/analytics-series-chart';
import AnalyticsSummaryCards from '@/app/shared/analytics/analytics-summary-cards';
import ReviewsDataTable from './components/reviews-data-table';

const pageHeader = {
  title: 'Reviews Analytics',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      href: '/analytics',
      name: 'Analytics',
    },
    {
      name: 'Reviews',
    },
  ],
};

export default function ReviewsAnalyticsClient() {
  const range = useAnalyticsRange();
  const [groupBy, setGroupBy] = useState<'days' | 'months' | 'years'>('days');

  // Table pagination and filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const summary = useSummary({
    metrics: ['reviews_written', 'avg_rating'],
    ...range.range,
    compare: 'previous',
  });

  const trend = useSeries({
    metrics: ['reviews_written'],
    ...range.range,
    granularity: 'auto',
    compare: 'previous',
  });

  // Rating distribution, sentiment and the table are not metric-shaped; they
  // keep their existing endpoints and follow the window the engine resolved.
  const dateParams = {
    from: summary.data?.from ?? new Date(Date.now() - 30 * 864e5).toISOString(),
    to: summary.data?.to ?? new Date().toISOString(),
  };

  const ratingBreakdown = useBreakdown({
    metric: 'reviews_written',
    dimension: 'rating',
    ...range.range,
  });

  const sentimentSeries = useSeries({
    metrics: ['reviews_written'],
    dimension: 'sentiment',
    ...range.range,
    granularity: 'auto',
  });

  const { data: reviews, isLoading: loadingReviews } = useReviewsTable({
    ...dateParams,
    page,
    limit,
    rating: ratingFilter === 'all' ? undefined : Number(ratingFilter),
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <AnalyticsRangePicker range={range} />

      <AnalyticsSummaryCards
        className="mb-6"
        query={summary}
        cards={[
          {
            metric: 'reviews_written',
            label: 'Reviews Written',
            icon: PiChatCircleTextDuotone,
            hint: 'Approved reviews only, matching what the storefront actually shows.',
          },
          {
            metric: 'avg_rating',
            label: 'Average Rating',
            icon: PiStarDuotone,
            format: 'decimal',
            hint: 'Computed across the whole period, not as the mean of daily averages.',
          },
        ]}
      />

      <div className="mb-6">
        <AnalyticsSeriesChart
          title="Reviews Over Time"
          query={trend}
          metrics={[
            { key: 'reviews_written', label: 'Reviews', color: '#f59e0b' },
          ]}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 @container lg:grid-cols-2">
        <AnalyticsBreakdownChart
          title="Rating Distribution"
          query={ratingBreakdown}
          kind="bar"
        />
        {/* Stacked: sentiment bands sum to the review count, so the stack height
            is meaningful rather than an artefact of overlaying series. */}
        <AnalyticsSeriesChart
          title="Review Sentiment"
          query={sentimentSeries}
          kind="bar"
          stacked
        />
      </div>

      {/* Reviews Table */}
    </>
  );
}

/*
<ReviewsDataTable
  data={reviews}
  onPageChange={setPage}
  onLimitChange={(newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }}
  onRatingFilter={(rating: string) => {
    setRatingFilter(rating);
    setPage(1);
  }}
  onStatusFilter={(status: string) => {
    setStatusFilter(status);
    setPage(1);
  }}
  selectedRating={ratingFilter}
  selectedStatus={statusFilter}
  isLoading={loadingReviews}
/>
*/
