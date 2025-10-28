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
import { useRevenueExpenseChart } from '@/hooks/queries/analytics/useAnalyticsCharts';

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

export default function RevenueExpenseChart({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 820px)', false);
  const [groupBy, setGroupBy] = useState<'days' | 'months' | 'years'>('months');

  // Default: Last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const dateRange = useMemo(() => ({
    from: thirtyDaysAgo.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0],
    groupBy,
  }), [groupBy]);

  const { data, isLoading } = useRevenueExpenseChart(dateRange);

  // Calculate totals for display
  const totals = useMemo(() => {
    if (!data) return { revenue: 0, expense: 0, percentChange: 0 };
    
    const revenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const expense = data.reduce((sum, item) => sum + item.expense, 0);
    const percentChange = expense > 0 ? ((revenue - expense) / expense) * 100 : 0;

    return { revenue, expense, percentChange };
  }, [data]);

  function handleChange(viewType: string) {
    setGroupBy(viewType as 'days' | 'months' | 'years');
  }

  // Format dates for display
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(item => {
      const date = new Date(item.date);
      const key = groupBy === 'days' 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      return {
        ...item,
        key,
      };
    });
  }, [data, groupBy]);

  return (
    <WidgetCard
      title="Revenue vs Expenses"
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
                    <stop offset="0" stopColor="#fef3c7" />
                    <stop offset="0.8" stopColor="#FCB03D" />
                    <stop offset="1" stopColor="#FCB03D" />
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
                  stroke="#FCB03D"
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
        <span className="h-2.5 w-2.5 rounded-full bg-[#F5A623]" />
        <span>Expenses</span>
      </span>
    </div>
  );
}
