'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { useMedia } from '@core/hooks/use-media';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import DropdownAction from '@core/components/charts/dropdown-action';
import { formatNumber } from '@core/utils/format-number';

const monthlyData = [
  {
    key: 'Jan',
    revenue: 5000,
    orders: 1500,
  },
  {
    key: 'Feb',
    revenue: 4600,
    orders: 3798,
  },
  {
    key: 'Mar',
    revenue: 5900,
    orders: 1300,
  },
  {
    key: 'Apr',
    revenue: 5780,
    orders: 3908,
  },
  {
    key: 'May',
    revenue: 4890,
    orders: 2500,
  },
  {
    key: 'Jun',
    revenue: 8000,
    orders: 3200,
  },
  {
    key: 'Jul',
    revenue: 4890,
    orders: 2500,
  },
  {
    key: 'Aug',
    revenue: 3780,
    orders: 3908,
  },
  {
    key: 'Sep',
    revenue: 7800,
    orders: 2800,
  },
  {
    key: 'Oct',
    revenue: 5780,
    orders: 1908,
  },
  {
    key: 'Nov',
    revenue: 2780,
    orders: 3908,
  },
  {
    key: 'Dec',
    revenue: 7500,
    orders: 3000,
  },
];

const dailyData = [
  {
    key: 'Sat',
    revenue: 3500,
    orders: 1500,
  },
  {
    key: 'Sun',
    revenue: 4600,
    orders: 3798,
  },
  {
    key: 'Mon',
    revenue: 5900,
    orders: 1300,
  },
  {
    key: 'Tue',
    revenue: 5780,
    orders: 3908,
  },
  {
    key: 'Wed',
    revenue: 4890,
    orders: 2500,
  },
  {
    key: 'Thu',
    revenue: 8000,
    orders: 3200,
  },
  {
    key: 'Fri',
    revenue: 4890,
    orders: 2500,
  },
];

const viewOptions = [
  {
    value: 'Daily',
    label: 'Daily',
  },
  {
    value: 'Weekly',
    label: 'Weekly',
  },
  {
    value: 'Monthly',
    label: 'Monthly',
  },
  {
    value: 'Yearly',
    label: 'Yearly',
  },
];

export default function RevenueOrders({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 820px)', false);
  const [data, setData] = useState(dailyData);

  function handleChange(viewType: string) {
    console.log('viewType', viewType);
    if (viewType === 'Daily') {
      setData(dailyData);
    } else {
      setData(monthlyData);
    }
  }

  return (
    <WidgetCard
      title="Revenue vs Orders"
      titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2 font-semibold">
            &#8358;83.45k
          </Title>
          <Text className="flex items-center leading-none text-gray-500">
            <Text
              as="span"
              className={cn(
                'me-2 inline-flex items-center font-medium text-green'
              )}
            >
              <TrendingUpIcon className="me-1 h-4 w-4" />
              32.40%
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
      <div className="custom-scrollbar overflow-x-auto">
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <ComposedChart
              data={data}
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
                  id="colorOrders"
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
                dataKey="orders"
                stroke="#FCB03D"
                fill="url(#colorOrders)"
                barSize={40}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
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
        <span>Orders</span>
      </span>
    </div>
  );
}
