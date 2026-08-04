'use client';

import { useMemo } from 'react';
import AnalyticsSeriesChart from '@/app/shared/analytics/analytics-series-chart';
import AnalyticsBreakdownChart from '@/app/shared/analytics/analytics-breakdown-chart';
import {
  formatCountCompact,
  type ChartValueFormat,
} from '@/app/shared/analytics/analytics-format';
import type { ProductAnalyticsResponse } from '@/types/analytics-product.types';
import type {
  BreakdownResponse,
  Granularity,
  SeriesResponse,
} from '@/types/analytics-query.types';

/**
 * The composed charts, rendered through the shared analytics components.
 *
 * The product endpoint returns its own shape, but the *rows* are deliberately
 * engine-shaped — `{bucket, bucketLabel, ...}` for the series and
 * `{key, label, value, share}` for the distributions. Adapting the envelope here
 * is a few lines and buys the shared axis formatting, tooltips, empty states and
 * semantic colours rather than a fourth hand-rolled Recharts block.
 */
export default function ProductPerformanceCharts({
  data,
  isLoading,
  isError,
  error,
  money,
}: {
  data?: ProductAnalyticsResponse;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  money: ChartValueFormat;
}) {
  const revenueSeries = useMemo(
    () => toSeriesResponse(data, ['revenue']),
    [data]
  );
  const unitsSeries = useMemo(() => toSeriesResponse(data, ['unitsSold']), [data]);

  const ratings = useMemo(
    () => toBreakdownResponse(data, 'avg_rating', 'rating', data?.ratings),
    [data]
  );
  const statuses = useMemo(
    () => toBreakdownResponse(data, 'orders_placed', 'order_status', data?.orderStatuses),
    [data]
  );

  const state = { isLoading, isError, error };

  return (
    <>
      <AnalyticsSeriesChart
        title="Revenue"
        description="Paid orders only, valued at this product’s line"
        query={{ ...state, data: revenueSeries }}
        metrics={[{ key: 'revenue', label: 'Revenue', color: '#10B981' }]}
        kind="area"
        height={320}
        className="mb-6"
        {...money}
      />

      <div className="mb-6 grid grid-cols-1 gap-6 @container lg:grid-cols-2">
        <AnalyticsSeriesChart
          title="Units Sold"
          query={{ ...state, data: unitsSeries }}
          metrics={[{ key: 'unitsSold', label: 'Units', color: '#3872FA' }]}
          kind="bar"
          axisFormatter={formatCountCompact}
        />
        <AnalyticsBreakdownChart
          title="Order Status"
          description="Every order containing this product, by status"
          query={{ ...state, data: statuses }}
          kind="pie"
        />
      </div>

      <AnalyticsBreakdownChart
        title="Rating Distribution"
        description="Approved reviews written in this period"
        query={{ ...state, data: ratings }}
        kind="bar"
        className="mb-6"
      />
    </>
  );
}

/**
 * Envelope adapter for the series charts.
 *
 * `totals` is filled from the series rather than left empty: with no
 * `seriesKeys`, the shared chart decides "no activity" from the totals, so an
 * empty object there would blank a chart that has data.
 */
function toSeriesResponse(
  data: ProductAnalyticsResponse | undefined,
  keys: string[]
): SeriesResponse | undefined {
  if (!data) return undefined;

  const series = data.series.map((row) => ({
    bucket: row.bucket,
    bucketLabel: row.bucketLabel,
    bucketStart: row.bucketStart,
    revenue: row.revenue,
    unitsSold: row.unitsSold,
  }));

  return {
    granularity: data.granularity as Granularity,
    granularityRequested: 'auto',
    timezone: data.timezone,
    from: data.from,
    to: data.to,
    bucketCount: series.length,
    metrics: keys,
    series,
    totals: Object.fromEntries(
      keys.map((key) => [
        key,
        series.reduce((sum, row) => sum + Number((row as Record<string, unknown>)[key] ?? 0), 0),
      ])
    ),
    comparison: null,
    // The product endpoint reports no unstamped counts, so this is empty rather
    // than absent — an empty record renders no notice, which is the truth here.
    unstamped: {},
    computedAt: data.computedAt,
  };
}

function toBreakdownResponse(
  data: ProductAnalyticsResponse | undefined,
  metric: string,
  dimension: string,
  rows?: BreakdownResponse['rows']
): BreakdownResponse | undefined {
  if (!data || !rows) return undefined;

  return {
    metric,
    dimension,
    timezone: data.timezone,
    from: data.from,
    to: data.to,
    total: rows.reduce((sum, row) => sum + row.value, 0),
    // All-zero rows are dropped here, not server-side: the rating endpoint
    // always returns five bands so the *shape* is stable, but a pie of five
    // zeroes is not a chart.
    rows: rows.filter((row) => row.value > 0),
    computedAt: data.computedAt,
  };
}
