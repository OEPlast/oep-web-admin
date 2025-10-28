'use client';

import { useState, useMemo } from 'react';
import MetricCard from '@core/components/cards/metric-card';
import TrendingDownIcon from '@core/components/icons/trending-down';
import TrendingUpIcon from '@core/components/icons/trending-up';
import { getChartColorByEngagementRate } from '@core/components/table-utils/get-chart-color-by-engagement-rate';
import cn from '@core/utils/class-names';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Text, Loader } from 'rizzui';
import { 
  useSalesOverview, 
  useOrdersOverview, 
  useUsersOverview 
} from '@/hooks/queries/analytics/useAnalyticsOverview';
import { formatCurrency } from '@/utils/format-currency';

interface StatsCardsProps {
  className?: string;
}

export default function StatsCards({ className }: StatsCardsProps) {
  // Default to last 30 days
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  const dateParams = useMemo(() => ({
    from: thirtyDaysAgo.toISOString().split('T')[0],
    to: currentDate.toISOString().split('T')[0],
  }), []);

  // Fetch overview data
  const { data: salesData, isLoading: salesLoading } = useSalesOverview(dateParams);
  const { data: ordersData, isLoading: ordersLoading } = useOrdersOverview(dateParams);
  const { data: usersData, isLoading: usersLoading } = useUsersOverview(dateParams);

  const isLoading = salesLoading || ordersLoading || usersLoading;

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

  // Calculate returns from orders (cancelled + failed)
  const returnsCount = (ordersData?.cancelled || 0) + (ordersData?.failed || 0);

  // Calculate returns percentage change (based on cancelled + failed changes)
  const previousCancelled = Math.max(0, (ordersData?.cancelled || 0) - Math.round((ordersData?.cancelled || 0) * (ordersData?.comparisonPeriod?.percentageChange || 0) / 100));
  const previousFailed = Math.max(0, (ordersData?.failed || 0) - Math.round((ordersData?.failed || 0) * (ordersData?.comparisonPeriod?.percentageChange || 0) / 100));
  const previousReturns = previousCancelled + previousFailed;
  const returnsPercentageChange = previousReturns > 0
    ? ((returnsCount - previousReturns) / previousReturns) * 100
    : returnsCount > 0 ? 100 : 0;

  const statsData = [
    {
      id: 1,
      title: 'Orders',
      metric: (ordersData?.totalOrders || 0).toLocaleString(),
      fill: '#3872FA',
      percentage: Math.abs(ordersData?.comparisonPeriod?.percentageChange || 0),
      increased: (ordersData?.comparisonPeriod?.percentageChange || 0) > 0,
      decreased: (ordersData?.comparisonPeriod?.percentageChange || 0) < 0,
      value: `${(ordersData?.comparisonPeriod?.percentageChange || 0) > 0 ? '+' : ''}${ordersData?.comparisonPeriod?.percentageChange?.toFixed(2) || '0.00'}`,
      engagementRate: 70.03,
      chart: [],
    },
    {
      id: 2,
      title: 'Sales',
      metric: formatCurrency(salesData?.totalRevenue || 0),
      fill: '#10B981',
      percentage: Math.abs(salesData?.comparisonPeriod?.percentageChange || 0),
      increased: (salesData?.comparisonPeriod?.percentageChange || 0) > 0,
      decreased: (salesData?.comparisonPeriod?.percentageChange || 0) < 0,
      value: `${(salesData?.comparisonPeriod?.percentageChange || 0) > 0 ? '+' : ''}${salesData?.comparisonPeriod?.percentageChange?.toFixed(2) || '0.00'}`,
      engagementRate: 85.5,
      chart: [],
    },
    {
      id: 3,
      title: 'Returns',
      metric: returnsCount.toLocaleString(),
      fill: '#F59E0B',
      percentage: Math.abs(returnsPercentageChange),
      increased: returnsPercentageChange > 0,
      decreased: returnsPercentageChange < 0,
      value: `${returnsPercentageChange > 0 ? '+' : ''}${returnsPercentageChange.toFixed(2)}`,
      engagementRate: 45.2,
      chart: [],
    },
    {
      id: 4,
      title: 'Customers',
      metric: (usersData?.totalUsers || 0).toLocaleString(),
      fill: '#8B5CF6',
      percentage: Math.abs(usersData?.comparisonPeriod?.percentageChange || 0),
      increased: (usersData?.comparisonPeriod?.percentageChange || 0) > 0,
      decreased: (usersData?.comparisonPeriod?.percentageChange || 0) < 0,
      value: `${(usersData?.comparisonPeriod?.percentageChange || 0) > 0 ? '+' : ''}${usersData?.comparisonPeriod?.percentageChange?.toFixed(2) || '0.00'}`,
      engagementRate: 65.8,
      chart: [],
    },
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
