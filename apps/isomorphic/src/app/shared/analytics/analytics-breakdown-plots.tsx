'use client';

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Text } from 'rizzui';
import type { BreakdownRow } from '@/types/analytics-query.types';
import { formatCountCompact } from './analytics-format';

/**
 * The plots a breakdown can be drawn as, and nothing else.
 *
 * Split from `analytics-breakdown-chart` so that file is only about *which*
 * state to show — loading, error, empty, or a chart — while this one is only
 * about drawing. Each plot owns its own `ResponsiveContainer`, so a caller
 * supplies a sized box and no more.
 */

/** Deliberately fixed and ordered, so the same category keeps its colour across charts. */
export const BREAKDOWN_PALETTE = [
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
];

const colorAt = (index: number) =>
  BREAKDOWN_PALETTE[index % BREAKDOWN_PALETTE.length];

export interface BreakdownPlotProps {
  rows: BreakdownRow[];
  /** Exact value, for the tooltip. */
  valueFormatter?: (value: number) => string;
  /** Axis ticks. Defaults to a compact count — an axis gutter is ~60px wide. */
  axisFormatter?: (value: number) => string;
}

/**
 * Rows already carry their own label, so the tooltip reads the row rather than
 * the `dataKey` — the shared `CustomTooltip` prints the series name, which on a
 * pie is always the literal "value".
 */
function BreakdownTooltip({
  active,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { payload: BreakdownRow; color?: string; fill?: string }[];
  valueFormatter?: (value: number) => string;
}) {
  const item = payload?.[0];
  if (!active || !item) return null;

  const row = item.payload;

  return (
    <div className="rounded-md border border-gray-300 bg-gray-0 shadow-2xl dark:bg-gray-100">
      <Text className="mb-0.5 block bg-gray-100 p-2 px-2.5 text-center font-lexend text-xs font-semibold capitalize text-gray-600 dark:bg-gray-200/60 dark:text-gray-700">
        {row.label}
      </Text>
      <div className="flex items-center px-3 py-2 text-xs">
        <span
          className="me-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: item.fill ?? item.color }}
        />
        <Text as="span" className="font-medium text-gray-900 dark:text-gray-700">
          {valueFormatter ? valueFormatter(row.value) : row.value}
        </Text>
        {/* Already a percentage — the engine divides and multiplies by 100
            before it sends it. Scaling again reported 12.74% as 1274%. */}
        {row.share !== null && (
          <Text as="span" className="ms-1.5 text-gray-500">
            ({row.share.toFixed(1)}%)
          </Text>
        )}
      </div>
    </div>
  );
}

export function BreakdownPieChart({ rows, valueFormatter }: BreakdownPlotProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius="75%"
          innerRadius="30%"
          cornerRadius="4%"
          paddingAngle={0.2}
        >
          {rows.map((row, index) => (
            <Cell key={row.key} fill={colorAt(index)} />
          ))}
        </Pie>
        <Tooltip content={<BreakdownTooltip valueFormatter={valueFormatter} />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BreakdownBarChart({
  rows,
  valueFormatter,
  axisFormatter,
}: BreakdownPlotProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-gray-200"
        />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={8} />
        {/* Compact by default: an unformatted 10,000,000 overruns the gutter and
            recharts clips it to a plausible-looking 0000000. */}
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(v) => (axisFormatter ?? formatCountCompact)(Number(v))}
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          content={<BreakdownTooltip valueFormatter={valueFormatter} />}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {rows.map((row, index) => (
            <Cell key={row.key} fill={colorAt(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
