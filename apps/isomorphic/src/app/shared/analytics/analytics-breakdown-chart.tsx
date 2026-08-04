'use client';

import { Loader } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import type { BreakdownResponse } from '@/types/analytics-query.types';
import {
  BreakdownBarChart,
  BreakdownPieChart,
} from './analytics-breakdown-plots';
import { AnalyticsEmpty, AnalyticsError } from './analytics-states';

/**
 * Shared chart for `/breakdown` results — one metric split by one dimension.
 *
 * Replaces nine hand-rolled Recharts files that each re-declared their own data
 * shape inline and each mapped a bespoke response into `{name, value}`. Rows
 * arrive pre-sorted and pre-labelled from the server (including ObjectId → name
 * resolution), so there is nothing left for a chart to derive.
 *
 * This file decides *which state* to show; `analytics-breakdown-plots` draws the
 * charts. The card itself is rendered once, at the bottom — its title,
 * description and action are identical in every state, and four copies of them
 * meant a change to the header had four places to miss.
 */
export default function AnalyticsBreakdownChart({
  title,
  description,
  query,
  kind = 'pie',
  height = 320,
  className,
  valueFormatter,
  axisFormatter,
  action,
}: {
  title: string;
  description?: string;
  query: {
    data?: BreakdownResponse;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };
  kind?: 'pie' | 'bar';
  height?: number;
  className?: string;
  /** Exact value, for the tooltip. */
  valueFormatter?: (value: number) => string;
  /** Axis ticks. Defaults to a compact count — an axis gutter is ~60px wide. */
  axisFormatter?: (value: number) => string;
  action?: React.ReactNode;
}) {
  const { data, isLoading, isError, error } = query;
  const rows = data?.rows ?? [];

  /**
   * Ordered by precedence, not by likelihood: a request still in flight has no
   * rows yet, so testing emptiness before loading would report "no activity"
   * for every chart on its first paint.
   */
  const content = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <Loader size="lg" />
        </div>
      );
    }

    if (isError) {
      return <AnalyticsError error={error} />;
    }

    if (rows.length === 0) {
      return (
        <div style={{ height }}>
          <AnalyticsEmpty />
        </div>
      );
    }

    return (
      <div className="mt-4" style={{ height }}>
        {kind === 'pie' ? (
          <BreakdownPieChart rows={rows} valueFormatter={valueFormatter} />
        ) : (
          <BreakdownBarChart
            rows={rows}
            valueFormatter={valueFormatter}
            axisFormatter={axisFormatter}
          />
        )}
      </div>
    );
  };

  return (
    <WidgetCard
      title={title}
      description={description}
      className={className}
      action={action}
    >
      {content()}
    </WidgetCard>
  );
}
