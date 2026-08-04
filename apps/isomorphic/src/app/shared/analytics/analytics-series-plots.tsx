'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Text } from 'rizzui';
import type { SeriesRow } from '@/types/analytics-query.types';
import { formatCountCompact } from './analytics-format';

export type SeriesChartKind = 'area' | 'bar' | 'line';

export interface SeriesChartMetric {
  key: string;
  label: string;
  color: string;
}

/** Colours for a dimensioned series, where categories are only known at runtime. */
const CATEGORY_PALETTE = [
  '#3872FA',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
  '#14B8A6',
  '#A855F7',
];

const [, GREEN, AMBER, RED, VIOLET] = CATEGORY_PALETTE;

/**
 * Categories whose colour carries meaning rather than just separating them.
 *
 * Positional assignment gave `failed` the green slot purely because it sorts
 * second — an operator scanning the chart reads green as healthy, so the colour
 * actively contradicted the data. Outcome categories get a fixed colour; every
 * other category still falls through to the palette in order.
 */
const SEMANTIC_COLORS: Record<string, string> = {
  completed: GREEN,
  delivered: GREEN,
  paid: GREEN,
  success: GREEN,
  successful: GREEN,
  failed: RED,
  cancelled: RED,
  canceled: RED,
  pending: AMBER,
  processing: AMBER,
  refunded: VIOLET,
};

/**
 * Colour per column: fixed where the category has a meaning, palette otherwise.
 *
 * Semantic picks are reserved before the fallback runs, so an unnamed category
 * cannot land on the same green as `completed` and make two series
 * indistinguishable.
 */
export const assignColors = (labels: string[]): string[] => {
  const semantic = labels.map(
    (label) => SEMANTIC_COLORS[label.trim().toLowerCase()]
  );
  const used = new Set(semantic.filter(Boolean));
  let cursor = 0;

  const nextFree = () => {
    for (let step = 0; step < CATEGORY_PALETTE.length; step += 1) {
      const color = CATEGORY_PALETTE[(cursor + step) % CATEGORY_PALETTE.length];
      if (!used.has(color)) {
        cursor += step + 1;
        used.add(color);
        return color;
      }
    }
    // More categories than colours — reuse rather than render nothing.
    const color = CATEGORY_PALETTE[cursor % CATEGORY_PALETTE.length];
    cursor += 1;
    return color;
  };

  return semantic.map((color) => color ?? nextFree());
};

/** Rounding on the top of a stack, so only the topmost segment is curved. */
const STACK_TOP_RADIUS: [number, number, number, number] = [5, 5, 0, 0];

/**
 * Tooltip rows are named from the series `name`, not its `dataKey`.
 *
 * A dimensioned series keys its columns `<metric>__<category>` to keep the
 * response flat, so the shared `CustomTooltip` — which prints the `dataKey` —
 * reads "Transactions_count__completed". The category is what the operator is
 * looking at, and it is already on the series as its display name.
 */
function SeriesTooltip({
  active,
  label,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number; color?: string; fill?: string }[];
  valueFormatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100">
      <Text className="mb-0.5 block bg-gray-100 p-2 px-2.5 text-center font-lexend text-xs font-semibold text-gray-600 dark:bg-gray-200/60 dark:text-gray-700">
        {label}
      </Text>
      <div className="px-3 py-1.5 text-xs">
        {payload.map((item, index) => (
          <div
            key={`${item.name ?? index}`}
            className="flex items-center py-1.5"
          >
            <span
              className="me-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill ?? item.color }}
            />
            <Text as="span" className="capitalize">
              {item.name}:
            </Text>{' '}
            <Text
              as="span"
              className="ms-1 font-medium text-gray-900 dark:text-gray-700"
            >
              {valueFormatter
                ? valueFormatter(Number(item.value ?? 0))
                : item.value}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface SeriesPlotProps {
  series: SeriesRow[];
  /** Already resolved and coloured by the caller — one mark is drawn per column. */
  columns: SeriesChartMetric[];
  kind: SeriesChartKind;
  stacked?: boolean;
  /** Exact value, for the tooltip. */
  valueFormatter?: (value: number) => string;
  /** Axis ticks. Defaults to a compact count — an axis gutter is ~60px wide. */
  axisFormatter?: (value: number) => string;
}

export function SeriesPlot({
  series,
  columns,
  kind,
  stacked = false,
  valueFormatter,
  axisFormatter,
}: SeriesPlotProps) {
  /**
   * Whether this column is the highest one with a value in this bucket.
   *
   * A stack's top segment changes bucket to bucket — a week with no pending
   * transactions is topped by `failed`. Rounding the last *column* instead put
   * the corner on a zero-height rectangle and left those bars square.
   */
  const isTopOfStack = (row: Record<string, unknown>, index: number) =>
    columns
      .slice(index + 1)
      .every((column) => Number(row?.[column.key] ?? 0) === 0);

  const Chart =
    kind === 'bar' ? BarChart : kind === 'line' ? LineChart : AreaChart;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {columns.map((metric) => (
            <linearGradient
              key={metric.key}
              id={`fill-${metric.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={metric.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-gray-200"
        />
        {/* Rendered verbatim — formatted server-side in the store timezone. */}
        <XAxis
          dataKey="bucketLabel"
          tickLine={false}
          axisLine={false}
          minTickGap={16}
        />
        {/* Compact by default: an unformatted 10,000,000 overruns the gutter and
            recharts clips it to a plausible-looking 0000000. */}
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(v) =>
            (axisFormatter ?? formatCountCompact)(Number(v))
          }
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          content={<SeriesTooltip valueFormatter={valueFormatter} />}
        />
        {columns.length > 1 && <Legend />}

        {columns.map((metric, index) =>
          kind === 'bar' ? (
            <Bar
              key={metric.key}
              dataKey={metric.key}
              name={metric.label}
              fill={metric.color}
              stackId={stacked ? 'a' : undefined}
              radius={stacked ? undefined : [4, 4, 0, 0]}
              // Which column is on top varies per bucket, so the corner is
              // decided per rectangle rather than fixed to the last series.
              shape={
                stacked
                  ? (props: any) => (
                      <Rectangle
                        {...props}
                        radius={
                          isTopOfStack(props.payload, index)
                            ? STACK_TOP_RADIUS
                            : 0
                        }
                      />
                    )
                  : undefined
              }
            />
          ) : kind === 'line' ? (
            <Line
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              name={metric.label}
              stroke={metric.color}
              dot={false}
              strokeWidth={2}
            />
          ) : (
            <Area
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              name={metric.label}
              stroke={metric.color}
              strokeWidth={2}
              stackId={stacked ? 'a' : undefined}
              fill={`url(#fill-${metric.key})`}
            />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
