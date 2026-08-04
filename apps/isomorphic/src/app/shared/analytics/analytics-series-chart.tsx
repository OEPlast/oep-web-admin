'use client';

import { Loader } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import type { SeriesResponse } from '@/types/analytics-query.types';
import {
  assignColors,
  SeriesPlot,
  type SeriesChartKind,
  type SeriesChartMetric,
} from './analytics-series-plots';
import { AnalyticsEmpty, AnalyticsError } from './analytics-states';

// Re-exported so importers do not need to know the plots file exists.
export type { SeriesChartKind, SeriesChartMetric };

export default function AnalyticsSeriesChart({
  title,
  description,
  query,
  metrics,
  kind = 'area',
  height = 320,
  className,
  valueFormatter,
  axisFormatter,
  action,
  stacked = false,
}: {
  title: string;
  description?: string;
  query: {
    data?: SeriesResponse;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };
  /** Omit for a dimensioned series — columns come from the response instead. */
  metrics?: SeriesChartMetric[];
  kind?: SeriesChartKind;
  height?: number;
  className?: string;
  /** Exact value, for the tooltip. */
  valueFormatter?: (value: number) => string;
  /** Axis ticks. Defaults to a compact count — an axis gutter is ~60px wide. */
  axisFormatter?: (value: number) => string;
  action?: React.ReactNode;
  stacked?: boolean;
}) {
  const { data, isLoading, isError, error } = query;

  /**
   * Columns to draw.
   *
   * A dimensioned series names its own columns at runtime — the server returns
   * the categories that actually occur, so a newly added order status appears
   * without touching this file.
   */
  const categoryColors = assignColors(
    data?.seriesKeys?.map((column) => column.label) ?? []
  );

  const columns: SeriesChartMetric[] =
    data?.seriesKeys?.map((column, index) => ({
      key: column.key,
      label: column.label,
      color: categoryColors[index],
    })) ??
    metrics ??
    [];

  /**
   * What to render, and the header that belongs with it.
   *
   * Returned together because they vary together: only a drawn chart falls back
   * to `granularity · timezone` for its description. Ordered by precedence — a
   * request in flight has no columns yet, so testing for columns first would
   * report "no columns to draw" on every chart's first paint.
   */
  const view = (): { body: React.ReactNode; description?: string } => {
    if (isLoading) {
      return {
        description,
        body: (
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader size="lg" />
          </div>
        ),
      };
    }

    if (isError) {
      return { description, body: <AnalyticsError error={error} /> };
    }

    /**
     * Nothing to draw is not the same fact as nothing happened.
     *
     * With no columns the all-zero test below is vacuously true —
     * `[].every(...)` is `true` — so a chart that never learned its columns
     * would report "no activity" over live data. That is how a dropped
     * `dimension` param stayed invisible: the request degraded to an
     * undimensioned series, `seriesKeys` came back absent, the `metrics`
     * fallback was empty by design, and the widget confidently answered a
     * question it had never been asked.
     */
    if (!data || columns.length === 0) {
      return {
        description,
        body: (
          <div style={{ height }}>
            <AnalyticsEmpty
              message={
                data?.dimension
                  ? 'This chart has no columns to draw — the series returned no categories.'
                  : 'This chart has no columns to draw — it needs a dimensioned response or a metrics list.'
              }
            />
          </div>
        ),
      };
    }

    // "No activity" is a fact about the data, not an absence of it: the engine
    // always returns buckets, so an all-zero series is a real answer and says so.
    const allZero =
      data.series.length === 0 ||
      (data.seriesKeys
        ? data.series.every((row) =>
            columns.every((column) => Number(row[column.key] ?? 0) === 0)
          )
        : columns.every(
            (column) => Number(data.totals?.[column.key] ?? 0) === 0
          ));

    if (allZero) {
      return {
        description,
        body: (
          <div style={{ height }}>
            <AnalyticsEmpty />
          </div>
        ),
      };
    }

    return {
      description: description ?? `${data.granularity} · ${data.timezone}`,
      body: (
        <div className="mt-4" style={{ height }}>
          <SeriesPlot
            series={data.series}
            columns={columns}
            kind={kind}
            stacked={stacked}
            valueFormatter={valueFormatter}
            axisFormatter={axisFormatter}
          />
        </div>
      ),
    };
  };

  const { body, description: cardDescription } = view();

  return (
    <WidgetCard
      title={title}
      description={cardDescription}
      className={className}
      action={action}
    >
      {body}
    </WidgetCard>
  );
}
