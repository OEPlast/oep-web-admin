'use client';

import { useState, useMemo } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import DropdownAction from '@core/components/charts/dropdown-action';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import { formatNumber } from '@core/utils/format-number';
import { useProfitLossChart } from '@/hooks/queries/analytics/useAnalyticsCharts';

const lines = [
  { name: 'Revenue', value: 'revenue', color: '#2563eb' },
  { name: 'Expenses', value: 'expenses', color: '#60a5fa' },
  { name: 'Returns', value: 'returns', color: '#dd6773' },
];

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

export default function TotalProfitLoss({ className }: { className?: string }) {
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

  const { data, isLoading } = useProfitLossChart(dateRange);

  // Calculate totals and net profit
  const totals = useMemo(() => {
    if (!data) return { revenue: 0, expenses: 0, returns: 0, netProfit: 0, percentChange: 0 };
    
    const revenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const expenses = data.reduce((sum, item) => sum + item.expenses, 0);
    const returns = data.reduce((sum, item) => sum + item.returns, 0);
    const netProfit = revenue - expenses - returns;
    const percentChange = expenses > 0 ? (netProfit / expenses) * 100 : 0;

    return { revenue, expenses, returns, netProfit, percentChange };
  }, [data]);

  function handleChange(viewType: string) {
    setGroupBy(viewType as 'days' | 'months' | 'years');
  }

  // Format dates for display
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(item => {
      const date = new Date(item.date);
      const label = groupBy === 'days' 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      return {
        ...item,
        label,
      };
    });
  }, [data, groupBy]);

  return (
    <WidgetCard
      title="Total Profit/Loss"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      className={cn('min-h-[28rem]', className)}
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2 font-semibold">
            &#8358;{formatNumber(totals.netProfit)}
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
      action={
        <div className="flex items-center gap-5 md:justify-between">
          <Legend className="hidden @3xl:flex" />
          <DropdownAction
            options={viewOptions}
            onChange={handleChange}
            dropdownClassName="!z-0"
          />
        </div>
      }
    >
      <Legend className="mt-2 flex @3xl:hidden" />
      
      {isLoading ? (
        <div className="flex h-[28rem] items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </div>
      ) : (
        <div className="custom-scrollbar -mb-3 overflow-x-auto pb-3">
          <div className="h-[28rem] w-full pt-6 @lg:pt-8">
            <ResponsiveContainer width="100%" height="100%" minWidth={1100}>
              <ComposedChart
                data={chartData}
                margin={{
                  left: 5,
                }}
                className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
              >
                <CartesianGrid
                  vertical={false}
                  strokeOpacity={0.435}
                  strokeDasharray="8 10"
                />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
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

                {lines.map((line) => (
                  <Line
                    key={line.value}
                    type="monotone"
                    dataKey={line.value}
                    stroke={line.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
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
    <div className={cn('flex flex-wrap items-start gap-3 lg:gap-4', className)}>
      {lines.map((line) => (
        <div key={line.name} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: line.color }}
          />
          <span>{line.name}</span>
        </div>
      ))}
    </div>
  );
}
