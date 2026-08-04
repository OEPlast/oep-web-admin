'use client';

import { useState, useMemo } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { useMedia } from '@core/hooks/use-media';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import DropdownAction from '@core/components/charts/dropdown-action';
import { formatNumber } from '@core/utils/format-number';
import { useSeries } from '@/hooks/queries/analytics/useAnalyticsQuery';

const viewOptions = [
  {
    value: 'days',
    label: 'Daily',
  },
  {
    value: 'months',
    label: 'Monthly',
  },
  {
    value: 'years',
    label: 'Yearly',
  },
];

export default function RevenueExpenseChart({
  className,
}: {
  className?: string;
}) {
  const isTablet = useMedia('(max-width: 820px)', false);
  const [groupBy, setGroupBy] = useState<'days' | 'months' | 'years'>('days');

  const granularity = groupBy === 'days' ? 'day' : groupBy === 'months' ? 'month' : 'year';

  const { data, isLoading } = useSeries({
    metrics: ['revenue', 'refund_amount'],
    preset: 'last_30_days',
    granularity,
  });

  /**
   * Totals come from the response, not from summing the series.
   *
   * They are computed server-side over the whole window, which is the only
   * correct approach for averages and distinct counts and is consistent for the
   * rest. Reducing the buckets client-side also silently double-counts anything
   * the server treats as set-valued.
   */
  const totals = useMemo(() => {
    const revenue = Number(data?.totals?.revenue ?? 0);
    const expense = Number(data?.totals?.refund_amount ?? 0);
    const percentChange = expense > 0 ? ((revenue - expense) / expense) * 100 : 0;

    return { revenue, expense, percentChange };
  }, [data]);

  function handleChange(viewType: string) {
    setGroupBy(viewType as 'days' | 'months' | 'years');
  }

  /**
   * `bucketLabel` is formatted server-side in the store's timezone.
   *
   * The previous version rebuilt the label with `new Date(item.date)` in the
   * browser, so an admin in another timezone saw every bucket labelled a day
   * off from the data it contained.
   */
  const chartData = useMemo(
    () =>
      (data?.series ?? []).map((row) => ({
        key: row.bucketLabel,
        revenue: Number(row.revenue ?? 0),
        expense: Number(row.refund_amount ?? 0),
      })),
    [data]
  );

  return (
    <WidgetCard
      title="Revenue vs Returns"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2 font-semibold">
            &#8358;{formatNumber(totals.revenue)}
          </Title>
          <Text className="flex items-center leading-none text-gray-500">
            <Text
              as="span"
              className={cn(
                'me-2 inline-flex items-center font-medium',
                totals.percentChange >= 0 ? 'text-green' : 'text-red'
              )}
            >
              <TrendingUpIcon className="me-1 h-4 w-4" />
              {totals.percentChange.toFixed(2)}%
            </Text>
          </Text>
        </div>
      }
      descriptionClassName="text-gray-500 mt-1.5"
      action={
        <div className="flex items-center justify-between gap-5">
          <Legend className="hidden @2xl:flex @3xl:hidden @5xl:flex" />
          <DropdownAction options={viewOptions} onChange={handleChange} />
        </div>
      }
      className={className}
    >
      <Legend className="mt-2 flex @2xl:hidden @3xl:flex @5xl:hidden" />

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </div>
      ) : (
        <div className="custom-scrollbar overflow-x-auto">
          <div className="h-96 w-full pt-9">
            <ResponsiveContainer
              width="100%"
              height="100%"
              {...(isTablet && { minWidth: '700px' })}
            >
              <ComposedChart
                data={chartData}
                barSize={isTablet ? 20 : 24}
                className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
              >
                <defs>
                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="100%"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#A5BDEC" />
                    <stop offset="0.8" stopColor="#477DFF" />
                    <stop offset="1" stopColor="#477DFF" />
                  </linearGradient>
                </defs>
                <defs>
                  <linearGradient
                    id="colorExpense"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="100%"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#fec7dc" />
                    <stop offset="0.8" stopColor="#fc3d80" />
                    <stop offset="1" stopColor="#fc3d80" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                <XAxis dataKey="key" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={({ payload, ...rest }) => {
                    const pl = {
                      ...payload,
                      value: formatNumber(Number(payload.value)),
                    };
                    return (
                      <CustomYAxisTick
                        prefix={'&#8358;'}
                        payload={pl}
                        {...rest}
                      />
                    );
                  }}
                />
                <Tooltip
                  content={<CustomTooltip formattedNumber prefix="&#8358;" />}
                />

                <Bar
                  dataKey="revenue"
                  barSize={40}
                  fill="url(#colorRevenue)"
                  stroke="#477DFF"
                  strokeOpacity={0.3}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  type="bump"
                  dataKey="expense"
                  stroke="#fc3d80"
                  fill="url(#colorExpense)"
                  barSize={40}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

function Legend({ className }: { className?: string }) {
  return (
    <div className={cn('flex-wrap items-start gap-3 lg:gap-4', className)}>
      <span className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: `linear-gradient(180deg, #A5BDEC 0%, #477DFF 53.65%)`,
          }}
        />
        <span>Revenue</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#fc3d80]" />
        <span>Returns</span>
      </span>
    </div>
  );
}
