/**
 * Coupons Analytics Client Component
 * 
 * Displays comprehensive coupon analytics including:
 * - Overview metrics (total coupons, active, redemptions, discounts)
 * - Coupon redemption trend over time
 * - Coupon type distribution (percentage vs fixed)
 * - Top performing coupons table
 */

'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import {
  PiTicketDuotone,
  PiTagDuotone,
  PiCheckCircleDuotone,
  PiStackDuotone,
} from 'react-icons/pi';
import { useSeries, useSummary, useBreakdown } from '@/hooks/queries/analytics';
import AnalyticsBreakdownChart from '@/app/shared/analytics/analytics-breakdown-chart';
import AnalyticsBreakdownTable from '@/app/shared/analytics/analytics-breakdown-table';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import AnalyticsSeriesChart from '@/app/shared/analytics/analytics-series-chart';
import AnalyticsSummaryCards from '@/app/shared/analytics/analytics-summary-cards';

const pageHeader = {
  title: 'Coupons Analytics',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      href: '/analytics',
      name: 'Analytics',
    },
    {
      name: 'Coupons',
    },
  ],
};

export default function CouponsAnalyticsClient() {
  const range = useAnalyticsRange();

  // Rankings take a limit, not a page: page 2 of a top-10 is not a top-10.
  const [limit] = useState(10);

  const summary = useSummary({
    metrics: ['coupon_redemptions', 'discount_given', 'active_coupons', 'total_coupons'],
    ...range.range,
    compare: 'previous',
  });

  const trend = useSeries({
    metrics: ['coupon_redemptions'],
    ...range.range,
    granularity: 'auto',
    compare: 'previous',
  });

  // Coupon type is a split of what exists now, not of the period — the metric
  // behind it is a stock metric, so the date range correctly does not apply.
  const typeBreakdown = useBreakdown({
    metric: 'total_coupons',
    dimension: 'coupon_type',
    ...range.range,
  });

  const topCoupons = useBreakdown({
    metric: 'coupon_redemptions',
    dimension: 'coupon',
    ...range.range,
    limit,
  });

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <AnalyticsRangePicker range={range} />

      <AnalyticsSummaryCards
        className="mb-6"
        query={summary}
        cards={[
          { metric: 'coupon_redemptions', label: 'Redemptions', icon: PiTicketDuotone },
          {
            metric: 'discount_given',
            label: 'Discount Given',
            icon: PiTagDuotone,
            format: 'currency',
            hint: 'Coupon discount only. Flash-sale discount is never written by any code path, so it is excluded rather than silently counted as zero.',
          },
          {
            metric: 'active_coupons',
            label: 'Active Coupons',
            icon: PiCheckCircleDuotone,
            isStock: true,
          },
          {
            metric: 'total_coupons',
            label: 'Total Coupons',
            icon: PiStackDuotone,
            isStock: true,
          },
        ]}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 mb-6 @container lg:grid-cols-2">
        <AnalyticsSeriesChart
          title="Coupon Redemptions"
          query={trend}
          metrics={[{ key: 'coupon_redemptions', label: 'Redemptions', color: '#ec4899' }]}
        />
        <AnalyticsBreakdownChart
          title="Coupon Types"
          description="All non-deleted coupons, as of now"
          query={typeBreakdown}
          kind="pie"
        />
      </div>

      <AnalyticsBreakdownTable
        title="Top Coupons"
        description="By redemptions in the selected period"
        query={topCoupons}
        valueLabel="Redemptions"
      />
    </>
  );
}
