'use client';

import { Loader, Text, Title } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import type { BreakdownResponse } from '@/types/analytics-query.types';
import { AnalyticsEmpty, AnalyticsError } from './analytics-states';

export default function AnalyticsBreakdownTable({
  title,
  description,
  query,
  valueLabel = 'Value',
  valueFormatter = (value: number) => value.toLocaleString(),
  className,
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
  valueLabel?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
  action?: React.ReactNode;
}) {
  const { data, isLoading, isError, error } = query;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[260px] items-center justify-center">
          <Loader size="lg" />
        </div>
      );
    }

    if (isError) {
      return <AnalyticsError error={error} />;
    }

    const rows = data?.rows ?? [];

    if (rows.length === 0) {
      return <AnalyticsEmpty />;
    }

    return (
      <>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">
                  {data?.dimension ?? 'Item'}
                </th>
                <th className="pb-2 pr-4 text-right font-medium">
                  {valueLabel}
                </th>
                <th className="pb-2 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.key}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2.5 pr-4 text-gray-400">{index + 1}</td>
                  <td className="py-2.5 pr-4">
                    <Text className="font-medium">{row.label}</Text>
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {valueFormatter(row.value)}
                  </td>
                  <td className="w-32 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn('h-full rounded-full bg-primary')}
                          style={{ width: `${Math.min(row.share ?? 0, 100)}%` }}
                        />
                      </div>
                      <Text className="w-11 shrink-0 text-right text-xs text-gray-500">
                        {row.share ?? 0}%
                      </Text>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Share is of the rows shown, not of all time — say so rather than let a
          truncated top-N read as the whole picture. */}
        <Text className="mt-3 text-xs text-gray-400">
          Share is relative to the {rows.length} rows shown.
        </Text>
      </>
    );
  };

  return (
    <WidgetCard
      title={title}
      description={description}
      className={className}
      action={action}
    >
      {renderContent()}
    </WidgetCard>
  );
}
