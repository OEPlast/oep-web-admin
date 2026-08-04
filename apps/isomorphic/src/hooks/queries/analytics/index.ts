/**
 * Analytics Hooks Barrel Export
 *
 * Prefer the query-engine hooks below (`useSeries`, `useSummary`, `useBreakdown`)
 * for anything new. Everything under "Legacy" is served by the old per-chart
 * endpoints and is removed as each page migrates.
 *
 * @example
 * import { useSeries, useSummary } from '@/hooks/queries/analytics';
 */

// Query engine — the metric registry, in the store timezone, at any granularity.
export { useSeries, useSummary, useBreakdown, useAnalyticsMeta } from './useAnalyticsQuery';

// One product, every figure. Composed server-side, outside the registry.
export { useProductAnalytics } from './useProductAnalytics';

export type {
  ProductAnalyticsResponse,
  ProductAnalyticsProduct,
  ProductAnalyticsTotals,
  ProductAnalyticsSeriesRow,
  ProductAnalyticsDistributionRow,
} from '@/types/analytics-product.types';

export type {
  SeriesResponse,
  SummaryResponse,
  BreakdownResponse,
  BreakdownRow,
  AnalyticsMetaResponse,
  AnalyticsComparison,
  AnalyticsPreset,
  AnalyticsRange,
  ComparisonMode,
  Granularity,
  GranularityRequest,
  MetricMeta,
  SeriesRow,
} from '@/types/analytics-query.types';

// Chart hooks still in use. These return per-row detail (product images, a
// secondary orders count) that a metric breakdown deliberately does not model,
// so they are listings-with-an-aggregate rather than analytics.
export {
  useTopProductsRevenue,
  useCategoriesPerformance,
} from './useAnalyticsCharts';

// Document listings — filtered row listings that happen to take a date range,
// not metrics. These duplicate the admin resource list endpoints and should be
// repointed at those rather than moved into the analytics engine.
export {
  useOrdersTable,
  useTransactionsTable,
  useProductPerformance,
  useReviewsTable,
} from './useAnalyticsTables';

// Type exports
export type {
  // Chart types
  TopProductsRevenueData,
  CategoriesPerformanceData,
  // Table types
  OrderTableRow,
  OrdersTableResponse,
  TransactionTableRow,
  TransactionsTableResponse,
  ProductPerformanceRow,
  ProductPerformanceResponse,
  ReviewTableRow,
  ReviewsTableResponse,
  // Parameter types
  DateRangeParams,
  ChartParams,
  TableParams,
  OrdersTableParams,
  TransactionsTableParams,
  ReviewsTableParams,
  ProductPerformanceParams,
  TopItemsParams,
  PaginationMeta,
} from '@/types/analytics.types';
