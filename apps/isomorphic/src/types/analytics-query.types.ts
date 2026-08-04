/**
 * Query-engine response types.
 *
 * Deliberately a separate file from `analytics.types.ts` (696 lines of
 * hand-written types for the legacy endpoints): that one stays valid for pages
 * not yet migrated and shrinks as each moves across, rather than being edited in
 * place while both contracts are live.
 *
 * The shape difference that matters: engine responses are **objects, never bare
 * arrays, and never null on a 200**. A window with no activity returns a
 * zero-filled series, so the `if (!response.data) throw` guard the legacy hooks
 * all carry — which turned an empty range into a query error with no error UI to
 * catch it — has nothing left to fire on.
 */

export type Granularity =
  | 'minute'
  | 'five_minutes'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export type GranularityRequest = Granularity | 'auto';

export type AnalyticsPreset =
  | 'today'
  | 'last_10_minutes'
  | 'last_24_hours'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_12_months'
  | 'last_2_years'
  | 'last_5_years'
  | 'year_to_date';

export type ComparisonMode = 'none' | 'previous' | 'year_over_year';

/** Either a preset or an explicit from/to pair — never both. */
export interface AnalyticsRange {
  preset?: AnalyticsPreset;
  from?: string;
  to?: string;
}

export interface AnalyticsComparison {
  from: string;
  to: string;
  totals: Record<string, number | null>;
  /** `null` where the baseline was zero — growth from nothing is not 0% change. */
  changePct: Record<string, number | null>;
}

export interface SeriesRow {
  /** ISO 8601 with a real offset (`+01:00`), so the intended zone travels with it. */
  bucket: string;
  /** Formatted server-side; safe to render directly as an axis tick. */
  bucketLabel: string;
  bucketStart: string;
  /** One key per requested metric. */
  [metricKey: string]: string | number | null;
}

export interface SeriesResponse {
  granularity: Granularity;
  granularityRequested: GranularityRequest;
  timezone: string;
  from: string;
  to: string;
  bucketCount: number;
  metrics: string[];
  /** Set when the series was split by a dimension. */
  dimension?: string;
  /**
   * Columns of a dimensioned series, in display order.
   *
   * Render from this rather than from a hardcoded category list — the server
   * returns the categories that actually occur, so a newly added order status
   * appears without a frontend change.
   */
  seriesKeys?: Array<{ key: string; label: string }>;
  series: SeriesRow[];
  totals: Record<string, number | null>;
  comparison: AnalyticsComparison | null;
  /**
   * Documents inside the window carrying no event stamp, by metric.
   * A non-empty entry means the corresponding figure understates reality and the
   * UI should say so rather than presenting the number bare.
   */
  unstamped: Record<string, number>;
  computedAt: string;
}

export interface SummaryResponse {
  timezone: string;
  from: string;
  to: string;
  metrics: string[];
  totals: Record<string, number | null>;
  comparison: AnalyticsComparison | null;
  unstamped: Record<string, number>;
  computedAt: string;
}

export interface BreakdownRow {
  key: string;
  label: string;
  value: number;
  /** Share of the returned rows, not of all time — a truncated top-N is not the whole picture. */
  share: number | null;
}

export interface BreakdownResponse {
  metric: string;
  dimension: string;
  timezone: string;
  from: string;
  to: string;
  total: number | null;
  rows: BreakdownRow[];
  computedAt: string;
}

export interface MetricMeta {
  key: string;
  label: string;
  group: 'financial' | 'operational' | 'customer';
  source: string;
  aggregation: 'sum' | 'count' | 'avg';
  /** Which timestamp the metric is measured on — the whole point of the registry. */
  timestampField: string;
  note: string | null;
}

export interface DimensionMeta {
  key: string;
  label: string;
  sources: string[];
}

export interface AnalyticsMetaResponse {
  metrics: MetricMeta[];
  dimensions: DimensionMeta[];
  defaultTimezone: string;
  timezone: string;
  maxMetricsPerRequest: number;
}

export interface SeriesParams extends AnalyticsRange {
  metrics: string[];
  granularity?: GranularityRequest;
  compare?: ComparisonMode;
  tz?: string;
  /**
   * Splits the series into one column per category. Accepts exactly one metric —
   * the response is already wide over categories, and crossing that with several
   * metrics produces a column set nobody can read.
   */
  dimension?: string;
}

export interface SummaryParams extends AnalyticsRange {
  metrics: string[];
  compare?: ComparisonMode;
  tz?: string;
}

export interface BreakdownParams extends AnalyticsRange {
  metric: string;
  dimension: string;
  limit?: number;
  tz?: string;
}
