'use client';

import { useState } from 'react';
import cn from '@core/utils/class-names';
import { Title } from 'rizzui';
import { PiCurrencyNgnDuotone, PiReceiptDuotone, PiChartLineUpDuotone, PiTagDuotone } from 'react-icons/pi';
import { useSeries, useSummary, useBreakdown } from '@/hooks/queries/analytics';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import AnalyticsSeriesChart from '@/app/shared/analytics/analytics-series-chart';
import AnalyticsSummaryCards from '@/app/shared/analytics/analytics-summary-cards';
import AnalyticsBreakdownTable from '@/app/shared/analytics/analytics-breakdown-table';
import { useMoneyFormat } from '@/app/shared/analytics/analytics-format';

export default function SalesAnalytics({ className }: { className?: string }) {
  const range = useAnalyticsRange();
  const money = useMoneyFormat();

  /**
   * Revenue now means PAID, measured on `paidAt`.
   *
   * The previous figure summed every order not cancelled or failed, dated to
   * when it was placed — so unpaid pending orders counted as income. Correcting
   * it lowers all-time revenue by about 20%; the number here is right, the old
   * one was not.
   */
  const summary = useSummary({
    metrics: ['revenue', 'orders_paid', 'aov', 'discount_given'],
    ...range.range,
    compare: 'previous',
  });

  const revenueSeries = useSeries({
    metrics: ['revenue'],
    ...range.range,
    granularity: 'auto',
    compare: 'previous',
  });

  const dateParams = {
    from: summary.data?.from ?? new Date(Date.now() - 30 * 864e5).toISOString(),
    to: summary.data?.to ?? new Date().toISOString(),
  };

  const salesByCategory = useBreakdown({
    metric: 'revenue',
    dimension: 'category',
    ...range.range,
    limit: 10,
  });

  return (
    <div
      className={cn(
        'flex flex-col gap-5 @container 2xl:gap-x-6 2xl:gap-y-7 3xl:gap-8',
        className
      )}
    >
      {/* Page Header with Date Range Filter */}
      <div className="flex flex-col gap-4 @xl:flex-row @xl:items-center @xl:justify-between">
        <div>
          <Title as="h3" className="text-xl font-semibold">
            Sales Analytics
          </Title>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive sales performance metrics and insights
          </p>
        </div>

      </div>

      <AnalyticsRangePicker range={range} />

      <AnalyticsSummaryCards
        query={summary}
        cards={[
          { metric: 'revenue', label: 'Revenue (paid)', icon: PiCurrencyNgnDuotone, format: 'currency',
            hint: 'Paid orders only, measured when payment arrived. Previously this counted unpaid pending orders and dated income to when the order was placed.' },
          { metric: 'orders_paid', label: 'Paid Orders', icon: PiReceiptDuotone },
          { metric: 'aov', label: 'Average Order Value', icon: PiChartLineUpDuotone, format: 'currency' },
          { metric: 'discount_given', label: 'Coupon Discount', icon: PiTagDuotone, format: 'currency',
            hint: 'Coupon discount only. Flash-sale discount is not captured by any code path, so it is excluded rather than silently counted as zero.' },
        ]}
      />

      <AnalyticsSeriesChart
        title="Revenue"
        query={revenueSeries}
        metrics={[{ key: 'revenue', label: 'Revenue', color: '#10b981' }]}
        height={360}
        {...money}
      />

      <AnalyticsBreakdownTable
        title="Revenue by Category"
        query={salesByCategory}
        valueLabel="Revenue"
        valueFormatter={money.valueFormatter}
      />
    </div>
  );
}
