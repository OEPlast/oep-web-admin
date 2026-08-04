'use client';

import { useState, useMemo } from 'react';
import MetricCard from '@core/components/cards/metric-card';
import TrendingDownIcon from '@core/components/icons/trending-down';
import TrendingUpIcon from '@core/components/icons/trending-up';
import { getChartColorByEngagementRate } from '@core/components/table-utils/get-chart-color-by-engagement-rate';
import cn from '@core/utils/class-names';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Text, Loader } from 'rizzui';
import { useSummary } from '@/hooks/queries/analytics/useAnalyticsQuery';
import { formatCurrency } from '@/utils/format-currency';

interface StatsCardsProps {
  className?: string;
}

export default function StatsCards({ className }: StatsCardsProps) {
  /**
   * One request for all four cards.
   *
   * Previously three separate overview calls, each computing its own comparison
   * period by subtracting elapsed milliseconds — which straddles month
   * boundaries — and each sending a browser-local date. The engine resolves the
   * preset in the store timezone and shifts the comparison by whole calendar
   * units.
   */
  const { data, isLoading } = useSummary({
    metrics: ['orders_placed', 'revenue', 'cancellations', 'active_users'],
    preset: 'last_30_days',
    compare: 'previous',
  });

  const totals = data?.totals ?? {};
  const changes = data?.comparison?.changePct ?? {};

  const num = (key: string) => Number(totals[key] ?? 0);
  /** A null baseline means "no prior data", which is not the same as 0% growth. */
  const pct = (key: string) => changes[key] ?? null;

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 gap-5 @container @xs:grid-cols-2 @6xl:grid-cols-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-[150px] items-center justify-center rounded-lg border border-gray-200 bg-white">
            <Loader variant="spinner" size="lg" />
          </div>
        ))}
      </div>
    );
  }

  const card = (
    id: number,
    title: string,
    metricKey: string,
    metric: string,
    fill: string,
    engagementRate: number
  ) => {
    const change = pct(metricKey);

    return {
      id,
      title,
      metric,
      fill,
      percentage: change === null ? 0 : Math.abs(change),
      increased: change !== null && change > 0,
      decreased: change !== null && change < 0,
      value: change === null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(2)}`,
      engagementRate,
      chart: [] as Array<{ count: number }>,
    };
  };

  const statsData = [
    card(1, 'Orders', 'orders_placed', num('orders_placed').toLocaleString(), '#3872FA', 70.03),
    // Revenue means paid, measured on paidAt — this figure is lower than the
    // one this card used to show, and correct where that one was not.
    card(2, 'Sales', 'revenue', formatCurrency(num('revenue')), '#10B981', 85.5),
    // Was labelled "Returns" while actually summing cancelled + failed orders,
    // against a percentage derived from itself. It is a cancellation count, so
    // it now says so.
    card(3, 'Cancelled', 'cancellations', num('cancellations').toLocaleString(), '#F59E0B', 45.2),
    // Distinct customers who ordered in the window, not the size of the user
    // table — the previous card showed a total that never moved with the period.
    card(4, 'Active Customers', 'active_users', num('active_users').toLocaleString(), '#8B5CF6', 65.8),
  ];

  return (
    <div className={cn('grid grid-cols-1 gap-5 @container @xs:grid-cols-2 @6xl:grid-cols-4', className)}>
      {statsData.map((stat) => (
        <MetricCard
          key={stat.id}
          title={stat.title}
          metric={stat.metric}
          metricClassName="lg:text-[22px]"
          className="@lg:pb-5"
          chart={
            stat.chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stat.chart}
                  margin={{ top: -60, right: 0, left: 0, bottom: -60 }}
                  className="h-auto w-full [&_.recharts-surface]:!h-auto [&_.recharts-surface]:!w-auto"
                >
                  <defs>
                    <linearGradient id={stat.id.toString()} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={getChartColorByEngagementRate(stat.engagementRate)}
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor={stat.fill} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="count"
                    stroke={getChartColorByEngagementRate(stat.engagementRate)}
                    strokeWidth={1.8}
                    fillOpacity={1}
                    fill={`url(#${stat.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-20 w-full" /> 
            )
          }
          chartClassName="@7xl:h-24 @7xl:w-36"
        >
          {stat.value && (
            <Text className="mt-5 flex items-center text-xs font-medium leading-none text-gray-500 @2xl:text-sm">
              <Text
                as="span"
                className={cn(
                  'me-2 inline-flex items-center font-bold',
                  stat.increased && 'text-green-dark',
                  stat.decreased && 'text-red-dark'
                )}
              >
                {stat.increased && <TrendingUpIcon className="me-1 h-auto w-3" />}
                {stat.decreased && <TrendingDownIcon className="me-1 h-auto w-3" />}
                {stat.value}%
              </Text>
              <span className='text-xs '>last 30 days</span>
            </Text>
          )}
        </MetricCard>
      ))}
    </div>
  );
}
